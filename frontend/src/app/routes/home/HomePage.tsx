/**
 * Hub Music - HomePage
 * Página inicial completa (Home v2 + Subfeed)
 * Complete home page (Home v2 + Subfeed)
 *
 * @languages pt-BR / en-US
 */

import { useQuery } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { ScrollArea } from '@/ui/scroll-area';
import { Skeleton } from '@/ui/skeleton';
import { HeroSection } from './HeroSection';
import { ChipsRow, genreChips, moodChips, decadeChips, activityChips } from './ChipsRow';
import { PlaylistShelf } from './PlaylistShelf';
import { WhatsNewFeed } from './WhatsNewFeed';
import { PromptedPlaylists } from './PromptedPlaylists';
import { SocialPrompting } from './SocialPrompting';
import { ContinueListening } from './ContinueListening';
import { useTracks } from '@/hooks/data/useTracks';
import { usePlaylists } from '@/hooks/data/usePlaylists';
import { useSearch } from '@/hooks/data/useSearch';
import { useLibrary } from '@/hooks/data/useLibrary';

interface HomePageData {
  hero?: {
    id: string;
    type: 'playlist' | 'album' | 'artist';
    title: string;
    subtitle?: string;
    description?: string;
    coverUrl?: string;
    owner?: any;
    _count?: any;
    source?: string;
    explicit?: boolean;
  };
  recentTracks: any[];
  recentAlbums: any[];
  recentPlaylists: any[];
  recentArtists: any[];
  madeForYou: any[];
  dailyMixes: any[];
  discoverWeekly: any[];
  releaseRadar: any[];
  whatsNew: any[];
  byGenre: Record<string, any[]>;
  byMood: Record<string, any[]>;
  byArtist: Record<string, any[]>;
  friends: any[];
}

// Mock data generator for development
function generateMockData(): HomePageData {
  const mockTrack = (id: number) => ({
    id: `track-${id}`,
    title: `Música ${id}`,
    artist: { id: `artist-${id}`, displayName: `Artista ${id}`, username: `artista${id}` },
    album: { id: `album-${id}`, title: `Álbum ${id}` },
    coverUrl: `https://picsum.photos/seed/track-${id}/300/300`,
    duration: 180 + id * 10,
    explicit: id % 3 === 0,
    source: ['DEEZER', 'JAMENDO', 'FREETOUSE'][id % 3],
    _count: { plays: Math.floor(Math.random() * 100000), likes: Math.floor(Math.random() * 5000) },
  });

  const mockAlbum = (id: number) => ({
    id: `album-${id}`,
    title: `Álbum ${id}`,
    artist: { id: `artist-${id}`, displayName: `Artista ${id}`, username: `artista${id}` },
    coverUrl: `https://picsum.photos/seed/album-${id}/300/300`,
    releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    _count: { tracks: 10 + id, likes: Math.floor(Math.random() * 5000) },
    source: ['DEEZER', 'JAMENDO', 'FREETOUSE'][id % 3],
  });

  const mockPlaylist = (id: number) => ({
    id: `playlist-${id}`,
    name: `Playlist ${id}`,
    description: `Descrição da playlist ${id}`,
    user: { id: `user-${id}`, displayName: `Usuário ${id}`, username: `usuario${id}` },
    coverUrl: `https://picsum.photos/seed/playlist-${id}/300/300`,
    visibility: 'PUBLIC',
    _count: { tracks: 20 + id, followers: Math.floor(Math.random() * 1000) },
    tracks: Array.from({ length: 4 }, (_, i) => ({ track: mockTrack(id * 4 + i) })),
  });

  const mockArtist = (id: number) => ({
    id: `artist-${id}`,
    displayName: `Artista ${id}`,
    username: `artista${id}`,
    avatarUrl: `https://picsum.photos/seed/artist-${id}/300/300`,
    verified: id % 5 === 0,
    _count: { followers: Math.floor(Math.random() * 100000) },
  });

  return {
    hero: {
      id: 'playlist-hero',
      type: 'playlist',
      title: 'Suas Descobertas da Semana',
      subtitle: 'Atualizada toda segunda-feira',
      description: 'Uma seleção personalizada de músicas que você vai amar, baseada no seu histórico de reprodução.',
      coverUrl: 'https://picsum.photos/seed/hero/600/600',
      owner: { displayName: 'Hub Music', username: 'hubmusic', verified: true },
      _count: { tracks: 30, followers: 125000 },
      source: 'ALGORITHM',
    },
    recentTracks: Array.from({ length: 10 }, (_, i) => mockTrack(i + 1)),
    recentAlbums: Array.from({ length: 8 }, (_, i) => mockAlbum(i + 1)),
    recentPlaylists: Array.from({ length: 8 }, (_, i) => mockPlaylist(i + 1)),
    recentArtists: Array.from({ length: 8 }, (_, i) => mockArtist(i + 1)),
    madeForYou: Array.from({ length: 6 }, (_, i) => mockPlaylist(i + 100)),
    dailyMixes: Array.from({ length: 6 }, (_, i) => mockPlaylist(i + 200)),
    discoverWeekly: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 300)),
    releaseRadar: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 400)),
    whatsNew: Array.from({ length: 15 }, (_, i) => ({
      id: `feed-${i}`,
      type: ['track', 'album', 'playlist'][i % 3] as any,
      item: i % 3 === 0 ? mockTrack(i) : i % 3 === 1 ? mockAlbum(i) : mockPlaylist(i),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      reason: ['follow', 'saved', 'recommended'][i % 3] as any,
    })),
    byGenre: {
      pop: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 500)),
      hiphop: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 600)),
      rock: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 700)),
      electronic: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 800)),
      rnb: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 900)),
    },
    byMood: {
      chill: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1000)),
      workout: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1100)),
      focus: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1200)),
      party: Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1300)),
    },
    byArtist: {
      'Taylor Swift': Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1400)),
      'Drake': Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1500)),
      'Bad Bunny': Array.from({ length: 4 }, (_, i) => mockPlaylist(i + 1600)),
    },
    friends: Array.from({ length: 8 }, (_, i) => ({
      id: `user-${i}`,
      displayName: `Amigo ${i + 1}`,
      username: `amigo${i + 1}`,
      avatarUrl: `https://picsum.photos/seed/user-${i}/200/200`,
      mutualFollowers: Math.floor(Math.random() * 20),
      source: ['contacts', 'spotify', 'apple', 'facebook', 'suggested'][i % 5] as any,
    })),
  };
}

// Skeleton components for loading states
function HeroSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary p-6 md:p-8 lg:p-12 animate-pulse">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
        <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-xl bg-background-tertiary" />
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-background-tertiary rounded w-1/4" />
          <div className="h-8 bg-background-tertiary rounded w-3/4" />
          <div className="h-5 bg-background-tertiary rounded w-1/2" />
          <div className="flex gap-3">
            <div className="h-12 bg-background-tertiary rounded-full flex-1" />
            <div className="h-12 bg-background-tertiary rounded-full flex-1" />
            <div className="h-12 bg-background-tertiary rounded-full w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ title = 'Seção' }) {
  return (
    <div className="py-4 animate-pulse">
      <div className="px-4 mb-3">
        <div className="h-6 bg-background-tertiary rounded w-1/4" />
      </div>
      <div className="px-4">
        <div className="flex gap-3 pb-2 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40">
              <div className="aspect-square bg-background-tertiary rounded-xl mb-3" />
              <div className="h-5 bg-background-tertiary rounded w-3/4 mb-1" />
              <div className="h-4 bg-background-tertiary rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="py-4 animate-pulse">
      <div className="px-4 mb-3">
        <div className="h-6 bg-background-tertiary rounded w-1/4" />
      </div>
      <div className="px-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-background-tertiary" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-background-tertiary rounded w-1/2" />
                <div className="h-4 bg-background-tertiary rounded w-1/3" />
                <div className="h-3 bg-background-tertiary rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipsSkeleton() {
  return (
    <div className="py-4 animate-pulse">
      <div className="px-4 mb-3">
        <div className="h-6 bg-background-tertiary rounded w-1/4" />
      </div>
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 h-10 bg-background-tertiary rounded-full px-4" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Home Page Component
export function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data fetching
  // In production, replace with actual API calls using React Query
  // const { data: homeData, isLoading } = useQuery({
  //   queryKey: ['home'],
  //   queryFn: fetchHomeData,
  // });

  // For now, use mock data immediately
  if (isLoading) {
    setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 500);
  }

  if (!data) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <ScrollArea className="h-full">
          <div className="px-4 py-6 space-y-8">
            <HeroSkeleton />
            <ChipsSkeleton />
            <SectionSkeleton title="Feito para você" />
            <FeedSkeleton />
            <SectionSkeleton title="Por gênero" />
            <SectionSkeleton title="Encontre amigos" />
            <SectionSkeleton title="Continue ouvindo" />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="px-4 py-6 space-y-8">
          {/* Hero Section */}
          {data.hero && (
            <HeroSection
              item={data.hero}
              onPlay={() => {}}
              onClick={() => {}}
            />
          )}

          {/* Chips Row - Genres */}
          <ChipsRow
            title="Gêneros"
            chips={genreChips}
            onChipClick={(chip) => console.log('Genre clicked:', chip.id)}
            showSeeAll
            onSeeAll={() => console.log('See all genres')}
          />

          {/* Continue Listening */}
          <ContinueListening
            items={data.recentTracks.slice(0, 8).map((track, i) => ({
              id: `recent-${track.id}`,
              type: 'track' as const,
              item: track,
              playedAt: new Date(Date.now() - i * 3600000).toISOString(),
              progress: Math.random() * 80,
            }))}
            onItemClick={(item) => console.log('Track clicked:', item.id)}
            onPlayClick={(item) => console.log('Play track:', item.id)}
            showSeeAll
            onSeeAll={() => console.log('See all recent')}
          />

          {/* Made For You - Daily Mixes */}
          <PlaylistShelf
            title="Feito para você"
            playlists={data.madeForYou}
            onPlaylistClick={(p) => console.log('Playlist clicked:', p.id)}
            onPlayClick={(p) => console.log('Play playlist:', p.id)}
            showSeeAll
            onSeeAll={() => console.log('See all made for you')}
          />

          {/* Daily Mixes */}
          <PlaylistShelf
            title="Daily Mix"
            playlists={data.dailyMixes}
            onPlaylistClick={(p) => console.log('Playlist clicked:', p.id)}
            onPlayClick={(p) => console.log('Play playlist:', p.id)}
            showSeeAll
            onSeeAll={() => console.log('See all daily mixes')}
          />

          {/* Discover Weekly */}
          {data.discoverWeekly.length > 0 && (
            <PlaylistShelf
              title="Descobertas da semana"
              playlists={data.discoverWeekly}
              onPlaylistClick={(p) => console.log('Playlist clicked:', p.id)}
              onPlayClick={(p) => console.log('Play playlist:', p.id)}
              showSeeAll
              onSeeAll={() => console.log('See all discover weekly')}
            />
          )}

          {/* Release Radar */}
          {data.releaseRadar.length > 0 && (
            <PlaylistShelf
              title="Radar de lançamentos"
              playlists={data.releaseRadar}
              onPlaylistClick={(p) => console.log('Playlist clicked:', p.id)}
              onPlayClick={(p) => console.log('Play playlist:', p.id)}
              showSeeAll
              onSeeAll={() => console.log('See all release radar')}
            />
          )}

          {/* What's New Feed */}
          <WhatsNewFeed
            items={data.whatsNew}
            onItemClick={(item) => console.log('Feed item clicked:', item.id)}
            onPlayClick={(item) => console.log('Play feed item:', item.id)}
            showSeeAll
            onSeeAll={() => console.log('See all whats new')}
          />

          {/* Prompted Playlists - By Genre */}
          <PromptedPlaylists
            title="Por gênero"
            prompts={Object.entries(data.byGenre).map(([prompt, playlists]) => ({
              id: `genre-${prompt}`,
              prompt,
              playlists,
            }))}
            onPlaylistClick={(p) => console.log('Playlist clicked:', p.id)}
            onPlayClick={(p) => console.log('Play playlist:', p.id)}
          />

          {/* Prompted Playlists - By Mood */}
          <PromptedPlaylists
            title="Por humor"
            prompts={Object.entries(data.byMood).map(([prompt, playlists]) => ({
              id: `mood-${prompt}`,
              prompt,
              playlists,
            }))}
            onPlaylistClick={(p) => console.log('Playlist clicked:', p.id)}
            onPlayClick={(p) => console.log('Play playlist:', p.id)}
          />

          {/* Social Prompting */}
          <SocialPrompting
            friends={data.friends}
            onFollowClick={(userId) => console.log('Follow user:', userId)}
            onConnectSpotify={() => console.log('Connect Spotify')}
            onConnectApple={() => console.log('Connect Apple Music')}
            onFindFriends={() => console.log('Find friends')}
          />

          {/* Continue Listening - Extended */}
          <ContinueListening
            items={[
              ...data.recentTracks.slice(0, 4).map((track, i) => ({
                id: `recent-track-${track.id}`,
                type: 'track' as const,
                item: track,
                playedAt: new Date(Date.now() - i * 3600000).toISOString(),
                progress: Math.random() * 80,
              })),
              ...data.recentAlbums.slice(0, 2).map((album, i) => ({
                id: `recent-album-${album.id}`,
                type: 'album' as const,
                item: album,
                playedAt: new Date(Date.now() - (i + 4) * 3600000).toISOString(),
                progress: Math.random() * 80,
              })),
              ...data.recentPlaylists.slice(0, 2).map((playlist, i) => ({
                id: `recent-playlist-${playlist.id}`,
                type: 'playlist' as const,
                item: playlist,
                playedAt: new Date(Date.now() - (i + 6) * 3600000).toISOString(),
                progress: Math.random() * 80,
              })),
            ]}
            onItemClick={(item) => console.log('Item clicked:', item.id)}
            onPlayClick={(item) => console.log('Play item:', item.id)}
            showSeeAll
            onSeeAll={() => console.log('See all history')}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

// Export for lazy loading
export default HomePage;