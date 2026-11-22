/**
 * Hub Music - PlaylistsTab
 * Aba de playlists da biblioteca
 * Library playlists tab
 *
 * @languages pt-BR / en-US
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { cn } from '../../../../../lib/utils';
import { api } from '../../../../../lib/api';
import { useLibraryStore } from '../../../../../state/libraryStore';
import { useAuth } from '../../../../../hooks/auth/useAuth';
import { usePlayer } from '../../../../../hooks/player/usePlayer';
import { PlaylistCard } from '../../../../../components/playlist/PlaylistCard';
import { PlaylistRow } from '../../../../../components/playlist/PlaylistRow';
import { PlaylistSkeleton } from '../../../../../components/playlist/PlaylistSkeleton';
import { EmptyState } from '../../../../../components/common/EmptyState';
import { Plus, ListMusic } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function PlaylistsTab() {
  const { user } = useAuth();
  const { play } = usePlayer();
  const { viewMode, filters, sortBy, sortOrder } = useLibraryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['library', 'playlists', user?.id, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        limit: 50,
        sortBy,
        sortOrder,
        userId: user?.id,
      };
      if (filters.search) params.q = filters.search;

      const response = await api.getPlaylists(params);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!user,
    initialPageParam: 1,
  });

  const playlists = useMemo(() => data?.pages.flatMap((page) => page.playlists) || [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
        {[...Array(4)].map((_, i) => (
          viewMode === 'grid' ? <PlaylistSkeleton key={i} /> : <PlaylistSkeleton key={i} variant="compact" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={ListMusic}
        title="Erro ao carregar playlists"
        description="Tente novamente mais tarde"
        action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
      />
    );
  }

  if (playlists.length === 0) {
    return (
      <EmptyState
        icon={ListMusic}
        title={filters.search ? `Nenhuma playlist encontrada para "${filters.search}"` : 'Nenhuma playlist criada ainda'}
        description={filters.search ? 'Tente buscar com outros termos' : 'Crie sua primeira playlist'}
        action={!filters.search && (
          <Button onClick={() => window.location.href = '/playlist/create'}>
            <Plus className="w-4 h-4 mr-2" />
            Criar playlist
          </Button>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} playlist={playlist} variant="compact" />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="w-full max-w-md"
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  );
}