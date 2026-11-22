/**
 * Hub Music - Library Page
 * Página da biblioteca: faixas curtidas, playlists e seguido/seguidores
 * Library page: liked tracks, playlists and following/followers
 * 
 * @languages pt-BR / en-US
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatNumber, formatDuration } from '../lib/utils';
import { cn } from '../lib/utils';
import { TrackCard } from '../components/track/TrackCard';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { SearchBar } from '../components/search/SearchBar';
import { TabButton } from '../components/ui/tab-button';
import {
  Music,
  Heart,
  ListMusic,
  User,
  Clock,
  Plus,
  Filter,
  Grid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';

const libraryTabs = [
  { id: 'tracks', label: 'Faixas', icon: Music },
  { id: 'likes', label: 'Curtidas', icon: Heart },
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'artists', label: 'Artistas', icon: User }
];

export function Library() {
  const { user } = useAuth();
  const { play, currentTrack, isPlaying } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return (tab === 'likes' || tab === 'playlists' || tab === 'artists') ? tab : 'tracks';
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Update URL when activeTab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const { data: tracksData } = useQuery({
    queryKey: ['library', 'tracks', user?.id],
    queryFn: async () => {
      const response = await api.getTracks({ userId: user!.id, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
      return response.data.tracks;
    },
    enabled: !!user && activeTab === 'tracks'
  });

  const { data: likesData } = useQuery({
    queryKey: ['library', 'likes', user?.id],
    queryFn: async () => {
      const response = await api.getUserLikes(user!.id, { limit: 50 });
      return response.data.tracks;
    },
    enabled: !!user && activeTab === 'likes'
  });

  const { data: playlistsData } = useQuery({
    queryKey: ['library', 'playlists', user?.id],
    queryFn: async () => {
      const response = await api.getPlaylists({ userId: user!.id, limit: 50 });
      return response.data.playlists;
    },
    enabled: !!user && activeTab === 'playlists'
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Card className="p-8 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
            <Music className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-heading-md font-bold">Bem-vindo à sua biblioteca</h2>
          <p className="text-text-secondary">
            Faça login para acessar suas faixas, playlists e músicas curtidas.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Criar conta
            </Button>
            <Button variant="secondary" size="lg">Entrar</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold gradient-text">Biblioteca</h1>
          <p className="text-text-secondary">Suas músicas, playlists e artistas favoritos</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Filtrar">
            <Filter className="w-5 h-5" />
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova playlist
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <nav className="flex gap-1" role="tablist">
          {libraryTabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              icon={tab.icon}
            />
          ))}
        </nav>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-background-tertiary rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            )}
            aria-label="Visualização em grade"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            )}
            aria-label="Visualização em lista"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'tracks' && (
        <TrackLibraryContent
          tracks={tracksData || []}
          loading={tracksData === undefined}
          viewMode={viewMode}
          emptyMessage="Você ainda não enviou nenhuma faixa"
          emptyAction={<Button onClick={() => window.location.href = '/upload'}><Plus className="w-4 h-4 mr-2" />Enviar primeira faixa</Button>}
        />
      )}

      {activeTab === 'likes' && (
        <TrackLibraryContent
          tracks={likesData || []}
          loading={likesData === undefined}
          viewMode={viewMode}
          emptyMessage="Nenhuma faixa curtida ainda"
          emptyDescription="Comece a curtir faixas para vê-las aqui"
        />
      )}

      {activeTab === 'playlists' && (
        <PlaylistLibraryContent
          playlists={playlistsData || []}
          loading={playlistsData === undefined}
          viewMode={viewMode}
          emptyMessage="Nenhuma playlist criada ainda"
          emptyAction={<Button onClick={() => window.location.href = '/upload'}><Plus className="w-4 h-4 mr-2" />Criar playlist</Button>}
        />
      )}

      {activeTab === 'artists' && (
        <ArtistLibraryContent
          user={user}
          loading={false}
          emptyMessage="Siga artistas para vê-los aqui"
        />
      )}
    </div>
  );
}

function TrackLibraryContent({
  tracks,
  loading,
  viewMode,
  emptyMessage,
  emptyDescription,
  emptyAction
}: {
  tracks: any[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  emptyMessage: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'space-y-2'}>
        {[...Array(6)].map((_, i) => (
          viewMode === 'grid' ? <TrackCardSkeleton key={i} /> : <TrackRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Music className="w-16 h-16 text-text-muted/50 mb-4" />
        <h3 className="text-heading-sm font-bold mb-2">{emptyMessage}</h3>
        {emptyDescription && <p className="text-text-secondary mb-6 max-w-md">{emptyDescription}</p>}
        {emptyAction}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} variant="compact" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} variant="list" />
      ))}
    </div>
  );
}

function PlaylistLibraryContent({
  playlists,
  loading,
  viewMode,
  emptyMessage,
  emptyAction
}: {
  playlists: any[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  emptyMessage: string;
  emptyAction?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
        {[...Array(4)].map((_, i) => (
          viewMode === 'grid' ? <PlaylistCardSkeleton key={i} /> : <PlaylistRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ListMusic className="w-16 h-16 text-text-muted/50 mb-4" />
        <h3 className="text-heading-sm font-bold mb-2">{emptyMessage}</h3>
        {emptyAction}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} variant="compact" />
      ))}
    </div>
  );
}

function ArtistLibraryContent({ user, loading, emptyMessage }: { user: any; loading: boolean; emptyMessage: string }) {
  // This would need a followings API call
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <User className="w-16 h-16 text-text-muted/50 mb-4" />
      <h3 className="text-heading-sm font-bold mb-2">Artistas seguidos</h3>
      <p className="text-text-secondary mb-6 max-w-md">{emptyMessage}</p>
      <Button variant="ghost">Explorar artistas</Button>
    </div>
  );
}

function TrackCardSkeleton() {
  return (
    <div className="card-interactive p-4 space-y-3 animate-pulse">
      <div className="aspect-square bg-background-tertiary rounded-xl" />
      <div className="h-4 bg-background-tertiary rounded w-3/4" />
      <div className="h-3 bg-background-tertiary rounded w-1/2" />
    </div>
  );
}

function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-background-tertiary/50 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-background-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-background-tertiary rounded w-1/2" />
        <div className="h-3 bg-background-tertiary rounded w-1/3" />
      </div>
      <div className="w-24 h-4 bg-background-tertiary rounded" />
    </div>
  );
}

function PlaylistCardSkeleton() {
  return (
    <div className="card-interactive p-4 space-y-3 animate-pulse">
      <div className="aspect-square bg-background-tertiary rounded-xl" />
      <div className="h-5 bg-background-tertiary rounded w-3/4" />
      <div className="h-4 bg-background-tertiary rounded w-1/2" />
    </div>
  );
}

function PlaylistRowSkeleton() {
  return (
    <div className="card-interactive p-3 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-background-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-background-tertiary rounded w-1/2" />
        <div className="h-3 bg-background-tertiary rounded w-1/3" />
      </div>
    </div>
  );
}