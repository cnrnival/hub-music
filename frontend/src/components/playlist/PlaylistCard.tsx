/**
 * Hub Music - Playlist Card Component
 * Componente Card de Playlist: exibição de playlist com capa e faixas
 * Playlist Card component: playlist card display with cover and tracks
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
import { Play, Music, ListMusic, Clock, Globe, Lock } from 'lucide-react';

interface PlaylistCardProps {
  playlist: any;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onMore?: () => void;
}

export function PlaylistCard({
  playlist,
  variant = 'default',
  onPlay,
  onMore
}: PlaylistCardProps) {
  const { play, currentTrack, isPlaying, currentTime, duration } = usePlayer();
  const tracks = playlist.tracks || [];
  const totalDuration = tracks.reduce((sum: number, t: any) => sum + (t.track?.durationSeconds || 0), 0);
  const coverUrl = playlist.coverUrl || tracks[0]?.track?.coverUrl;

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else if (tracks.length > 0) {
      play(tracks[0].track, tracks.map((t: any) => t.track), 0);
    }
  };

  const isCurrentPlaylist = currentTrack && tracks.some((t: any) => t.track.id === currentTrack.id);

  if (variant === 'compact') {
    return (
      <Card variant="interactive" className="p-3 space-y-3" onClick={handlePlay}>
        {/* Cover */}
        <div className="relative aspect-square rounded-xl overflow-hidden group">
          {coverUrl ? (
            <img src={coverUrl} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
              <ListMusic className="w-10 h-10 text-white/50" />
            </div>
          )}

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="lg"
              onClick={(e) => { e.stopPropagation(); handlePlay(); }}
              className="shadow-glow"
            >
              <Play className="w-6 h-6 ml-0.5" />
            </Button>
          </div>

          {/* Visibility Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={playlist.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-xs">
              {playlist.visibility === 'PUBLIC' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {playlist.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{playlist.name}</h3>
          <p className="text-text-secondary text-sm truncate">
            {playlist.user?.displayName || playlist.user?.username}
          </p>
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              {tracks.length} faixa{tracks.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(totalDuration)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card variant="interactive" className="p-4 space-y-3" onClick={handlePlay}>
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden group">
        {coverUrl ? (
          <img src={coverUrl} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
            <ListMusic className="w-14 h-14 text-white/50" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="lg"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            className="shadow-glow"
          >
            <Play className="w-6 h-6 ml-0.5" />
          </Button>
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={playlist.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-xs">
            {playlist.visibility === 'PUBLIC' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {playlist.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 min-w-0">
        <h3 className="font-semibold text-text-primary truncate">{playlist.name}</h3>

        <div className="flex items-center gap-2">
          <Avatar
            src={playlist.user?.avatarUrl}
            name={playlist.user?.displayName || playlist.user?.username}
            size="xs"
          />
          <span className="text-text-secondary text-sm truncate">
            {playlist.user?.displayName || playlist.user?.username}
          </span>
        </div>

        <div className="flex items-center gap-3 text-text-muted text-sm">
          <span className="flex items-center gap-1">
            <Music className="w-4 h-4" />
            {tracks.length} faixa{tracks.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(totalDuration)}
          </span>
          {playlist.updatedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Atualizada recentemente
            </span>
          )}
        </div>

        {playlist.description && (
          <p className="text-text-secondary text-sm line-clamp-2">{playlist.description}</p>
        )}
      </div>
    </Card>
  );
}