/**
 * Hub Music - TrackCard
 * Card de faixa para visualização em grade
 * Track card for grid view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';
import { formatDuration, formatNumber } from '@/lib/utils';
import { Play, Heart, MoreHorizontal, Heart as HeartFilled } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { usePlayerStore } from '@/state/playerStore';

interface TrackCardProps {
  track: any;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onClick?: () => void;
  showArtist?: boolean;
}

export function TrackCard({ track, variant = 'default', onPlay, onClick, showArtist = true }: TrackCardProps) {
  const { queue, currentTrack, isPlaying } = usePlayerStore();
  const isInQueue = queue.some((q) => q.track.id === track.id);
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentAndPlaying = isCurrentTrack && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target || e.target.closest('button')) return;
    onClick?.();
  };

  const cardClasses = cn(
    'card-interactive relative group',
    variant === 'compact' && 'p-2',
    variant === 'default' && 'p-4'
  );

  return (
    <article className={cardClasses} onClick={handleClick} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <Music className={cn('text-white/50', variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12')} />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handlePlayClick}
            className={cn(
              'w-12 h-12 rounded-full bg-primary text-white shadow-glow hover:shadow-glow-lg transition-all',
              variant === 'compact' && 'w-10 h-10'
            )}
            aria-label={isCurrentAndPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isCurrentAndPlaying ? (
              <Pause className={cn('w-5 h-5', variant === 'compact' && 'w-4 h-4')} />
            ) : (
              <Play className={cn('w-5 h-5 ml-1', variant === 'compact' && 'w-4 h-4 ml-0.5')} />
            )}
          </Button>
        </div>

        {/* Source badge */}
        {track.source && track.source !== 'LOCAL' && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {track.source}
            </Badge>
          </div>
        )}

        {/* Explicit badge */}
        {track.explicit && (
          <div className="absolute top-2 right-2">
            <Badge variant="error" className="text-[10px] px-1.5">E</Badge>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="space-y-1 min-w-0">
        <h3 className={cn('font-medium truncate', variant === 'compact' ? 'text-sm' : 'text-base')}>
          {track.title}
        </h3>
        {showArtist && track.artist && (
          <p className={cn('text-text-secondary truncate', variant === 'compact' ? 'text-xs' : 'text-sm')}>
            {track.artist}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-text-muted text-[11px] mt-1">
          {track.durationSeconds && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(track.durationSeconds)}
            </span>
          )}
          {track._count?.likes !== undefined && (
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(track._count.likes)}
            </span>
          )}
        </div>
      </div>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPlay}>
            <Play className="w-4 h-4 mr-2" /> {isCurrentTrack ? 'Tocando agora' : 'Reproduzir'}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Heart className={cn('w-4 h-4 mr-2', track.userLiked && 'fill-current text-error')} />
            {track.userLiked ? 'Descurtir' : 'Curtir'}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus className="w-4 h-4 mr-2" /> Adicionar à fila
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus className="w-4 h-4 mr-2" /> Adicionar à playlist
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Share2 className="w-4 h-4 mr-2" /> Compartilhar
          </DropdownMenuItem>
          <DropdownMenuItem className="text-error">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}

import { Music, Clock, Pause, Share2, Trash2 } from 'lucide-react';