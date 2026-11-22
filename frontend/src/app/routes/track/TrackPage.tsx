/**
 * Hub Music - TrackPage
 * Página da faixa com waveform, letras, comentários, ações
 * Track page with waveform, lyrics, comments, actions
 *
 * @languages pt-BR / en-US
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Heart, Repeat, Shuffle, Volume2, VolumeX,
  Share2, MoreHorizontal, ChevronLeft, ChevronRight,
  Music, User, MessageSquare, Flag, Download, Calendar,
  Clock, ListMusic, Heart as HeartIcon, ExternalLink
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { Slider } from '../../ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../../ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import { Separator } from '../../ui/separator';
import { Waveform } from '../../../components/player/Waveform';
import { MiniWaveform } from '../../../components/player/MiniWaveform';
import { usePlayerStore } from '../../../state/playerStore';
import { useUIStore } from '../../../state/uiStore';
import { useTrack, useTrackWaveform, useTrackStreamUrl, useLikeTrack, useRepostTrack } from '../../../hooks/data/useTracks';
import { useComments, useAddComment } from '../../../hooks/data/useSocial';
import { formatDuration, formatNumber, formatRelativeTime } from '../../../lib/utils';
import { parseLRC, getVisibleLyrics } from '../../../lib/lrc';

interface TrackPageProps {
  trackId?: string;
}

export function TrackPage({ trackId: propTrackId }: TrackPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trackId = propTrackId || id;

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
    currentIndex,
  } = usePlayerStore();

  // UI state
  const { toggleLyricsPanel, lyricsPanelOpen } = useUIStore();

  // Local state
  const [activeTab, setActiveTab] = useState<'lyrics' | 'comments'>('lyrics');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentTimestamp, setCommentTimestamp] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Data fetching
  const { data: track, isLoading: trackLoading, error: trackError } = useTrack(trackId || '', { enabled: !!trackId });
  const { data: waveformData, isLoading: waveformLoading } = useTrackWaveform(trackId || '', { enabled: !!trackId });
  const { data: streamUrl } = useTrackStreamUrl(trackId || '', { enabled: !!trackId && isPlaying });
  const { data: comments, isLoading: commentsLoading } = useComments(trackId || '', { enabled: !!trackId });
  const { mutate: likeTrack } = useLikeTrack();
  const { mutate: repostTrack } = useRepostTrack();
  const { mutate: addComment } = useAddComment();

  // Check if current track matches this page
  const isCurrentTrack = currentTrack?.id === trackId;

  // Handle play/pause
  const handlePlayClick = useCallback(() => {
    if (!track) return;

    if (isCurrentTrack) {
      togglePlay();
    } else {
      play({ type: 'track', trackId: track.id });
    }
  }, [track, isCurrentTrack, togglePlay, play]);

  // Handle like
  const handleLikeClick = useCallback(() => {
    if (!track) return;
    likeTrack(track.id);
  }, [track, likeTrack]);

  // Handle repost
  const handleRepostClick = useCallback(() => {
    if (!track) return;
    repostTrack(track.id);
  }, [track, repostTrack]);

  // Handle add comment
  const handleAddComment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !track) return;

    addComment({
      trackId: track.id,
      content: commentText,
      timestamp: commentTimestamp || undefined,
    });
    setCommentText('');
    setCommentTimestamp(0);
  }, [commentText, commentTimestamp, track, addComment]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!track) return;

    const shareData = {
      title: track.title,
      text: `Ouça "${track.title}" por ${track.artist?.displayName || track.artist?.username} no Hub Music`,
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
      // Show toast
    }
  }, [track]);

  // Format timestamp for comment input
  const formatCommentTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (trackLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
          {/* Hero skeleton */}
          <div className="flex gap-6">
            <div className="w-64 h-64 rounded-xl bg-background-tertiary flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-background-tertiary rounded w-1/3" />
              <div className="h-6 bg-background-tertiary rounded w-1/4" />
              <div className="h-4 bg-background-tertiary rounded w-1/2" />
              <div className="flex gap-3">
                <div className="h-10 bg-background-tertiary rounded-full w-24" />
                <div className="h-10 bg-background-tertiary rounded-full w-24" />
                <div className="h-10 bg-background-tertiary rounded-full w-10" />
              </div>
            </div>
          </div>
          {/* Waveform skeleton */}
          <div className="h-48 bg-background-tertiary rounded-xl" />
          {/* Tabs skeleton */}
          <div className="flex gap-4 border-b border-border-primary">
            <div className="h-8 bg-background-tertiary rounded w-24" />
            <div className="h-8 bg-background-tertiary rounded w-32" />
          </div>
          <div className="h-64 bg-background-tertiary rounded-xl" />
        </div>
      </div>
    );
  }

  if (trackError || !track) {
    return (
      <div className="flex-1 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Music className="w-16 h-16 mx-auto mb-4 text-text-muted" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Faixa não encontrada</h1>
          <p className="text-text-secondary mb-6">Esta faixa pode ter sido removida ou o link está incorreto.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const artistName = track.artist?.displayName || track.artist?.username || 'Artista desconhecido';
  const albumTitle = track.album?.title;
  const releaseYear = track.releaseDate ? new Date(track.releaseDate).getFullYear() : '—';
  const isLiked = track.isLiked || false;
  const isReposted = track.isReposted || false;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Hero Section */}
          <section className="flex gap-6">
            {/* Cover Art */}
            <div className="relative flex-shrink-0">
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl overflow-hidden shadow-2xl">
                {track.coverUrl ? (
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                    <Music className="w-20 h-20 text-white/50" />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute -bottom-4 -left-4 flex flex-wrap gap-2">
                {track.explicit && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    EXPLICIT
                  </Badge>
                )}
                {track.source && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {track.source}
                  </Badge>
                )}
              </div>
            </div>

            {/* Track Info & Actions */}
            <div className="flex-1 min-w-0 pt-2">
              {/* Artist & Album Links */}
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 gap-1 hover:text-primary"
                  onClick={() => track.artist && navigate(`/artist/${track.artist.id}`)}
                >
                  <User className="w-4 h-4" />
                  {artistName}
                  {track.artist?.verified && <Check className="w-3 h-3 text-primary" />}
                </Button>

                {albumTitle && (
                  <>
                    <Separator className="h-4 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 gap-1 hover:text-primary"
                      onClick={() => track.album && navigate(`/album/${track.album.id}`)}
                    >
                      <Music className="w-4 h-4" />
                      {albumTitle}
                    </Button>
                  </>
                )}

                <Separator className="h-4 mx-1" />
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {releaseYear}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary truncate mb-3">
                {track.title}
              </h1>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-text-muted text-sm mb-6">
                <span className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  {formatNumber(track._count?.likes || 0)} curtidas
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {formatNumber(track._count?.comments || 0)} comentários
                </span>
                <span className="flex items-center gap-1">
                  <Repeat className="w-4 h-4" />
                  {formatNumber(track._count?.plays || 0)} plays
                </span>
                {track._count?.reposts && (
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    {formatNumber(track._count.reposts)} reposts
                  </span>
                )}
              </div>

              {/* Description */}
              {track.description && (
                <div className="mb-6">
                  <p className={cn(
                    'text-text-secondary line-clamp-2 transition-all',
                    !showFullDescription && 'max-h-12'
                  )}>
                    {track.description}
                  </p>
                  {track.description.length > 120 && (
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
                      aria-label={isCurrentTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                      {isCurrentTrack && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-1" />
                      )}
                      {isCurrentTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* Like Button */}
                <Tooltip content={isLiked ? 'Descurtir' : 'Curtir'}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isLiked ? 'secondary' : 'outline'}
                      size="lg"
                      onClick={handleLikeClick}
                      className="w-full sm:w-auto gap-2"
                      aria-label={isLiked ? 'Descurtir' : 'Curtir'}
                      aria-pressed={isLiked}
                    >
                      <Heart className={cn('w-5 h-5', isLiked && 'fill-current text-error')} />
                      {isLiked ? 'Curtida' : 'Curtir'}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* Repost Button */}
                <Tooltip content={isReposted ? 'Remover repost' : 'Repostar'}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isReposted ? 'secondary' : 'outline'}
                      size="lg"
                      onClick={handleRepostClick}
                      className="w-full sm:w-auto gap-2"
                      aria-label={isReposted ? 'Remover repost' : 'Repostar'}
                      aria-pressed={isReposted}
                    >
                      <Share2 className={cn('w-5 h-5', isReposted && 'text-primary')} />
                      {isReposted ? 'Repostado' : 'Repostar'}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                {/* Add to Queue */}
                <Tooltip content="Adicionar à fila">
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => track && addToQueue([track])}
                      className="w-full sm:w-auto gap-2"
                      aria-label="Adicionar à fila"
                    >
                      <ListMusic className="w-5 h-5" />
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
                    <DropdownMenuLabel>Opções da faixa</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handlePlayClick}>
                      {isCurrentTrack && isPlaying ? (
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
                    <DropdownMenuItem onClick={handleLikeClick}>
                      <Heart className={cn('w-4 h-4 mr-2', isLiked && 'fill-current text-error')} />
                      {isLiked ? 'Descurtir' : 'Curtir'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRepostClick}>
                      <Share2 className={cn('w-4 h-4 mr-2', isReposted && 'text-primary')} />
                      {isReposted ? 'Remover repost' : 'Repostar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => track && addToQueue([track])}>
                      <ListMusic className="w-4 h-4 mr-2" />
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
                    <DropdownMenuItem>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar à playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="w-4 h-4 mr-2" />
                      Denunciar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => track.artist && navigate(`/artist/${track.artist.id}`)}>
                      <User className="w-4 h-4 mr-2" />
                      Ver artista
                    </DropdownMenuItem>
                    {track.album && (
                      <DropdownMenuItem onClick={() => navigate(`/album/${track.album.id}`)}>
                        <Music className="w-4 h-4 mr-2" />
                        Ver álbum
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Spotify
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </section>

          {/* Waveform Section */}
          <section>
            <div className="relative h-48 md:h-56 rounded-xl overflow-hidden bg-background-tertiary">
              {waveformData?.peaks && waveformRef.current && (
                <Waveform
                  ref={waveformRef}
                  peaks={waveformData.peaks}
                  duration={track.duration || 0}
                  progress={isCurrentTrack ? position : 0}
                  isPlaying={isCurrentTrack && isPlaying}
                  onSeek={seek}
                  waveColor="#FF4081"
                  progressColor="#FF80AB"
                  cursorColor="#FFFFFF"
                />
              )}
              {waveformLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!waveformData?.peaks && !waveformLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  <Music className="w-12 h-12" />
                </div>
              )}

              {/* Timestamp markers for comments */}
              {comments?.filter(c => c.timestamp).map((comment) => (
                <div
                  key={comment.id}
                  className="absolute top-0 bottom-0 w-0.5 bg-primary/50 pointer-events-none"
                  style={{ left: `${(comment.timestamp! / (track.duration || 1)) * 100}%` }}
                />
              ))}
            </div>

            {/* Mini waveform for mobile/compact */}
            <MiniWaveform
              peaks={waveformData?.peaks || []}
              duration={track.duration || 0}
              progress={isCurrentTrack ? position : 0}
              onSeek={seek}
              className="mt-2 md:hidden"
            />
          </section>

          {/* Playback Controls (when this is current track) */}
          {isCurrentTrack && (
            <section className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" onClick={toggleShuffle} aria-label="Aleatório" className={cn('', /* shuffle */ false && 'text-primary')}>
                  <Shuffle className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={previous} aria-label="Anterior">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={next} aria-label="Próxima">
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleRepeat} aria-label="Repetir" className={cn('', /* repeat */ false && 'text-primary')}>
                  <Repeat className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-text-secondary text-sm">
                <span className="w-12 text-right">{formatDuration(position)}</span>
                <div className="flex-1 max-w-xs">
                  <Slider
                    value={Math.min(position, track.duration || 0)}
                    max={track.duration || 100}
                    step={1}
                    onValueChange={seek}
                    className="h-1"
                  />
                </div>
                <span className="w-12">{formatDuration(track.duration || 0)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={volume === 0 ? 'Ativar som' : 'Mutar'}>
                  {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={volume}
                  max={1}
                  step={0.05}
                  onValueChange={setVolume}
                  className="w-24 h-1"
                  aria-label="Volume"
                />
              </div>
            </section>
          )}

          {/* Tabs: Lyrics & Comments */}
          <section>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="lyrics">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Letras
                  {track.lyrics && <Badge variant="secondary" className="ml-2 text-[10px]">Disponível</Badge>}
                </TabsTrigger>
                <TabsTrigger value="comments">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comentários
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    {track._count?.comments || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Lyrics Tab */}
              <TabsContent value="lyrics" className="mt-4">
                {track.lyrics ? (
                  <div className="max-h-[500px] overflow-y-auto space-y-3 p-2">
                    {(() => {
                      const parsed = parseLRC(track.lyrics);
                      const visible = getVisibleLyrics(parsed, isCurrentTrack ? position : 0);
                      return parsed.map((line, index) => (
                        <p
                          key={index}
                          className={cn(
                            'text-center text-lg md:text-xl transition-colors duration-300 px-4 py-2 rounded-lg',
                            index === visible.currentIndex
                              ? 'text-text-primary font-medium bg-primary/10'
                              : 'text-text-secondary'
                          )}
                        >
                          {line.text || '♪'}
                        </p>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                    <h3 className="font-medium text-text-primary mb-2">Letra não disponível</h3>
                    <p className="text-text-secondary">
                      Esta faixa não possui letra sincronizada no momento.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-4">
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6 p-4 bg-background-tertiary/50 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar src={track.artist?.avatarUrl} name={artistName} size="md" />
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="w-full bg-background-secondary border border-border-primary rounded-lg px-4 py-2 text-text-primary placeholder-text-muted resize-none focus:border-primary focus:outline-none"
                        rows={2}
                        maxLength={280}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCommentTimestamp(isCurrentTrack ? position : 0)}
                            className="gap-1"
                          >
                            <Clock className="w-4 h-4" />
                            {formatCommentTime(isCurrentTrack ? position : 0)}
                          </Button>
                          <span className="text-text-muted text-sm">
                            {commentText.length}/280
                          </span>
                        </div>
                        <Button type="submit" variant="primary" size="sm" disabled={!commentText.trim()}>
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-background-tertiary" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-background-tertiary rounded w-1/4" />
                          <div className="h-4 bg-background-tertiary rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar
                          src={comment.user?.avatarUrl}
                          name={comment.user?.displayName || comment.user?.username}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto px-0 font-medium text-text-primary hover:text-primary"
                              onClick={() => comment.user && navigate(`/profile/${comment.user.username}`)}
                            >
                              {comment.user?.displayName || comment.user?.username}
                            </Button>
                            {comment.timestamp && (
                              <Tooltip content={`Timestamp: ${formatCommentTime(comment.timestamp)}`}>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-auto px-1 text-text-muted hover:text-primary" onClick={() => isCurrentTrack && seek(comment.timestamp!)}>
                                    <Clock className="w-4 h-4" />
                                    {formatCommentTime(comment.timestamp)}
                                  </Button>
                                </TooltipTrigger>
                              </Tooltip>
                            )}
                            <span className="text-text-muted text-sm">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-text-secondary">{comment.content}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-text-muted hover:text-primary">
                          <Heart className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                    <h3 className="font-medium text-text-primary mb-2">Nenhum comentário ainda</h3>
                    <p className="text-text-secondary">Seja o primeiro a comentar nesta faixa!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          {/* Queue Panel Trigger */}
          {isCurrentTrack && queue.length > 0 && (
            <section>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => useUIStore.getState().toggleQueuePanel()}
              >
                <ListMusic className="w-5 h-5" />
                Fila ({queue.length}) <ChevronRight className="w-5 h-5" />
              </Button>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

import { cn } from '../../../lib/utils';
import { Check, Plus, Grid, List, Download } from 'lucide-react';