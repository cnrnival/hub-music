/**
 * Hub Music - AlbumsTab
 * Aba de álbuns da biblioteca
 * Library albums tab
 *
 * @languages pt-BR / en-US
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { cn } from '../../../../../lib/utils';
import { api } from '../../../../../lib/api';
import { useLibraryStore } from '../../../../../state/libraryStore';
import { useAuth } from '../../../../../hooks/auth/useAuth';
import { AlbumCard } from '../../../../../components/album/AlbumCard';
import { AlbumRow } from '../../../../../components/album/AlbumRow';
import { AlbumSkeleton } from '../../../../../components/album/AlbumSkeleton';
import { EmptyState } from '../../../../../components/common/EmptyState';
import { Plus, Album } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function AlbumsTab() {
  const { user } = useAuth();
  const { viewMode, filters, sortBy, sortOrder } = useLibraryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['library', 'albums', user?.id, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.axios.get(`/users/${user?.id}/albums`, {
        params: { page: pageParam, limit: 50, q: filters.search },
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

  const albums = useMemo(() => data?.pages.flatMap((page) => page.albums) || [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
        {[...Array(4)].map((_, i) => (
          viewMode === 'grid' ? <AlbumSkeleton key={i} /> : <AlbumSkeleton key={i} variant="compact" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={Album}
        title="Erro ao carregar álbuns"
        description="Tente novamente mais tarde"
        action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
      />
    );
  }

  if (albums.length === 0) {
    return (
      <EmptyState
        icon={Album}
        title={filters.search ? `Nenhum álbum encontrado para "${filters.search}"` : 'Nenhum álbum salvo ainda'}
        description={filters.search ? 'Tente buscar com outros termos' : 'Salve álbuns para vê-los aqui'}
        action={!filters.search && (
          <Button variant="ghost" onClick={() => window.location.href = '/search'}>
            <Plus className="w-4 h-4 mr-2" />
            Explorar álbuns
          </Button>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {albums.map((album) => (
            <AlbumRow key={album.id} album={album} variant="compact" />
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
}export default AlbumsTab;
