/**
 * Hub Music - RecentsTab
 * Aba de reproduzidos recentemente (=== xpui-routes-recents ===)
 * Recently played tab
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
import { Clock, Play } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';

export function RecentsTab() {
  const { user } = useAuth();
  const { play } = usePlayer();
  const { viewMode, filters, sortBy, sortOrder } = useLibraryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['library', 'recents', user?.id, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.axios.get(`/users/${user?.id}/recents`, {
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

  const recents = useMemo(() => data?.pages.flatMap((page) => page.tracks) || [], [data]);

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
        icon={Clock}
        title="Erro ao carregar recentes"
        description="Tente novamente mais tarde"
        action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
      />
    );
  }

  if (recents.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nenhum histórico de reprodução"
        description="Suas músicas tocadas recentemente aparecerão aqui"
        action={<Button variant="ghost" onClick={() => window.location.href = '/'}>
          <Play className="w-4 h-4 mr-2" />
          Descobrir músicas
        </Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {recents.map((track) => (
            <TrackCard key={track.id} track={track} variant="compact" onPlay={() => play(track)} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {recents.map((track, index) => (
            <TrackRow key={track.id} track={track} index={index + 1} onPlay={() => play(track)} />
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