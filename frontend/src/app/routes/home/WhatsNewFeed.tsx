/**
 * Hub Music - WhatsNewFeed
 * Feed cronológico de lançamentos de artistas seguidos
 * Chronological feed of new releases from followed artists
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Play, Heart, MoreHorizontal, Clock, Calendar, Music, Bell, BellOff } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/ui/dropdown-menu';
import { TrackCard } from '@/components/track/TrackCard';
import { AlbumCard } from '@/components/album/AlbumCard';
import { usePlayerStore } from '@/state/playerStore';

interface FeedItem {
  id: string;
  type: 'track' | 'album' | 'playlist' | 'artist';
  item: any;
  createdAt: string;
  reason: 'follow' | 'saved' | 'recommended';
}

interface WhatsNewFeedProps {
  items: FeedItem[];
  onItemClick?: (item: FeedItem) => void;
  onPlayClick?: (item: FeedItem) => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  emptyMessage?: string;
}

export function WhatsNewFeed({
  items,
  onItemClick,
  onPlayClick,
  showSeeAll = true,
  onSeeAll,
  emptyMessage = 'Nenhum lançamento novo dos artistas que você segue',
}: WhatsNewFeedProps) {
  const { play } = usePlayerStore();

  const handlePlayClick = (item: FeedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayClick?.(item);
    if (item.item) {
      play({ type: item.type, [item.type + 'Id']: item.item.id });
    }
  };

  const groupByDate = (items: FeedItem[]) => {
    const groups: Record<string, FeedItem[]> = {};
    items.forEach((item) => {
      const date = new Date(item.createdAt).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const groupedItems = groupByDate(items);

  if (items.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-text-primary text-lg">O que há de novo</h2>
          {showSeeAll && onSeeAll && (
            <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-background-tertiary rounded-xl flex items-center justify-center">
            <BellOff className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-secondary mb-2">{emptyMessage}</p>
          <p className="text-text-muted text-sm">Siga artistas para ver seus novos lançamentos aqui</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-semibold text-text-primary text-lg">O que há de novo</h2>
        {showSeeAll && onSeeAll && (
          <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Feed Items grouped by date */}
      <div className="px-4 space-y-6">
        {Object.entries(groupedItems).map(([date, dateItems]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border-primary" />
              <span className="text-text-muted text-sm font-medium whitespace-nowrap px-3">
                {date.charAt(0).toUpperCase() + date.slice(1)}
              </span>
              <div className="flex-1 h-px bg-border-primary" />
            </div>

            {/* Items */}
            <div className="space-y-2">
              {dateItems.map((feedItem, index) => (
                <div
                  key={feedItem.id}
                  className="card-hover group relative"
                  onClick={() => onItemClick?.(feedItem)}
                >
                  <div className="flex items-start gap-3 p-3">
                    {/* Type indicator */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      {feedItem.type === 'track' && <Music className="w-4 h-4" />}
                      {feedItem.type === 'album' && <Music2 className="w-4 h-4" />}
                      {feedItem.type === 'playlist' && <ListMusic className="w-4 h-4" />}
                      {feedItem.type === 'artist' && <User className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary truncate">
                          {feedItem.item?.title || feedItem.item?.name || 'Item desconhecido'}
                        </span>
                        <Badge
                          variant={
                            feedItem.reason === 'follow' ? 'primary' :
                            feedItem.reason === 'saved' ? 'success' : 'outline'
                          }
                          className="text-[10px] px-1.5 shrink-0"
                        >
                          {feedItem.reason === 'follow' ? 'Artista seguido' :
                           feedItem.reason === 'saved' ? 'Salvo' : 'Recomendado'}
                        </Badge>
                      </div>

                      {feedItem.item?.artist && (
                        <p className="text-text-secondary text-sm truncate">
                          {feedItem.item.artist.displayName || feedItem.item.artist.username}
                        </p>
                      )}

                      {feedItem.item?.album && feedItem.type === 'track' && (
                        <p className="text-text-muted text-[12px] truncate">
                          {feedItem.item.album.title}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-text-muted text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(feedItem.createdAt)}
                        </span>
                        {feedItem.item?._count?.plays && (
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {feedItem.item._count.plays} plays
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handlePlayClick(feedItem, e)}
                        className="text-text-secondary hover:text-primary"
                        aria-label="Reproduzir"
                      >
                        <Play className="w-5 h-5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-text-secondary hover:text-primary p-1"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Mais opções"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handlePlayClick(feedItem, e)}>
                            <Play className="w-4 h-4 mr-2" /> Reproduzir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Heart className="w-4 h-4 mr-2" /> Salvar na biblioteca
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="w-4 h-4 mr-2" /> Adicionar à fila
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                          </DropdownMenuItem>
                          {feedItem.type === 'artist' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Bell className="w-4 h-4 mr-2" /> Notificar lançamentos
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { ChevronRight, Music, Music2, ListMusic, User, Clock, Calendar, Bell, BellOff, Play, Heart, MoreHorizontal, Share2, Plus } from 'lucide-react';export default WhatsNewFeed;
