/**
 * Hub Music - EpisodesTab
 * Aba de episódios/podcasts na biblioteca
 * Episodes/Podcasts tab in library
 *
 * @languages pt-BR / en-US
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Heart, Clock, Download, MoreHorizontal, Grid, List, Filter, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDuration, formatDate, formatCount } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Badge } from '@/common/Badge';
import { DropdownMenu } from '@/common/DropdownMenu';
import { Skeleton } from '@/ui/skeleton';
import { EmptyState } from '@/common/EmptyState';
import { VirtualList } from '@/common/VirtualList';
import { TrackRow } from '@/components/track/TrackRow';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';
import { useLibraryStore } from '@/state/libraryStore';

interface Episode {
  id: string;
  title: string;
  show: {
    id: string;
    title: string;
    coverUrl: string;
    author: string;
  };
  coverUrl: string;
  audioUrl: string;
  duration: number;
  releaseDate: string;
  episodeNumber: number;
  seasonNumber?: number;
  explicit: boolean;
  isPlayed: boolean;
  playProgress: number;
  isSaved: boolean;
  isDownloaded: boolean;
}

interface EpisodesResponse {
  episodes: Episode[];
  total: number;
  hasMore: boolean;
}

export function EpisodesTab() {
  const { play, addToQueue } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();
  const { viewMode, sortBy, filter, setViewMode, setSortBy, setFilter } = useLibraryStore();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['library', 'episodes', { page, viewMode, sortBy, filter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        sort: sortBy,
        ...(filter.genre && { genre: filter.genre }),
        ...(filter.source && { source: filter.source }),
        ...(filter.showId && { showId: filter.showId }),
      });
      return api.get<EpisodesResponse>(`/library/episodes?${params}`).then(res => res.data);
    },
    placeholderData: (previousData) => previousData,
  });

  // Update episodes when data changes
  if (data) {
    if (page === 1) {
      setEpisodes(data.episodes);
    } else {
      setEpisodes(prev => [...prev, ...data.episodes]);
    }
    setHasMore(data.hasMore);
  }

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    // Wait for query to complete
    await new Promise(r => setTimeout(r, 100));
    setIsLoadingMore(false);
  };

  const handlePlayEpisode = (episode: Episode, index: number) => {
    const tracks = episodes.slice(index).map(ep => ({
      id: ep.id,
      title: ep.title,
      artist: ep.show.title,
      album: ep.show.title,
      duration: ep.duration,
      coverUrl: ep.coverUrl,
      streamUrl: ep.audioUrl,
      source: 'local' as const,
    }));
    play({ type: 'queue', queue: tracks.map(t => ({ track: t, id: t.id, source: 'local', addedAt: Date.now() })) });
  };

  const handleAddToQueue = (episode: Episode) => {
    addToQueue([{
      id: episode.id,
      title: episode.title,
      artist: episode.show.title,
      album: episode.show.title,
      duration: episode.duration,
      coverUrl: episode.coverUrl,
      streamUrl: episode.audioUrl,
      source: 'local',
    }]);
  };

  const handleSave = async (episode: Episode) => {
    // TODO: Implement save/unsave
  };

  const handleDownload = async (episode: Episode) => {
    // TODO: Implement download
  };

  if (isLoading && episodes.length === 0) return <EpisodesSkeleton />;
  if (error) return <EpisodesError onRetry={refetch} />;

  if (episodes.length === 0) {
    return (
      <EmptyState
        title="Nenhum episódio na biblioteca"
        description="Episódios que você salvar ou seguir aparecerão aqui."
        action={{ label: 'Explorar Podcasts', onClick: () => window.location.href = '/search?type=shows' }}
        secondaryAction={{ label: 'Ver shows seguidos', onClick: () => window.location.href = '/library/shows' }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background-secondary border-b border-border-primary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Visualização em grade"
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="Visualização em lista"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setSortBy(sortBy === 'recent' ? 'alphabetical' : 'recent')}
            >
              <ChevronDown className="w-4 h-4" />
              {sortBy === 'recent' ? 'Mais recentes' : 'A-Z'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          {episodes.length} episódios
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'grid' ? (
          <EpisodesGrid
            episodes={episodes}
            onPlay={handlePlayEpisode}
            onAddToQueue={handleAddToQueue}
            onSave={handleSave}
            onDownload={handleDownload}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        ) : (
          <EpisodesList
            episodes={episodes}
            onPlay={handlePlayEpisode}
            onAddToQueue={handleAddToQueue}
            onSave={handleSave}
            onDownload={handleDownload}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>
    </div>
  );
}

function EpisodesGrid({
  episodes,
  onPlay,
  onAddToQueue,
  onSave,
  onDownload,
  loadMore,
  hasMore,
  isLoadingMore,
}: {
  episodes: Episode[];
  onPlay: (ep: Episode, index: number) => void;
  onAddToQueue: (ep: Episode) => void;
  onSave: (ep: Episode) => void;
  onDownload: (ep: Episode) => void;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {episodes.map((episode, index) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            index={index}
            onPlay={onPlay}
            onAddToQueue={onAddToQueue}
            onSave={onSave}
            onDownload={onDownload}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-8">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-48"
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  );
}

function EpisodesList({
  episodes,
  onPlay,
  onAddToQueue,
  onSave,
  onDownload,
  loadMore,
  hasMore,
  isLoadingMore,
}: {
  episodes: Episode[];
  onPlay: (ep: Episode, index: number) => void;
  onAddToQueue: (ep: Episode) => void;
  onSave: (ep: Episode) => void;
  onDownload: (ep: Episode) => void;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}) {
  return (
    <div className="border-t border-border-primary">
      {episodes.map((episode, index) => (
        <EpisodeRow
          key={episode.id}
          episode={episode}
          index={index}
          onPlay={onPlay}
          onAddToQueue={onAddToQueue}
          onSave={onSave}
          onDownload={onDownload}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center py-8 border-t border-border-primary">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-48"
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  );
}

function EpisodeCard({
  episode,
  index,
  onPlay,
  onAddToQueue,
  onSave,
  onDownload,
}: {
  episode: Episode;
  index: number;
  onPlay: (ep: Episode, index: number) => void;
  onAddToQueue: (ep: Episode) => void;
  onSave: (ep: Episode) => void;
  onDownload: (ep: Episode) => void;
}) {
  return (
    <div className="group relative bg-background-secondary rounded-xl border border-border-primary overflow-hidden hover:border-primary/50 transition-colors">
      {/* Cover */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={episode.coverUrl}
          alt={episode.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="xl"
            variant="primary"
            onClick={() => onPlay(episode, index)}
            className="gap-2 scale-95 hover:scale-100 transition-transform"
          >
            <Play className="w-6 h-6" />
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {episode.explicit && (
            <Badge variant="default" size="sm">E</Badge>
          )}
          {episode.isDownloaded && (
            <Badge variant="default" size="sm" dot dotColor="text-green-500">
              <Download className="w-3 h-3" />
            </Badge>
          )}
        </div>

        {/* Progress ring for partially played */}
        {episode.playProgress > 0 && episode.playProgress < 100 && (
          <div className="absolute bottom-2 right-2">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                className="text-background-tertiary"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.5"
              />
              <circle
                className="text-primary"
                strokeWidth="3"
                strokeDasharray={`${episode.playProgress * 0.975} 97.5`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.5"
              />
            </svg>
          </div>
        )}

        {/* Played checkmark */}
        {episode.isPlayed && episode.playProgress === 100 && (
          <div className="absolute bottom-2 right-2 bg-success/90 text-white rounded-full p-1.5">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1 min-h-[80px]">
        <h3 className="font-medium text-text-primary truncate text-sm">{episode.title}</h3>
        <p className="text-xs text-text-secondary truncate">{episode.show.title}</p>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(episode.duration)}
          </span>
          <span>{formatDate(episode.releaseDate)}</span>
        </div>
      </div>

      {/* Actions on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
        <Button size="icon" variant="ghost" onClick={() => onSave(episode)} aria-label={episode.isSaved ? 'Remover da biblioteca' : 'Salvar'}>
          <Heart className={cn('w-4 h-4', episode.isSaved ? 'fill-current text-primary' : '')} />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDownload(episode)} aria-label="Baixar">
          <Download className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPlay(episode, index)}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddToQueue(episode)}>Adicionar à fila</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSave(episode)}>
              {episode.isSaved ? 'Remover da biblioteca' : 'Salvar na biblioteca'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(episode)}>
              {episode.isDownloaded ? 'Remover download' : 'Baixar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ir para o show</DropdownMenuItem>
            <DropdownMenuItem>Compartilhar episódio</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function EpisodeRow({
  episode,
  index,
  onPlay,
  onAddToQueue,
  onSave,
  onDownload,
}: {
  episode: Episode;
  index: number;
  onPlay: (ep: Episode, index: number) => void;
  onAddToQueue: (ep: Episode) => void;
  onSave: (ep: Episode) => void;
  onDownload: (ep: Episode) => void;
}) {
  return (
    <div className="group flex items-center gap-4 px-4 py-3 hover:bg-background-tertiary transition-colors border-b border-border-primary/50">
      <div className="flex-shrink-0 w-12 text-center text-text-muted">
        <Button size="icon" variant="ghost" onClick={() => onPlay(episode, index)} className="text-primary">
          <Play className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
        <img src={episode.coverUrl} alt={episode.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-text-primary truncate pr-4">{episode.title}</h3>
          {episode.explicit && <Badge variant="ghost" size="sm">E</Badge>}
          {episode.isPlayed && episode.playProgress === 100 && <Check className="w-4 h-4 text-success" />}
        </div>
        <p className="text-sm text-text-secondary truncate">{episode.show.title}</p>
        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
          <span>{formatDate(episode.releaseDate)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(episode.duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={() => onAddToQueue(episode)} aria-label="Adicionar à fila">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onSave(episode)} aria-label={episode.isSaved ? 'Remover' : 'Salvar'}>
          <Heart className={cn('w-4 h-4', episode.isSaved ? 'fill-current text-primary' : '')} />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDownload(episode)} aria-label="Baixar">
          <Download className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPlay(episode, index)}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddToQueue(episode)}>Adicionar à fila</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ir para o show</DropdownMenuItem>
            <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Plus, Check } from 'lucide-react';

function EpisodesSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-background-secondary rounded-xl border border-border-primary overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EpisodesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <EmptyState
        title="Erro ao carregar episódios"
        description="Não foi possível carregar seus episódios. Tente novamente."
        action={{ label: 'Tentar novamente', onClick: onRetry }}
      />
    </div>
  );
}export default EpisodesTab;
