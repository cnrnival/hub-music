/**
 * Hub Music - Home Page
 * Página inicial: feed com faixas recentes e em destaque
 * Home page: feed with recent and featured tracks
 * 
 * @languages pt-BR / en-US
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TrackCard } from '../components/track/TrackCard';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { cn, formatNumber } from '../lib/utils';
import { Play, Heart, Clock, TrendingUp, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function Home() {
  const { user } = useAuth();

  // Get recently played / recommendations
  const { data: recentTracks } = useQuery({
    queryKey: ['tracks', 'recent'],
    queryFn: async () => {
      const response = await api.getTracks({ sortBy: 'createdAt', sortOrder: 'desc', limit: 10 });
      return response.data.tracks;
    }
  });

  // Get popular tracks
  const { data: popularTracks } = useQuery({
    queryKey: ['tracks', 'popular'],
    queryFn: async () => {
      const response = await api.getTracks({ sortBy: 'playCount', sortOrder: 'desc', limit: 10 });
      return response.data.tracks;
    }
  });

  // Get user's playlists
  const { data: playlists } = useQuery({
    queryKey: ['playlists', 'user'],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.getPlaylists({ userId: user.id, limit: 6 });
      return response.data.playlists;
    },
    enabled: !!user
  });

  // Get trending from search
  const { data: trending } = useQuery({
    queryKey: ['search', 'trending'],
    queryFn: async () => {
      const response = await api.getTrending();
      return response.data;
    }
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm font-bold gradient-text">Bem-vindo, {user?.displayName || 'Visitante'}</h1>
            <p className="text-text-secondary mt-1">
              {user ? 'Continue de onde parou ou descubra novas músicas' : 'Faça login para acessar sua biblioteca personalizada'}
            </p>
          </div>
          {user && (
            <Button>
              <Plus className="w-4 h-4" />
              Nova faixa
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Faixas"
            value={user?._count?.tracks || 0}
            icon={Heart}
          />
          <StatCard
            label="Playlists"
            value={user?._count?.playlists || 0}
            icon={ListMusic}
          />
          <StatCard
            label="Seguidores"
            value={user?._count?.followers || 0}
            icon={TrendingUp}
          />
          <StatCard
            label="Seguindo"
            value={user?._count?.following || 0}
            icon={Clock}
          />
        </div>
      </section>

      {/* Continue Listening */}
      {recentTracks && recentTracks.length > 0 && (
        <Section title="Continue ouvindo" subtitle="Suas faixas recentes">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentTracks.slice(0, 6).map((track) => (
              <TrackCard key={track.id} track={track} variant="compact" />
            ))}
          </div>
        </Section>
      )}

      {/* Popular Tracks */}
      {popularTracks && popularTracks.length > 0 && (
        <Section title="Em alta" subtitle="As mais tocadas da plataforma">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popularTracks.slice(0, 6).map((track) => (
              <TrackCard key={track.id} track={track} variant="compact" />
            ))}
          </div>
        </Section>
      )}

      {/* User Playlists */}
      {user && playlists && playlists.length > 0 && (
        <Section title="Suas playlists" subtitle="Criadas por você">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </Section>
      )}

      {/* Trending Artists */}
      {trending && trending.artists && trending.artists.length > 0 && (
        <Section title="Artistas em destaque" subtitle="Mais pesquisados esta semana">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.artists.slice(0, 6).map((artist, index) => (
              <ArtistCard key={index} name={artist} rank={index + 1} />
            ))}
          </div>
        </Section>
      )}

      {/* Call to action for non-authenticated users */}
      {!user && (
        <Card variant="elevated" className="text-center py-12 px-6">
          <h2 className="text-heading-md font-bold mb-2">Comece sua jornada musical</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Crie sua conta gratuita para fazer upload de músicas, criar playlists,
            seguir artistas e descobrir novos sons.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg">
              <Plus className="w-4 h-4" />
              Criar conta
            </Button>
            <Button variant="secondary" size="lg">Entrar</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-sm font-bold">{title}</h2>
          {subtitle && <p className="text-text-muted text-sm">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="sm">Ver tudo</Button>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className="text-heading-md font-bold">{formatNumber(value)}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}

function ArtistCard({ name, rank }: { name: string; rank: number }) {
  return (
    <Card variant="interactive" className="p-4 text-center group">
      <div className="relative mb-3">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-2xl font-bold text-primary">{rank}</span>
        </div>
        <Badge variant="primary" className="absolute -bottom-2 left-1/2 -translate-x-1/2">#{rank}</Badge>
      </div>
      <h3 className="font-medium text-text-primary line-clamp-1">{name}</h3>
      <p className="text-text-muted text-sm mt-1">Artista</p>
    </Card>
  );
}

import { useAuth } from '../hooks/useAuth';