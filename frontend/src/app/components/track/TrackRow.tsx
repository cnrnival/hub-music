/**
 * Hub Music - TrackRow
 * Linha de faixa para visualização em lista
 * Track row for list view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatDuration, formatNumber } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, Clock, Heart as HeartIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';
import { usePlayerStore } from '../../../state/playerStore';

interface TrackRowProps {
  track: any;
  index?: number;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onClick?: () => void;
}

export function TrackRow({ track, index, variant = 'default', onPlay, onClick }: TrackRowProps) {
  const { queue, currentTrack, isPlaying } = usePlayerStore();
  const isInQueue = queue.some((q) => q.track.id === track.id);
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentAndPlaying = isCurrentTrack && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const rowClasses = cn(
    'flex items-center gap-3 p-2 rounded-xl transition-colors',
    'hover:bg-background-tertiary group',
    variant === 'compact' && 'px-1 py-1.5',
    isCurrentTrack && 'bg-primary/10'
  );

  return (
    <div className={rowClasses} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {/* Track number / Play button */}
      <div className="flex items-center justify-center w-10 flex-shrink-0">
        {isCurrentAndPlaying ? (
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '100ms' }} />
            <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
          </div>
        ) : index !== undefined ? (
          <span className="text-text-muted text-sm font-medium w-8 text-right">{index}</span>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayClick}
            className="text-text-secondary hover:text-primary"
            aria-label={isCurrentAndPlaying ? 'Pausar' : 'Reproduzir'}
          >
            <Play className="w-4 h-4 ml-0.5" />
          </Button>
        )}
      </div>

      {/* Cover */}
      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <Music className="w-5 h-5 text-white/50" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('font-medium truncate flex-1', isCurrentTrack ? 'text-primary' : '')}>
            {track.title}
          </p>
          {track.explicit && <Badge variant="error" className="text-[10px] px-1.5">E</Badge>}
          {track.source && track.source !== 'LOCAL' && (
            <Badge variant="secondary" className="text-[10px] px-1.5">{track.source}</Badge>
          )}
        </div>
        {track.artist && (
          <p className="text-text-secondary truncate text-sm">{track.artist}</p>
        )}
      </div>

      {/* Album */}
      {track.album && variant !== 'compact' && (
        <div className="hidden md:block w-32 truncate text-text-secondary text-sm">
          {track.album.title || track.album}
        </div>
      )}

      {/* Duration */}
      <div className="flex items-center gap-4 text-text-muted text-sm w-24 text-right flex-shrink-0">
        {track._count?.likes !== undefined && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(track.userLiked && 'text-error')}
            onClick={(e) => { e.stopPropagation(); }}
            aria-label={track.userLiked ? 'Descurtir' : 'Curtir'}
            aria-pressed={track.userLiked}
          >
            <HeartIcon className={cn('w-4 h-4', track.userLiked && 'fill-current')} />
          </Button>
        )}
        {track.durationSeconds && (
          <span className="font-mono">{formatDuration(track.durationSeconds)}</span>
        )}
      </div>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
    </div>
  );
}

import { Music, Heart, Plus, Share2, Trash2 } from 'lucide-react';