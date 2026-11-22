/**
 * Hub Music - EpisodesTab
 * Aba de episódios da biblioteca (podcasts)
 * Library episodes tab (podcasts)
 *
 * @languages pt-BR / en-US
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { cn } from '../../../../../lib/utils';
import { api } from '../../../../../lib/api';
import { useLibraryStore } from '../../../../../state/libraryStore';
import { useAuth } from '../../../../../hooks/auth/useAuth';
import { EmptyState } from '../../../../../components/common/EmptyState';
import { Mic, Clock } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function EpisodesTab() {
  const { user } = useAuth();
  const { viewMode, filters, sortBy, sortOrder } = useLibraryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['library', 'episodes', user?.id, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.axios.get(`/users/${user?.id}/episodes`, {
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

  const episodes = useMemo(() => data?.pages.flatMap((page) => page.episodes) || [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-background-tertiary/50">
            <div className="w-12 h-12 rounded-lg bg-background-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-background-tertiary rounded w-1/2" />
              <div className="h-3 bg-background-tertiary rounded w-1/3" />
            </div>
            <div className="w-24 h-4 bg-background-tertiary rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={Mic}
        title="Erro ao carregar episódios"
        description="Tente novamente mais tarde"
        action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
      />
    );
  }

  if (episodes.length === 0) {
    return (
      <EmptyState
        icon={Mic}
        title={filters.search ? `Nenhum episódio encontrado para "${filters.search}"` : 'Nenhum episódio salvo ainda'}
        description={filters.search ? 'Tente buscar com outros termos' : 'Salve episódios de podcasts para vê-los aqui'}
        action={!filters.search && (
          <Button variant="ghost" onClick={() => window.location.href = '/search'}>
            <Clock className="w-4 h-4 mr-2" />
            Explorar podcasts
          </Button>
        )}
      />
    );
  }

  return (
    <div className="space-y-2">
      {episodes.map((episode) => (
        <div key={episode.id} className="card-interactive p-3 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
            {episode.coverUrl ? (
              <img src={episode.coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{episode.title}</p>
            <p className="text-caption text-text-secondary truncate">{episode.show?.title || 'Podcast'}</p>
          </div>
          <div className="text-caption text-text-muted">{episode.duration ? formatDuration(episode.duration) : ''}</div>
        </div>
      ))}

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

import { formatDuration } from '../../../../../lib/utils';export default EpisodesTab;
