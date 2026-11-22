/**
 * Hub Music - EpisodePage
 * Página de episódio de podcast
 * Podcast episode page
 *
 * @languages pt-BR / en-US
 */

import { useParams } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Heart, Share2, MoreHorizontal, Download, ChevronLeft, Clock, Mic, Volume2, VolumeX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDuration, formatDate, formatCount } from '@/lib/utils';
import { api } from '@/lib/api';
import { Button } from '@/ui/button';
import { Badge } from '@/common/Badge';
import { Avatar } from '@/common/Avatar';
import { DropdownMenu } from '@/common/DropdownMenu';
import { Waveform } from '@/components/player/Waveform';
import { MiniWaveform } from '@/components/player/MiniWaveform';
import { VolumeSlider } from '@/components/player/VolumeSlider';
import { EmptyState } from '@/common/EmptyState';
import { Skeleton } from '@/ui/skeleton';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';
import { CommentSection } from '@/components/social/CommentSection';
import { CommentInput } from '@/components/social/CommentInput';

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  coverUrl: string;
  duration: number;
  releaseDate: string;
  episodeNumber: number;
  seasonNumber?: number;
  explicit: boolean;
  show: {
    id: string;
    title: string;
    coverUrl: string;
    author: string;
  };
  transcript?: string;
  chapters?: Chapter[];
  isLiked: boolean;
  likeCount: number;
  playCount: number;
}

interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
}

export function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    volume,
    next,
    previous,
    playbackRate,
    setPlaybackRate,
  } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => api.get<Episode>(`/episodes/${id}`).then(res => res.data),
    enabled: !!id,
  });

  const isCurrentEpisode = currentTrack?.id === id;

  const handlePlay = () => {
    if (isCurrentEpisode) {
      togglePlay();
    } else {
      play({
        type: 'track',
        trackId: id!,
        startPosition: 0,
      });
    }
  };

  if (isLoading) return <EpisodeSkeleton />;
  if (error || !episode) return <EpisodeNotFound />;

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-background-secondary to-background-primary pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 pt-12">
            {/* Cover & Show Link */}
            <div className="flex-shrink-0 w-64 h-64 lg:w-80 lg:h-80 rounded-xl overflow-hidden shadow-2xl relative">
              <img
                src={episode.coverUrl}
                alt={episode.title}
                className="w-full h-full object-cover"
              />
              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="xl"
                  variant="primary"
                  onClick={handlePlay}
                  className="gap-3 scale-95 hover:scale-100 transition-transform"
                >
                  {isCurrentEpisode && isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7" />
                  )}
                  <span className="text-lg font-medium">
                    {isCurrentEpisode ? (isPlaying ? 'Pausar' : 'Continuar') : 'Ouvir'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-end lg:justify-center">
              {/* Show link */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar size="sm" src={episode.show.coverUrl} name={episode.show.title} />
                <a
                  href={`/show/${episode.show.id}`}
                  className="font-medium text-text-secondary hover:text-primary transition-colors"
                >
                  {episode.show.title}
                </a>
                {episode.seasonNumber && (
                  <Badge variant="ghost" size="sm">
                    Temporada {episode.seasonNumber}
                  </Badge>
                )}
                <Badge variant="ghost" size="sm">
                  Ep. {episode.episodeNumber}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-4">
                {episode.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-text-secondary mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(episode.duration)}
                </span>
                <span>{formatDate(episode.releaseDate)}</span>
                {episode.explicit && <Badge variant="ghost" size="sm">E</Badge>}
                <span className="flex items-center gap-1">
                  <Mic className="w-4 h-4" />
                  {formatCount(episode.playCount)} plays
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none text-text-secondary mb-6 line-clamp-4">
                <p>{episode.description}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" variant="primary" onClick={handlePlay} className="gap-2">
                  {isCurrentEpisode && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {isCurrentEpisode ? (isPlaying ? 'Pausar' : 'Continuar') : 'Ouvir'}
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Heart className="w-5 h-5" />
                  {episode.likeCount} {episode.isLiked ? 'Descurtir' : 'Curtir'}
                </Button>
                <Button size="lg" variant="ghost" onClick={() => toggleQueuePanel()} className="gap-2">
                  <Download className="w-5 h-5" />
                  Baixar
                </Button>
                <Button size="lg" variant="ghost" className="gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Adicionar à playlist</DropdownMenuItem>
                    <DropdownMenuItem>Adicionar à fila</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Velocidade: {playbackRate}x</DropdownMenuItem>
                    <DropdownMenuItem>Timer de sono</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Copiar link</DropdownMenuItem>
                    <DropdownMenuItem className="text-error">Denunciar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Player & Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Waveform Player */}
            {isCurrentEpisode && (
              <div className="bg-background-secondary rounded-xl p-4 border border-border-primary">
                <Waveform
                  trackId={id!}
                  audioUrl={episode.audioUrl}
                  peaks={[]} // Will be fetched by Waveform
                  duration={duration || episode.duration}
                  progress={position || 0}
                  onSeek={seek}
                  onPlay={togglePlay}
                  isPlaying={isPlaying}
                  className="w-full h-32"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => seek(position - 15)}>
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => seek(position + 30)}>
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span>{formatDuration(position)} / {formatDuration(duration || episode.duration)}</span>
                  </div>
                  <VolumeSlider volume={volume} onChange={setVolume} />
                </div>
              </div>
            )}

            {/* Transcript / Chapters Tabs */}
            <div className="bg-background-secondary rounded-xl border border-border-primary overflow-hidden">
              <div className="border-b border-border-primary">
                <nav className="flex -mb-px" role="tablist">
                  <TabButton
                    id="transcript-tab"
                    active={true}
                    onClick={() => {}}
                  >
                    Transcrição
                  </TabButton>
                  {episode.chapters && episode.chapters.length > 0 && (
                    <TabButton
                      id="chapters-tab"
                      active={false}
                      onClick={() => {}}
                    >
                      Capítulos
                    </TabButton>
                  )}
                </nav>
              </div>

              <div className="p-6" role="tabpanel">
                {episode.transcript ? (
                  <div className="prose prose-invert max-w-none text-text-secondary space-y-4">
                    <p className="whitespace-pre-wrap">{episode.transcript}</p>
                  </div>
                ) : (
                  <EmptyState
                    title="Transcrição indisponível"
                    description="Este episódio não possui transcrição disponível no momento."
                  />
                )}

                {episode.chapters && episode.chapters.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="font-semibold text-text-primary">Capítulos</h3>
                    {episode.chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => seek(chapter.startTime)}
                        className="w-full text-left p-3 rounded-lg hover:bg-background-tertiary transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-text-primary">{chapter.title}</p>
                          <p className="text-sm text-text-secondary">
                            {formatDuration(chapter.startTime)} - {formatDuration(chapter.endTime)}
                          </p>
                        </div>
                        <Play className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comments */}
            <CommentSection
              entityType="episode"
              entityId={id!}
              title="Comentários"
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 mt-8 lg:mt-0">
            {/* Up Next / Related Episodes */}
            <div className="bg-background-secondary rounded-xl border border-border-primary p-4 sticky top-24">
              <h3 className="font-semibold text-text-primary mb-4">Próximos episódios</h3>
              <div className="space-y-3">
                {/* TODO: Fetch related episodes */}
                <EmptyState
                  title="Carregando..."
                  description="Buscando próximos episódios"
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function TabButton({ id, active, onClick, children }: { id: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={`${id}-panel`}
      onClick={onClick}
      className={cn(
        'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-text-muted hover:text-text-primary hover:bg-background-tertiary'
      )}
    >
      {children}
    </button>
  );
}

import { cn } from '@/lib/utils';

function EpisodeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <div className="flex flex-col lg:flex-row gap-8">
        <Skeleton className="w-64 h-64 lg:w-80 lg:h-80 rounded-xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="mt-12 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

function EpisodeNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <EmptyState
        title="Episódio não encontrado"
        description="O episódio que você procura não existe ou foi removido."
        action={{ label: 'Voltar ao início', onClick: () => window.history.back() }}
      />
    </div>
  );
}export default EpisodePage;
