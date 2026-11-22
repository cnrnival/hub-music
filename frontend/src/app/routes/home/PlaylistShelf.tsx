/**
 * Hub Music - PlaylistShelf
 * Carrossel horizontal de playlists (Made for You, Daily Mix, etc.)
 * Horizontal playlist carousel
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, ChevronRight, ListMusic } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';
import { ScrollArea } from '../../ui/scroll-area';
import { PlaylistCard } from '../../../components/playlist/PlaylistCard';
import { usePlayerStore } from '../../../state/playerStore';

interface PlaylistShelfProps {
  title: string;
  playlists: any[];
  onPlaylistClick?: (playlist: any) => void;
  onPlayClick?: (playlist: any) => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function PlaylistShelf({
  title,
  playlists,
  onPlaylistClick,
  onPlayClick,
  showSeeAll = true,
  onSeeAll,
  emptyMessage = 'Nenhuma playlist encontrada',
  emptyAction,
}: PlaylistShelfProps) {
  const { play } = usePlayerStore();

  const handlePlayClick = (playlist: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayClick?.(playlist);
    play({ type: 'playlist', playlistId: playlist.id });
  };

  if (playlists.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-text-primary text-lg">{title}</h2>
          {showSeeAll && onSeeAll && (
            <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="px-4 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-background-tertiary rounded-xl flex items-center justify-center">
            <ListMusic className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-secondary mb-4">{emptyMessage}</p>
          {emptyAction}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-semibold text-text-primary text-lg">{title}</h2>
        {showSeeAll && onSeeAll && (
          <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Carousel */}
      <ScrollArea className="h-auto" type="always">
        <div className="flex gap-3 px-4 pb-2" role="list" aria-label={title}>
          {playlists.map((playlist, index) => (
            <div
              key={playlist.id}
              className="flex-shrink-0 w-40 md:w-44 lg:w-48"
              role="listitem"
            >
              <PlaylistCard
                playlist={playlist}
                onPlay={() => handlePlayClick(playlist, e as any)}
                onClick={() => onPlaylistClick?.(playlist)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

import { ChevronRight, ListMusic, Play, Heart, MoreHorizontal, Share2, Plus, Download, Radio } from 'lucide-react';