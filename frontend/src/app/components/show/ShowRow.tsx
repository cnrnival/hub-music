/**
 * Hub Music - ShowRow
 * Linha de show/podcast para listas
 * Show/Podcast row for lists
 *
 * @languages pt-BR / en-US
 */

import { Play, Heart, Plus, MoreHorizontal, Mic, Users, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount, formatDate } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Badge } from '@/common/Badge';
import { Avatar } from '@/common/Avatar';
import { DropdownMenu } from '@/common/DropdownMenu';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';

interface Show {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  category: string;
  language: string;
  explicit: boolean;
  totalEpisodes: number;
  totalDuration: number;
  publisher: string;
  isFollowing: boolean;
}

interface ShowRowProps {
  show: Show;
  index?: number;
  onPlay?: () => void;
  onFollow?: () => void;
  variant?: 'default' | 'compact';
}

export function ShowRow({
  show,
  index,
  onPlay,
  onFollow,
  variant = 'default',
}: ShowRowProps) {
  const { play } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  const handlePlay = () => {
    onPlay?.();
    play({ type: 'artist', artistId: show.id }); // Will play latest episode
  };

  const handleFollow = () => {
    onFollow?.();
    // TODO: Implement follow
  };

  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      {/* Number/Play */}
      <div className={cn('flex-shrink-0 w-12 text-center text-text-muted', isCompact && 'w-8')}>
        {index !== undefined && !isCompact ? (
          <span className="text-sm">{index + 1}</span>
        ) : (
          <Button size="icon" variant="ghost" onClick={handlePlay} className="text-primary opacity-0 group-hover:opacity-100">
            <Play className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Cover */}
      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <img src={show.coverUrl} alt={show.title} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn('font-medium text-text-primary truncate pr-4', isCompact && 'text-sm')}>
            {show.title}
          </h3>
          <Badge variant="ghost" size="sm"><Mic className="w-3 h-3 mr-1" /> Podcast</Badge>
          {show.explicit && <Badge variant="ghost" size="sm">E</Badge>}
        </div>

        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
          {show.author}
        </p>

        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
          <span>{show.totalEpisodes} episódios</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {formatCount(show.followerCount || 0)} seguidores
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={handlePlay} aria-label="Reproduzir">
          <Play className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleFollow} className="gap-1 opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4" />
          {show.isFollowing ? 'Seguindo' : 'Seguir'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem onClick={handleFollow}>
              {show.isFollowing ? 'Deixar de seguir' : 'Seguir'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}