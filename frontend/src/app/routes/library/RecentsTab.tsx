/**
 * Hub Music - RecentsTab
 * Aba de recentes na biblioteca
 * Recents tab in library
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Heart, Clock, Calendar, Music, Film, Mic, MoreHorizontal, ChevronDown, Filter } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDuration, formatDate, formatRelativeTime } from '../../../lib/utils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/common/Badge';
import { DropdownMenu } from '../../components/common/DropdownMenu';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { TrackRow } from '../../components/track/TrackRow';
import { AlbumRow } from '../../components/album/AlbumRow';
import { ArtistRow } from '../../components/artist/ArtistRow';
import { PlaylistRow } from '../../components/playlist/PlaylistRow';
import { EpisodeRow } from '../../components/episode/EpisodeRow';
import { usePlayerStore } from '../../../state/playerStore';
import { useUIStore } from '../../../state/uiStore';
import { useLibraryStore } from '../../../state/libraryStore';

type RecentItemType = 'track' | 'album' | 'artist' | 'playlist' | 'episode' | 'show';

interface RecentItem {
  id: string;
  type: RecentItemType;
  playedAt: string;
  progress?: number;
  track?: {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    coverUrl: string;
    streamUrl: string;
    source: string;
  };
  album?: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    releaseDate: string;
    totalTracks: number;
  };
  artist?: {
    id: string;
    name: string;
    avatarUrl: string;
    followerCount: number;
  };
  playlist?: {
    id: string;
    name: string;
    owner: string;
    coverUrl: string;
    trackCount: number;
  };
  episode?: {
    id: string;
    title: string;
    show: string;
    coverUrl: string;
    duration: number;
    releaseDate: string;
  };
  show?: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
  };
}

interface RecentsResponse {
  items: RecentItem[];
  total: number;
  hasMore: boolean;
}

export function RecentsTab() {
  const { play, addToQueue } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();
  const { viewMode, sortBy, filter, setViewMode, setSortBy, setFilter } = useLibraryStore();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RecentItemType | 'all'>('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['library', 'recents', { page, timeFilter, typeFilter, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        sort: sortBy,
        ...(timeFilter !== 'all' && { timeFilter }),
        ...(typeFilter !== 'all' && { typeFilter }),
      });
      return api.get<RecentsResponse>(`/library/recents?${params}`).then(res => res.data);
    },
    placeholderData: (previousData) => previousData,
  });

  if (data) {
    if (page === 1) {
      setItems(data.items);
    } else {
      setItems(prev => [...prev, ...data.items]);
    }
    setHasMore(data.hasMore);
  }

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    await new Promise(r => setTimeout(r, 100));
    setIsLoadingMore(false);
  };

  const handlePlay = (item: RecentItem, index: number) => {
    switch (item.type) {
      case 'track':
        if (item.track) {
          play({ type: 'track', trackId: item.track.id, startPosition: item.progress });
        }
        break;
      case 'album':
        if (item.album) {
          // Play album from start or specific track
          play({ type: 'album', albumId: item.album.id });
        }
        break;
      case 'playlist':
        if (item.playlist) {
          play({ type: 'playlist', playlistId: item.playlist.id });
        }
        break;
      case 'episode':
        if (item.episode) {
          play({ type: 'track', trackId: item.episode.id, startPosition: item.progress });
        }
        break;
    }
  };

  const handleAddToQueue = (item: RecentItem) => {
    switch (item.type) {
      case 'track':
        if (item.track) addToQueue([item.track]);
        break;
      case 'episode':
        if (item.episode) addToQueue([{ ...item.episode, source: 'local' }]);
        break;
    }
  };

  const getTypeIcon = (type: RecentItemType) => {
    switch (type) {
      case 'track': return <Music className="w-4 h-4" />;
      case 'album': return <Film className="w-4 h-4" />;
      case 'artist': return <Music className="w-4 h-4" />;
      case 'playlist': return <Film className="w-4 h-4" />;
      case 'episode': return <Mic className="w-4 h-4" />;
      case 'show': return <Mic className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: RecentItemType) => {
    switch (type) {
      case 'track': return 'Faixa';
      case 'album': return 'Álbum';
      case 'artist': return 'Artista';
      case 'playlist': return 'Playlist';
      case 'episode': return 'Episódio';
      case 'show': return 'Show';
    }
  };

  if (isLoading && items.length === 0) return <RecentsSkeleton />;
  if (error) return <RecentsError onRetry={refetch} />;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhuma atividade recente"
        description="Suas músicas, álbuns, playlists e podcasts ouvidos recentemente aparecerão aqui."
        action={{ label: 'Explorar músicas', onClick: () => window.location.href = '/search' }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background-secondary border-b border-border-primary">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Time filter */}
          <div className="flex items-center gap-1 bg-background-tertiary rounded-lg p-1">
            {(['today', 'week', 'month', 'all'] as const).map(tf => (
              <Button
                key={tf}
                variant={timeFilter === tf ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => { setTimeFilter(tf); setPage(1); setItems([]); }}
                className="px-3"
              >
                {tf === 'today' ? 'Hoje' : tf === 'week' ? 'Semana' : tf === 'month' ? 'Mês' : 'Tudo'}
              </Button>
            ))}
          </div>

          {/* Type filter */}
          <DropdownMenu>
            <DropdownMenuTrigger variant="outline" size="sm" className="gap-1">
              <Filter className="w-4 h-4" />
              {typeFilter === 'all' ? 'Todos os tipos' : getTypeLabel(typeFilter)}
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { setTypeFilter('all'); setPage(1); setItems([]); }}>
                Todos os tipos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setTypeFilter('track'); setPage(1); setItems([]); }}>
                <Music className="w-4 h-4 mr-2" /> Faixas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('album'); setPage(1); setItems([]); }}>
                <Film className="w-4 h-4 mr-2" /> Álbuns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('artist'); setPage(1); setItems([]); }}>
                <Music className="w-4 h-4 mr-2" /> Artistas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('playlist'); setPage(1); setItems([]); }}>
                <Film className="w-4 h-4 mr-2" /> Playlists
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('episode'); setPage(1); setItems([]); }}>
                <Mic className="w-4 h-4 mr-2" /> Episódios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('show'); setPage(1); setItems([]); }}>
                <Mic className="w-4 h-4 mr-2" /> Shows
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setSortBy(sortBy === 'recent' ? 'alphabetical' : 'recent')}
          >
            <ChevronDown className="w-4 h-4" />
            {sortBy === 'recent' ? 'Mais recentes' : 'A-Z'}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          {items.length} itens
        </div>
      </div>

      {/* Content - Grouped by date */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {groupByDate(items).map(({ date, items: dateItems }) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border-primary" />
                <span className="text-sm font-medium text-text-secondary px-3 bg-background-primary">
                  {formatRelativeTime(date)}
                </span>
                <div className="flex-1 h-px bg-border-primary" />
              </div>

              <div className="space-y-2">
                {dateItems.map((item, index) => (
                  <RecentItemRow
                    key={`${item.id}-${index}`}
                    item={item}
                    index={index}
                    onPlay={handlePlay}
                    onAddToQueue={handleAddToQueue}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                  />
                ))}
              </div>
            </div>
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
      </div>
    </div>
  );
}

function groupByDate(items: RecentItem[]) {
  const groups = new Map<string, RecentItem[]>();

  items.forEach(item => {
    const date = new Date(item.playedAt).toDateString();
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(item);
  });

  return Array.from(groups.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([date, items]) => ({ date, items }));
}

function RecentItemRow({
  item,
  index,
  onPlay,
  onAddToQueue,
  getTypeIcon,
  getTypeLabel,
}: {
  item: RecentItem;
  index: number;
  onPlay: (item: RecentItem, index: number) => void;
  onAddToQueue: (item: RecentItem) => void;
  getTypeIcon: (type: RecentItemType) => React.ReactNode;
  getTypeLabel: (type: RecentItemType) => string;
}) {
  const renderContent = () => {
    switch (item.type) {
      case 'track':
        return item.track ? (
          <TrackRowContent track={item.track} progress={item.progress} />
        ) : null;
      case 'album':
        return item.album ? (
          <AlbumRowContent album={item.album} />
        ) : null;
      case 'artist':
        return item.artist ? (
          <ArtistRowContent artist={item.artist} />
        ) : null;
      case 'playlist':
        return item.playlist ? (
          <PlaylistRowContent playlist={item.playlist} />
        ) : null;
      case 'episode':
        return item.episode ? (
          <EpisodeRowContent episode={item.episode} progress={item.progress} />
        ) : null;
      case 'show':
        return item.show ? (
          <ShowRowContent show={item.show} />
        ) : null;
    }
  };

  return (
    <div className="group relative bg-background-secondary rounded-xl border border-border-primary p-3 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Type badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center text-text-muted">
          {getTypeIcon(item.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(item.playedAt)}
            </span>
            <span className="px-2 py-0.5 bg-background-tertiary rounded text-text-secondary">
              {getTypeLabel(item.type)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type === 'track' || item.type === 'episode' ? (
            <>
              <Button size="icon" variant="ghost" onClick={() => onPlay(item, index)} aria-label="Reproduzir">
                <Play className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onAddToQueue(item)} aria-label="Adicionar à fila">
                <Plus className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="icon" variant="ghost" onClick={() => onPlay(item, index)} aria-label="Reproduzir">
              <Play className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPlay(item, index)}>Reproduzir</DropdownMenuItem>
              {(item.type === 'track' || item.type === 'episode') && (
                <DropdownMenuItem onClick={() => onAddToQueue(item)}>Adicionar à fila</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>Remover do histórico</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress bar for tracks/episodes */}
      {(item.type === 'track' || item.type === 'episode') && item.progress && item.progress > 0 && item.progress < 100 && (
        <div className="mt-3 h-1 bg-background-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TrackRowContent({ track, progress }: { track: RecentItem['track']; progress?: number }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary truncate pr-4">{track!.title}</h3>
      <p className="text-sm text-text-secondary truncate">{track!.artist} · {track!.album}</p>
      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(track!.duration)}
        </span>
      </div>
    </div>
  );
}

function AlbumRowContent({ album }: { album: RecentItem['album'] }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary truncate pr-4">{album!.title}</h3>
      <p className="text-sm text-text-secondary truncate">{album!.artist}</p>
      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
        <span>{formatDate(album!.releaseDate)}</span>
        <span>•</span>
        <span>{album!.totalTracks} faixas</span>
      </div>
    </div>
  );
}

function ArtistRowContent({ artist }: { artist: RecentItem['artist'] }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary truncate pr-4">{artist!.name}</h3>
      <p className="text-sm text-text-secondary truncate">
        {formatCount(artist!.followerCount)} ouvintes mensais
      </p>
    </div>
  );
}

function PlaylistRowContent({ playlist }: { playlist: RecentItem['playlist'] }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary truncate pr-4">{playlist!.name}</h3>
      <p className="text-sm text-text-secondary truncate">Por {playlist!.owner}</p>
      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
        <span>{playlist!.trackCount} faixas</span>
      </div>
    </div>
  );
}

function EpisodeRowContent({ episode, progress }: { episode: RecentItem['episode']; progress?: number }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary truncate pr-4">{episode!.title}</h3>
      <p className="text-sm text-text-secondary truncate">{episode!.show}</p>
      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(episode!.duration)}
        </span>
        <span>{formatDate(episode!.releaseDate)}</span>
      </div>
    </div>
  );
}

function ShowRowContent({ show }: { show: RecentItem['show'] }) {
  return (
    <div>
      <h3 className="font-medium text-text-primary truncate pr-4">{show!.title}</h3>
      <p className="text-sm text-text-secondary truncate">{show!.author}</p>
    </div>
  );
}

import { Plus } from 'lucide-react';
import { formatCount } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

function RecentsSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-center gap-4 flex-wrap">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto space-y-6">
        {[...Array(3)].map((_, dateIndex) => (
          <div key={dateIndex} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, itemIndex) => (
                <div key={itemIndex} className="bg-background-secondary rounded-xl border border-border-primary p-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <EmptyState
        title="Erro ao carregar recentes"
        description="Não foi possível carregar seu histórico recente. Tente novamente."
        action={{ label: 'Tentar novamente', onClick: onRetry }}
      />
    </div>
  );
}