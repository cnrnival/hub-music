/**
 * Hub Music - Track Card Component
 * Componente Card de Faixa: exibição de faixa com capa, título e ações
 * Track Card component: track card display with cover, title and actions
 * 
 * @languages pt-BR / en-US
 */

import { usePlayer } from '../../hooks/usePlayer';
import { formatDuration, formatNumber } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Play, Pause, Heart, Repeat, MoreHorizontal, Music } from 'lucide-react';

interface TrackCardProps {
  track: any;
  variant?: 'default' | 'compact' | 'list';
  showArtist?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onRepost?: () => void;
  onMore?: () => void;
}

export function TrackCard({
  track,
  variant = 'default',
  showArtist = true,
  onPlay,
  onLike,
  onRepost,
  onMore
}: TrackCardProps) {
  const { play, currentTrack, isPlaying, currentTime, duration, togglePlay } = usePlayer();
  const isCurrentTrack = currentTrack?.id === track.id;
  const trackDuration = track.durationSeconds || 0;

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      play(track);
    }
  };

  const handleLike = () => onLike?.();
  const handleRepost = () => onRepost?.();
  const handleMore = () => onMore?.();

  if (variant === 'compact') {
    return (
      <Card variant="interactive" className="p-3 space-y-3" onClick={handlePlay}>
        {/* Cover */}
        <div className="relative aspect-square rounded-xl overflow-hidden group">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
              <Music className="w-10 h-10 text-white/50" />
            </div>
          )}

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="lg"
              onClick={(e) => { e.stopPropagation(); handlePlay(); }}
              className="shadow-glow"
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
          </div>

          {/* Source Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="primary" className="text-xs">
              {track.source === 'LOCAL' ? 'Hub' : track.source}
            </Badge>
          </div>

          {/* Visibility */}
          {track.visibility === 'PRIVATE' && (
            <div className="absolute top-2 right-2">
              <Badge variant="warning" className="text-xs">
                <Lock className="w-3 h-3 mr-1" /> Privado
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{track.title}</h3>
          {showArtist && track.artist && (
            <p className="text-text-secondary text-sm truncate">{track.artist}</p>
          )}
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(track._count?.likes || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              {formatDuration(trackDuration)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('flex items-center gap-4 p-3 rounded-xl transition-colors', 'hover:bg-background-tertiary')}>
        {/* Cover */}
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
              <Music className="w-6 h-6 text-white/50" />
            </div>
          )}
          {isCurrentTrack && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-text-primary truncate">{track.title}</h4>
            {track.explicit && <Badge variant="error" size="sm">E</Badge>}
            {track.visibility === 'PRIVATE' && <Badge variant="warning" size="sm"><Lock className="w-2 h-2 mr-1" /></Badge>}
          </div>
          {showArtist && track.artist && (
            <p className="text-text-secondary text-sm truncate">{track.artist}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-text-muted text-sm hidden md:flex">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {formatNumber(track._count?.likes || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat className="w-4 h-4" />
            {formatNumber(track._count?.reposts || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Music className="w-4 h-4" />
            {formatDuration(trackDuration)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleLike(); }} className={cn(track.userLiked && 'text-error')}>
            <Heart className={cn('w-4 h-4', track.userLiked && 'fill-current')} />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRepost(); }} className={cn(track.userReposted && 'text-primary')}>
            <Repeat className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleMore(); }}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Card variant="interactive" className="p-4 space-y-3" onClick={handlePlay}>
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden group">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
            <Music className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="lg"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            className="shadow-glow"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Source Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="primary" className="text-xs">
            {track.source === 'LOCAL' ? 'Hub' : track.source}
          </Badge>
        </div>

        {/* Visibility */}
        {track.visibility === 'PRIVATE' && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" className="text-xs">
              <Lock className="w-3 h-3 mr-1" /> Privado
            </Badge>
          </div>
        )}

        {/* Explicit */}
        {track.explicit && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="error" size="sm">E</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 min-w-0">
        <h3 className="font-medium text-text-primary truncate">{track.title}</h3>
        {showArtist && track.artist && (
          <p className="text-text-secondary text-sm truncate">{track.artist}</p>
        )}
        <div className="flex items-center gap-3 text-text-muted text-xs">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {formatNumber(track._count?.likes || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat className="w-3 h-3" />
            {formatNumber(track._count?.reposts || 0)}
          </span>
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {formatDuration(trackDuration)}
          </span>
        </div>
      </div>
    </Card>
  );
}