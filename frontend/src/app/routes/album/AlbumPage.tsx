/**
 * Hub Music - AlbumPage
 * Página do álbum com header, tracklist, informações
 * Album page with header, tracklist, info
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Heart, Share2, MoreHorizontal, ChevronLeft, ChevronRight,
  Music, User, Calendar, ListMusic, Heart as HeartIcon, Clock, Download,
  Check, Volume2, VolumeX, Shuffle, Repeat, Plus, Flag
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { Slider } from '@/ui/slider';
import { ScrollArea } from '@/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { Separator } from '@/ui/separator';
import { TrackRow } from '@/components/track/TrackRow';
import { TrackSkeleton } from '@/components/track/TrackSkeleton';
import { ArtistCard } from '@/components/artist/ArtistCard';
import { formatDuration, formatNumber, formatRelativeTime } from '@/lib/utils';
import { usePlayerStore } from '@/state/playerStore';
import { useAlbum, useAlbumTracks } from '@/hooks/data/useProfile';
import { cn } from '@/lib/utils';

interface AlbumPageProps {
  albumId?: string;
}

export function AlbumPage({ albumId: propAlbumId }: AlbumPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const albumId = propAlbumId || id;

  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    play,
    togglePlay,
    seek,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
  } = usePlayerStore();

  const [showFullDescription, setShowFullDescription] = useState(false);

  const { data: album, isLoading: albumLoading, error: albumError } = useAlbum(albumId || '', { enabled: !!albumId });
  const { data: tracks, isLoading: tracksLoading } = useAlbumTracks(albumId || '', { enabled: !!albumId });

  const isCurrentAlbumTrack = currentTrack && album?.tracks?.some((t: any) => t.id === currentTrack.id);

  const handlePlayClick = () => {
    if (!album) return;

    if (isCurrentAlbumTrack) {
      togglePlay();
    } else {
      play({ type: 'album', albumId: album.id, startIndex: 0 });
    }
  };

  const handleShufflePlay = () => {
    if (!album) return;
    play({ type: 'album', albumId: album.id, startIndex: 0 });
    toggleShuffle();
  };

  const handleAddAllToQueue = () => {
    if (!tracks) return;
    addToQueue(tracks);
  };

  if (albumLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-xl bg-background-tertiary flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-background-tertiary rounded w-1/4" />
              <div className="h-8 bg-background-tertiary rounded w-3/4" />
              <div className="h-4 bg-background-tertiary rounded w-1/2" />
              <div className="flex gap-3">
                <div className="h-10 bg-background-tertiary rounded-full w-24" />
                <div className="h-10 bg-background-tertiary rounded-full w-24" />
                <div className="h-10 bg-background-tertiary rounded-full w-10" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <TrackSkeleton key={i} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (albumError || !album) {
    return (
      <div className="flex-1 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Music className="w-16 h-16 mx-auto mb-4 text-text-muted" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Álbum não encontrado</h1>
          <p className="text-text-secondary mb-6">Este álbum pode ter sido removido ou é privado.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const artistName = album.artist?.displayName || album.artist?.username || 'Artista desconhecido';
  const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : '—';
  const trackCount = album._count?.tracks || album.tracks?.length || 0;
  const totalDuration = album.tracks?.reduce((acc: number, t: any) => acc + (t.duration || 0), 0) || 0;
  const isLiked = album.isLiked || false;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <header className="flex gap-6">
            {/* Cover */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 rounded-xl overflow-hidden shadow-2xl">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                    <Music className="w-16 h-16 text-white/50" />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute -bottom-4 -left-4 flex flex-wrap gap-2">
                {album.explicit && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    EXPLICIT
                  </Badge>
                )}
                {album.source && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {album.source}
                  </Badge>
                )}
              </div>
            </div>

            {/* Info & Actions */}
            <div className="flex-1 min-w-0 pt-2">
              {/* Artist */}
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 gap-1 hover:text-primary"
                  onClick={() => album.artist && navigate(`/artist/${album.artist.id}`)}
                >
                  <User className="w-4 h-4" />
                  {artistName}
                  {album.artist?.verified && <Check className="w-3 h-3 text-primary" />}
                </Button>

                <Separator className="h-4 mx-1" />
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {releaseYear}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary truncate mb-3">
                {album.title}
              </h1>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-6">
                <span className="flex items-center gap-1">
                  <ListMusic className="w-4 h-4" />
                  {trackCount} faixas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(totalDuration)}
                </span>
                {album._count?.likes !== undefined && (
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    {formatNumber(album._count.likes)} curtidas
                  </span>
                )}
              </div>

              {/* Description */}
              {album.description && (
                <div className="mb-6">
                  <p className={cn(
                    'text-text-secondary line-clamp-2 transition-all',
                    !showFullDescription && 'max-h-12'
                  )}>
                    {album.description}
                  </p>
                  {album.description.length > 120 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 text-text-secondary hover:text-primary"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? 'Mostrar menos' : 'Mostrar mais'}
                    </Button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Play Button */}
                <Tooltip content="Reproduzir">
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handlePlayClick}
                      size="lg"
                      className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-lg"
                      aria-label={isCurrentAlbumTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                      {isCurrentAlbumTrack && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-1" />
                      )}
                      {isCurrentAlbumTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* Shuffle Play */}
                <Tooltip content="Reproduzir aleatório">
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleShufflePlay}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto gap-2"
                      aria-label="Reproduzir aleatório"
                    >
                      <Shuffle className="w-5 h-5" />
                      Aleatório
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* Like Button */}
                <Tooltip content={isLiked ? 'Descurtir' : 'Curtir'}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isLiked ? 'secondary' : 'outline'}
                      size="lg"
                      onClick={() => {}}
                      className="w-full sm:w-auto gap-2"
                      aria-label={isLiked ? 'Descurtir' : 'Curtir'}
                      aria-pressed={isLiked}
                    >
                      <Heart className={cn('w-5 h-5', isLiked && 'fill-current text-error')} />
                      {isLiked ? 'Curtida' : 'Curtir'}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* Add to Queue */}
                <Tooltip content="Adicionar à fila">
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleAddAllToQueue}
                      className="w-full sm:w-auto gap-2"
                      aria-label="Adicionar à fila"
                    >
                      <Plus className="w-5 h-5" />
                      Fila
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* More Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip content="Mais opções">
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="w-full sm:w-auto p-2"
                          aria-label="Mais opções"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opções do álbum</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handlePlayClick}>
                      {isCurrentAlbumTrack && isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Reproduzir
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShufflePlay}>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Reproduzir aleatório
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Heart className={cn('w-4 h-4 mr-2', isLiked && 'fill-current text-error')} />
                      {isLiked ? 'Descurtir' : 'Curtir'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddAllToQueue}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar à fila
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => album.artist && navigate(`/artist/${album.artist.id}`)}>
                      <User className="w-4 h-4 mr-2" />
                      Ver artista
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="w-4 h-4 mr-2" />
                      Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Tracklist */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Músicas</h2>
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <span>{tracks?.length || 0} de {trackCount} faixas</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </div>
            </div>

            {tracksLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TrackSkeleton key={i} variant="compact" />
                ))}
              </div>
            ) : tracks && tracks.length > 0 ? (
              <div className="space-y-1">
                {tracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    number={index + 1}
                    variant="compact"
                    onPlay={() => play({ type: 'track', trackId: track.id })}
                    onClick={() => navigate(`/track/${track.id}`)}
                    showAlbum={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <h3 className="font-medium text-text-primary mb-2">Este álbum não tem faixas</h3>
              </div>
            )}
          </section>

          {/* Credits / More by Artist */}
          {album.artist && (
            <section>
              <h2 className="font-semibold text-text-primary mb-4">Mais do artista</h2>
              <ArtistCard
                artist={album.artist}
                onClick={() => navigate(`/artist/${album.artist!.id}`)}
              />
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default AlbumPage;
