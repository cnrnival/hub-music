/**
 * Hub Music - TracksTab
 * Aba de faixas da biblioteca (grid/list, virtualized)
 * Library tracks tab (grid/list, virtualized)
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
import { TrackCard } from '../../../../../components/track/TrackCard';
import { TrackRow } from '../../../../../components/track/TrackRow';
import { TrackSkeleton } from '../../../../../components/track/TrackSkeleton';
import { EmptyState } from '../../../../../components/common/EmptyState';
import { Plus, Music, Heart } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function TracksTab() {
  const { user } = useAuth();
  const { play } = usePlayer();
  const { viewMode, filters, sortBy, sortOrder } = useLibraryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['library', 'tracks', user?.id, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        limit: 50,
        sortBy,
        sortOrder,
        userId: user?.id,
      };
      if (filters.genre) params.genreId = filters.genre;
      if (filters.source && filters.source !== 'all') params.source = filters.source.toUpperCase();
      if (filters.search) params.q = filters.search;

      const response = await api.getTracks(params);
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

  const tracks = useMemo(() => data?.pages.flatMap((page) => page.tracks) || [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'space-y-2'}>
        {[...Array(6)].map((_, i) => (
          viewMode === 'grid' ? <TrackSkeleton key={i} variant="compact" /> : <TrackSkeleton key={i} variant="list" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={Music}
        title="Erro ao carregar faixas"
        description="Tente novamente mais tarde"
        action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
      />
    );
  }

  if (tracks.length === 0) {
    return (
      <EmptyState
        icon={Music}
        title={filters.search ? `Nenhuma faixa encontrada para "${filters.search}"` : 'Você ainda não enviou nenhuma faixa'}
        description={filters.search ? 'Tente buscar com outros termos' : 'Comece enviando sua primeira música'}
        action={!filters.search && (
          <Button onClick={() => window.location.href = '/upload'}>
            <Plus className="w-4 h-4 mr-2" />
            Enviar primeira faixa
          </Button>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} variant="compact" onPlay={() => play(track)} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} onPlay={() => play(track)} />
          ))}
        </div>
      )}

      {/* Load more */}
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