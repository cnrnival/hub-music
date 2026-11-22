/**
 * Hub Music - ContinueListening
 * Seção para continuar ouvindo (recentemente reproduzidos)
 * Section to continue listening (recently played)
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatRelativeTime } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, ChevronRight, Clock, Music, ListMusic, Compass } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';
import { ScrollArea } from '../../ui/scroll-area';
import { TrackCard } from '../../../components/track/TrackCard';
import { AlbumCard } from '../../../components/album/AlbumCard';
import { PlaylistCard } from '../../../components/playlist/PlaylistCard';
import { ArtistCard } from '../../../components/artist/ArtistCard';
import { usePlayerStore } from '../../../state/playerStore';

interface RecentItem {
  id: string;
  type: 'track' | 'album' | 'playlist' | 'artist' | 'show' | 'episode';
  item: any;
  playedAt: string;
  progress?: number; // 0-100
  duration?: number; // seconds
}

interface ContinueListeningProps {
  items: RecentItem[];
  onItemClick?: (item: RecentItem) => void;
  onPlayClick?: (item: RecentItem) => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function ContinueListening({
  items,
  onItemClick,
  onPlayClick,
  showSeeAll = true,
  onSeeAll,
  emptyMessage = 'Você ainda não ouviu nada',
  emptyAction,
}: ContinueListeningProps) {
  const { play } = usePlayerStore();

  const handlePlayClick = (recentItem: RecentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayClick?.(recentItem);
    if (recentItem.item) {
      play({ type: recentItem.type, [recentItem.type + 'Id']: recentItem.item.id, startPosition: recentItem.progress });
    }
  };

  const getCardComponent = (type: RecentItem['type']) => {
    switch (type) {
      case 'track': return TrackCard;
      case 'album': return AlbumCard;
      case 'playlist': return PlaylistCard;
      case 'artist': return ArtistCard;
      default: return TrackCard;
    }
  };

  const getItemTitle = (item: RecentItem) => {
    return item.item?.title || item.item?.name || 'Item desconhecido';
  };

  const getItemSubtitle = (item: RecentItem) => {
    if (item.type === 'track') return item.item?.artist?.displayName || item.item?.artist?.username;
    if (item.type === 'album') return item.item?.artist?.displayName || item.item?.artist?.username;
    if (item.type === 'playlist') return item.item?.user?.displayName || item.item?.user?.username;
    if (item.type === 'artist') return undefined;
    return undefined;
  };

  if (items.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Continue ouvindo
          </h2>
          {showSeeAll && onSeeAll && (
            <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-background-tertiary rounded-xl flex items-center justify-center">
            <Compass className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-secondary mb-2">{emptyMessage}</p>
          <p className="text-text-muted text-sm">Comece a explorar e seus itens recentes aparecerão aqui</p>
          {emptyAction}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Continue ouvindo
        </h2>
        {showSeeAll && onSeeAll && (
          <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Carousel */}
      <ScrollArea className="h-auto" type="always">
        <div className="flex gap-3 px-4 pb-2" role="list" aria-label="Continue ouvindo">
          {items.map((recentItem, index) => (
            <div
              key={recentItem.id}
              className="flex-shrink-0 w-40 md:w-44 lg:w-48 relative"
              role="listitem"
            >
              <div className="relative">
                <div className="card-hover">
                  <div
                    className="relative"
                    onClick={() => onItemClick?.(recentItem)}
                  >
                    {/* Render appropriate card based on type */}
                    {(() => {
                      const CardComponent = getCardComponent(recentItem.type);
                      const item = recentItem.item;
                      return (
                        <CardComponent
                          {...{ [recentItem.type]: item }}
                          onPlay={() => handlePlayClick(recentItem, e as any)}
                          onClick={() => onItemClick?.(recentItem)}
                        />
                      );
                    })()}
                  </div>

                  {/* Progress indicator */}
                  {recentItem.progress !== undefined && recentItem.progress > 0 && recentItem.progress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${recentItem.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Played at timestamp */}
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(recentItem.playedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

import { ChevronRight, Clock, Music, ListMusic, Compass, Play, MoreHorizontal, Heart, Share2, Plus, Download, Radio, User, Check } from 'lucide-react';