/**
 * Hub Music - PlaylistPage
 * Página de playlist com header, tracklist, ações
 * Playlist page with header, tracklist, actions
 *
 * @languages pt-BR / en-US
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Heart, Share2, MoreHorizontal, ChevronLeft, ChevronRight,
  Music, User, Calendar, ListMusic, Heart as HeartIcon, Edit, Trash2,
  Download, Plus, Shuffle, Repeat, Volume2, VolumeX, Clock
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
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';
import { usePlaylist, usePlaylistTracks, useFollowPlaylist, usePlaylistTracksInfinite } from '@/hooks/data/usePlaylists';
import { formatDuration, formatNumber, formatRelativeTime } from '@/lib/utils';

interface PlaylistPageProps {
  playlistId?: string;
}

export function PlaylistPage({ playlistId: propPlaylistId }: PlaylistPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlistId = propPlaylistId || id;

  // Player state
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    play,
    pause,
    togglePlay,
    seek,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    queue,
  } = usePlayerStore();

  // UI state
  const { toggleQueuePanel } = useUIStore();

  // Local state
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Data fetching
  const { data: playlist, isLoading: playlistLoading, error: playlistError } = usePlaylist(playlistId || '', { enabled: !!playlistId });
  const { data: tracks, isLoading: tracksLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePlaylistTracksInfinite(playlistId || '', { enabled: !!playlistId });
  const { mutate: followPlaylist } = useFollowPlaylist();

  // Check if current track is from this playlist
  const isCurrentPlaylistTrack = currentTrack && playlist?.tracks?.some((t: any) => t.track?.id === currentTrack.id || t.id === currentTrack.id);

  // Handle play/pause
  const handlePlayClick = useCallback(() => {
    if (!playlist) return;

    if (isCurrentPlaylistTrack) {
      togglePlay();
    } else {
      play({ type: 'playlist', playlistId: playlist.id, startIndex: 0 });
    }
  }, [playlist, isCurrentPlaylistTrack, togglePlay, play]);

  // Handle shuffle play
  const handleShufflePlay = useCallback(() => {
    if (!playlist) return;
    play({ type: 'playlist', playlistId: playlist.id, startIndex: 0 });
    toggleShuffle();
  }, [playlist, play, toggleShuffle]);

  // Handle follow
  const handleFollowClick = useCallback(() => {
    if (!playlist) return;
    followPlaylist(playlist.id);
  }, [playlist, followPlaylist]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!playlist) return;

    const shareData = {
      title: playlist.name,
      text: `Ouça "${playlist.name}" por ${playlist.user?.displayName || playlist.user?.username} no Hub Music`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [playlist]);

  // Handle add all to queue
  const handleAddAllToQueue = useCallback(() => {
    if (!tracks) return;
    const allTracks = tracks.pages.flatMap(page => page.tracks?.map((t: any) => t.track || t).filter(Boolean) || []);
    addToQueue(allTracks);
  }, [tracks, addToQueue]);

  if (playlistLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-64 h-64 rounded-xl bg-background-tertiary flex-shrink-0" />
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

  if (playlistError || !playlist) {
    return (
      <div className="flex-1 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <ListMusic className="w-16 h-16 mx-auto mb-4 text-text-muted" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Playlist não encontrada</h1>
          <p className="text-text-secondary mb-6">Esta playlist pode ter sido removida ou é privada.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const ownerName = playlist.user?.displayName || playlist.user?.username || 'Usuário desconhecido';
  const isOwner = playlist.user?.id === 'current-user-id'; // TODO: get from auth
  const isFollowed = playlist.isFollowed || false;
  const trackCount = playlist._count?.tracks || playlist.tracks?.length || 0;
  const followerCount = playlist._count?.followers || 0;
  const totalDuration = playlist.tracks?.reduce((acc: number, t: any) => acc + (t.track?.duration || t.duration || 0), 0) || 0;

  const allTracks = tracks?.pages.flatMap(page => page.tracks?.map((t: any) => t.track || t).filter(Boolean) || []) || [];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <header className="flex gap-6">
            {/* Cover */}
            <div className="relative flex-shrink-0">
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl overflow-hidden shadow-2xl">
                {playlist.coverUrl ? (
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                    <ListMusic className="w-20 h-20 text-white/50" />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute -bottom-4 -left-4 flex flex-wrap gap-2">
                <Badge variant={playlist.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5">
                  {playlist.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                  {trackCount} faixas
                </Badge>
              </div>
            </div>

            {/* Info & Actions */}
            <div className="flex-1 min-w-0 pt-2">
              {/* Owner */}
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 gap-1 hover:text-primary"
                  onClick={() => playlist.user && navigate(`/profile/${playlist.user.username}`)}
                >
                  <User className="w-4 h-4" />
                  {ownerName}
                </Button>

                <Separator className="h-4 mx-1" />
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {playlist.createdAt ? formatRelativeTime(playlist.createdAt) : '—'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary truncate mb-3">
                {playlist.name}
              </h1>

              {/* Description */}
              {playlist.description && (
                <div className="mb-6">
                  <p className={cn(
                    'text-text-secondary line-clamp-2 transition-all',
                    !showFullDescription && 'max-h-12'
                  )}>
                    {playlist.description}
                  </p>
                  {playlist.description.length > 120 && (
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
                <span className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  {formatNumber(followerCount)} curtidas
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Play Button */}
                <Tooltip content="Reproduzir">
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handlePlayClick}
                      size="lg"
                      className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-lg"
                      aria-label={isCurrentPlaylistTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                      {isCurrentPlaylistTrack && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-1" />
                      )}
                      {isCurrentPlaylistTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
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

                {/* Follow Button */}
                <Tooltip content={isFollowed ? 'Deixar de seguir' : 'Seguir'}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isFollowed ? 'secondary' : 'outline'}
                      size="lg"
                      onClick={handleFollowClick}
                      className="w-full sm:w-auto gap-2"
                      aria-label={isFollowed ? 'Deixar de seguir' : 'Seguir'}
                      aria-pressed={isFollowed}
                    >
                      <Heart className={cn('w-5 h-5', isFollowed && 'fill-current text-error')} />
                      {isFollowed ? 'Seguindo' : 'Seguir'}
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
                    <DropdownMenuLabel>Opções da playlist</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handlePlayClick}>
                      {isCurrentPlaylistTrack && isPlaying ? (
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
                    <DropdownMenuItem onClick={handleFollowClick}>
                      <Heart className={cn('w-4 h-4 mr-2', isFollowed && 'fill-current text-error')} />
                      {isFollowed ? 'Deixar de seguir' : 'Seguir'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddAllToQueue}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar à fila
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isOwner && (
                      <>
                        <DropdownMenuItem onClick={() => navigate(`/playlist/${playlist.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar playlist
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-error">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir playlist
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar playlist similar
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
                <span>{allTracks.length} de {trackCount} faixas</span>
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
            ) : allTracks.length > 0 ? (
              <div className="space-y-1">
                {allTracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    number={index + 1}
                    variant="compact"
                    onPlay={() => play({ type: 'track', trackId: track.id })}
                    onClick={() => navigate(`/track/${track.id}`)}
                    showPlaylist={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ListMusic className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <h3 className="font-medium text-text-primary mb-2">Esta playlist está vazia</h3>
                <p className="text-text-secondary mb-4">Adicione músicas para começar a ouvir.</p>
                {isOwner && (
                  <Button variant="primary" size="sm" onClick={() => navigate(`/playlist/${playlist.id}/edit`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Editar playlist
                  </Button>
                )}
              </div>
            )}

            {/* Load More */}
            {hasNextPage && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full sm:w-auto"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Carregar mais faixas
                    </>
                  )}
                </Button>
              </div>
            )}
          </section>

          {/* Related Playlists */}
          {/* TODO: Add related playlists section */}
        </div>
      </ScrollArea>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Loader2, ChevronDown } from 'lucide-react';export default PlaylistPage;
