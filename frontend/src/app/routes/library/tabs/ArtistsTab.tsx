/**
 * Hub Music - ArtistsTab
 * Aba de artistas da biblioteca (artistas seguidos)
 * Library artists tab (followed artists)
 *
 * @languages pt-BR / en-US
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { cn } from '../../../../../lib/utils';
import { api } from '../../../../../lib/api';
import { useLibraryStore } from '../../../../../state/libraryStore';
import { useAuth } from '../../../../../hooks/auth/useAuth';
import { ArtistCard } from '../../../../../components/artist/ArtistCard';
import { ArtistRow } from '../../../../../components/artist/ArtistRow';
import { ArtistSkeleton } from '../../../../../components/artist/ArtistSkeleton';
import { EmptyState } from '../../../../../components/common/EmptyState';
import { Plus, User, UserPlus } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function ArtistsTab() {
  const { user } = useAuth();
  const { viewMode, filters, sortBy, sortOrder } = useLibraryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['library', 'artists', user?.id, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.axios.get(`/users/${user?.id}/following`, {
        params: { page: pageParam, limit: 50, type: 'artist', q: filters.search },
      });
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

  const artists = useMemo(() => data?.pages.flatMap((page) => page.artists) || [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
        {[...Array(4)].map((_, i) => (
          viewMode === 'grid' ? <ArtistSkeleton key={i} /> : <ArtistSkeleton key={i} variant="compact" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={User}
        title="Erro ao carregar artistas"
        description="Tente novamente mais tarde"
        action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
      />
    );
  }

  if (artists.length === 0) {
    return (
      <EmptyState
        icon={User}
        title={filters.search ? `Nenhum artista encontrado para "${filters.search}"` : 'Você não segue nenhum artista ainda'}
        description={filters.search ? 'Tente buscar com outros termos' : 'Comece a seguir artistas para vê-los aqui'}
        action={!filters.search && (
          <Button variant="ghost" onClick={() => window.location.href = '/search'}>
            <UserPlus className="w-4 h-4 mr-2" />
            Explorar artistas
          </Button>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {artists.map((artist) => (
            <ArtistRow key={artist.id} artist={artist} variant="compact" />
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