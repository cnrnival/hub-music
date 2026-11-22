/**
 * Hub Music - ShowPage
 * Página de show/podcast
 * Show/Podcast page
 *
 * @languages pt-BR / en-US
 */

import { useParams } from 'react-router-dom';
import { Play, Plus, Heart, Share2, MoreHorizontal, ChevronDown, Clock, Mic } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDuration, formatCount, formatDate } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { DropdownMenu } from '../../components/common/DropdownMenu';
import { TrackRow } from '../../components/track/TrackRow';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/ui/skeleton';
import { usePlayerStore } from '../../../state/playerStore';
import { useUIStore } from '../../../state/uiStore';

interface Show {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  author: string;
  authorId: string;
  category: string;
  language: string;
  explicit: boolean;
  totalEpisodes: number;
  totalDuration: number;
  publisher: string;
  website?: string;
  email?: string;
  isFollowing: boolean;
  episodes: Episode[];
}

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
  isPlayed: boolean;
  playProgress: number;
}

export function ShowPage() {
  const { id } = useParams<{ id: string }>();
  const { play, addToQueue } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['show', id],
    queryFn: () => api.get<Show>(`/shows/${id}`).then(res => res.data),
    enabled: !!id,
  });

  if (isLoading) return <ShowSkeleton />;
  if (error || !show) return <ShowNotFound />;

  const handlePlayAll = () => {
    const tracks = show.episodes.map(ep => ({
      id: ep.id,
      title: ep.title,
      artist: show.title,
      album: show.title,
      duration: ep.duration,
      coverUrl: ep.coverUrl || show.coverUrl,
      streamUrl: ep.audioUrl,
      source: 'local' as const,
    }));
    play({ type: 'queue', queue: tracks.map(t => ({ track: t, id: t.id, source: 'local', addedAt: Date.now() })) });
  };

  const handleFollow = async () => {
    // TODO: Implement follow
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-b from-background-secondary to-background-primary pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 pt-12 lg:pt-16">
            {/* Cover */}
            <div className="flex-shrink-0 w-64 h-64 lg:w-80 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={show.coverUrl}
                alt={show.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info & Actions */}
            <div className="flex-1 min-w-0 flex flex-col justify-end lg:justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" dot dotColor="text-red-500">
                  <Mic className="w-3 h-3 mr-1" />
                  Podcast
                </Badge>
                {show.explicit && (
                  <Badge variant="outline" size="sm">
                    Explicit
                  </Badge>
                )}
                <Badge variant="ghost" size="sm">
                  {show.language.toUpperCase()}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-2 truncate">
                {show.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-text-secondary mb-4">
                <span className="flex items-center gap-1">
                  <Avatar size="sm" name={show.author} />
                  {show.author}
                </span>
                <span>{show.totalEpisodes} episódios</span>
                <span>{formatDuration(show.totalDuration)}</span>
                <span>{show.category}</span>
              </div>

              <p className="text-text-secondary mb-6 max-w-2xl line-clamp-3">
                {show.description}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" variant="primary" onClick={handlePlayAll} className="gap-2">
                  <Play className="w-5 h-5" />
                  Ouvir
                </Button>
                <Button size="lg" variant="outline" onClick={handleFollow} className="gap-2">
                  <Heart className="w-5 h-5" />
                  {show.isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
                <Button size="lg" variant="ghost" onClick={() => toggleQueuePanel()} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar à fila
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
                    <DropdownMenuItem>Editar show</DropdownMenuItem>
                    <DropdownMenuItem>Copiar link</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-error">Denunciar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Episodes List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Episódios</h2>
          <select className="px-3 py-1.5 text-sm bg-background-tertiary border border-border-primary rounded-lg text-text-primary">
            <option value="newest">Mais recentes primeiro</option>
            <option value="oldest">Mais antigos primeiro</option>
          </select>
        </div>

        {show.episodes.length === 0 ? (
          <EmptyState
            icon={<Mic className="w-12 h-12 text-text-muted" />}
            title="Nenhum episódio"
            description="Este show ainda não tem episódios publicados."
          />
        ) : (
          <div className="space-y-0" role="list">
            {show.episodes.map((episode, index) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                show={show}
                index={index}
                onPlay={() => {
                  const tracks = show.episodes.slice(index).map(ep => ({
                    id: ep.id,
                    title: ep.title,
                    artist: show.title,
                    album: show.title,
                    duration: ep.duration,
                    coverUrl: ep.coverUrl || show.coverUrl,
                    streamUrl: ep.audioUrl,
                    source: 'local' as const,
                  }));
                  play({ type: 'queue', queue: tracks.map(t => ({ track: t, id: t.id, source: 'local', addedAt: Date.now() })) });
                }}
                onAddToQueue={() => {
                  const track = {
                    id: episode.id,
                    title: episode.title,
                    artist: show.title,
                    album: show.title,
                    duration: episode.duration,
                    coverUrl: episode.coverUrl || show.coverUrl,
                    streamUrl: episode.audioUrl,
                    source: 'local' as const,
                  };
                  addToQueue([track]);
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface EpisodeRowProps {
  episode: Episode;
  show: Show;
  index: number;
  onPlay: () => void;
  onAddToQueue: () => void;
}

function EpisodeRow({ episode, show, index, onPlay, onAddToQueue }: EpisodeRowProps) {
  const isPlaying = false; // TODO: Connect to player store

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 p-3',
        'hover:bg-background-tertiary transition-colors',
        episode.isPlayed && 'opacity-60'
      )}
      role="listitem"
    >
      {/* Play/Number */}
      <div className="flex-shrink-0 w-12 text-center text-text-muted">
        {isPlaying ? (
          <Button size="icon" variant="ghost" onClick={onPlay} className="text-primary">
            <Play className="w-5 h-5" />
          </Button>
        ) : (
          <>
            {episode.playProgress > 0 && episode.playProgress < 100 ? (
              <div className="w-6 h-6 rounded-full border border-primary/30 relative">
                <div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  style={{ clipPath: `polygon(0 0, ${episode.playProgress}% 0, ${episode.playProgress}% 100%, 0 100%)` }}
                />
              </div>
            ) : (
              <span className="text-sm">{index + 1}</span>
            )}
          </>
        )}
      </div>

      {/* Episode Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-text-primary truncate pr-4">
            {episode.title}
          </h3>
          {episode.explicit && (
            <Badge variant="ghost" size="sm">E</Badge>
          )}
          {episode.isPlayed && (
            <CheckCircle className="w-4 h-4 text-success" />
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <span>{formatDate(episode.releaseDate)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(episode.duration)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={onAddToQueue}
          aria-label="Adicionar à fila"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem onClick={onAddToQueue}>Adicionar à fila</DropdownMenuItem>
            <DropdownMenuItem>Baixar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Compartilhar episódio</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

import { cn } from '../../../lib/utils';
import { CheckCircle } from 'lucide-react';

function ShowSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <div className="flex flex-col lg:flex-row gap-8">
        <Skeleton className="w-64 h-64 lg:w-80 lg:h-80 rounded-xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="mt-12 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ShowNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <EmptyState
        title="Show não encontrado"
        description="O show que você procura não existe ou foi removido."
        action={{ label: 'Voltar ao início', onClick: () => window.history.back() }}
      />
    </div>
  );
}