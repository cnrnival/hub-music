/**
 * Hub Music - ArtistPage
 * Página do artista com header, top tracks, álbuns, relacionados
 * Artist page with header, top tracks, albums, related
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Heart, Share2, MoreHorizontal, UserPlus, UserCheck,
  Music, Calendar, Users, Clock, ChevronRight, Check, Download,
  Radio, ExternalLink, Home, PlayCircle, ListMusic, Grid, List,
  Shuffle, Flag
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';
import { ScrollArea } from '@/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/ui/dropdown-menu';
import { TrackCard } from '@/components/track/TrackCard';
import { AlbumCard } from '@/components/album/AlbumCard';
import { ArtistCard } from '@/components/artist/ArtistCard';
import { TrackRow } from '@/components/track/TrackRow';
import { AlbumRow } from '@/components/album/AlbumRow';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { formatNumber, formatDuration, formatRelativeTime } from '@/lib/utils';
import { usePlayerStore } from '@/state/playerStore';
import { useArtist, useArtistTopTracks, useArtistAlbums, useArtistRelated, useFollowArtist } from '@/hooks/data/useProfile';
import { cn } from '@/lib/utils';

interface ArtistPageProps {
  artistId?: string;
}

export function ArtistPage({ artistId: propArtistId }: ArtistPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const artistId = propArtistId || id;

  const { play } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'albums' | 'playlists' | 'related'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: artist, isLoading: artistLoading, error: artistError } = useArtist(artistId || '', { enabled: !!artistId });
  const { data: topTracks, isLoading: tracksLoading } = useArtistTopTracks(artistId || '', { enabled: !!artistId });
  const { data: albums, isLoading: albumsLoading } = useArtistAlbums(artistId || '', { enabled: !!artistId });
  const { data: relatedArtists, isLoading: relatedLoading } = useArtistRelated(artistId || '', { enabled: !!artistId });
  const { mutate: followArtist } = useFollowArtist();

  const isFollowing = artist?.isFollowing || false;
  const followerCount = artist?._count?.followers || 0;
  const monthlyListeners = artist?.monthlyListeners || 0;

  const handleFollowClick = () => {
    if (!artist) return;
    followArtist(artist.id);
  };

  const handlePlayClick = () => {
    if (!artist) return;
    play({ type: 'artist', artistId: artist.id });
  };

  const handleShufflePlay = () => {
    if (!artist) return;
    play({ type: 'artist', artistId: artist.id });
    // TODO: trigger shuffle
  };

  if (artistLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-full bg-background-tertiary flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-background-tertiary rounded w-1/3" />
              <div className="h-4 bg-background-tertiary rounded w-1/4" />
              <div className="h-10 bg-background-tertiary rounded w-24" />
            </div>
          </div>
          <div className="flex gap-4 border-b border-border-primary">
            <div className="h-8 bg-background-tertiary rounded px-4" />
            <div className="h-8 bg-background-tertiary rounded px-4" />
            <div className="h-8 bg-background-tertiary rounded px-4" />
            <div className="h-8 bg-background-tertiary rounded px-4" />
            <div className="h-8 bg-background-tertiary rounded px-4" />
          </div>
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="flex-1 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <User className="w-16 h-16 mx-auto mb-4 text-text-muted" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Artista não encontrado</h1>
          <p className="text-text-secondary mb-6">Este artista pode não existir ou foi removido.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const displayName = artist.displayName || artist.username;
  const isVerified = artist.verified || false;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <header className="relative">
            {/* Cover */}
            <div className="relative h-64 md:h-80 rounded-t-2xl overflow-hidden">
              {artist.coverUrl ? (
                <img
                  src={artist.coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            </div>

            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20 px-4 md:px-6 relative z-10">
              <div className="relative">
                <Avatar
                  src={artist.avatarUrl}
                  name={displayName}
                  size="xxl"
                  className="ring-4 ring-background"
                />
                {isVerified && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 mt-4 md:mt-0 md:mb-4">
                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-text-primary truncate">
                    {displayName}
                  </h1>
                  {isVerified && (
                    <Tooltip content="Artista verificado">
                      <Badge variant="primary" className="gap-1 text-sm">
                        <Check className="w-3 h-3" />
                        Verificado
                      </Badge>
                    </Tooltip>
                  )}
                </div>

                {artist.bio && (
                  <p className="text-text-secondary line-clamp-3 mb-4">{artist.bio}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-text-muted text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatNumber(followerCount)} seguidores
                  </span>
                  <span className="flex items-center gap-1">
                    <Radio className="w-4 h-4" />
                    {formatNumber(monthlyListeners)} ouvintes mensais
                  </span>
                  {artist._count?.tracks && (
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {formatNumber(artist._count.tracks)} músicas
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 md:ml-auto">
                <Button
                  onClick={handlePlayClick}
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-lg"
                >
                  <Play className="w-5 h-5 ml-1" />
                  Reproduzir
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShufflePlay}
                  className="w-full sm:w-auto gap-2"
                >
                  <Shuffle className="w-5 h-5" />
                  Aleatório
                </Button>

                <Button
                  variant={isFollowing ? 'secondary' : 'outline'}
                  size="lg"
                  onClick={handleFollowClick}
                  className="w-full sm:w-auto gap-2"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Seguir
                    </>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto p-2" aria-label="Mais opções">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Opções do artista</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handlePlayClick}>
                      <Play className="w-4 h-4 mr-2" /> Reproduzir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShufflePlay}>
                      <Shuffle className="w-4 h-4 mr-2" /> Reproduzir aleatório
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleFollowClick}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isFollowing ? 'Deixar de seguir' : 'Seguir'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Radio className="w-4 h-4 mr-2" /> Ir para rádio do artista
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" /> Abrir no Spotify
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Flag className="w-4 h-4 mr-2" /> Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="border-b border-border-primary">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1">
                <TabsTrigger value="overview">
                  <Home className="w-4 h-4 mr-2" />
                  Visão geral
                </TabsTrigger>
                <TabsTrigger value="tracks">
                  <Music className="w-4 h-4 mr-2" />
                  Músicas
                  <Badge variant="secondary" className="ml-2 text-[10px]">{artist._count?.tracks || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="albums">
                  <SquarePlay className="w-4 h-4 mr-2" />
                  Álbuns
                  <Badge variant="secondary" className="ml-2 text-[10px]">{artist._count?.albums || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="playlists">
                  <ListMusic className="w-4 h-4 mr-2" />
                  Playlists
                </TabsTrigger>
                <TabsTrigger value="related">
                  <Users className="w-4 h-4 mr-2" />
                  Artistas relacionados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            <TabsContent value="overview" forceMount>
              <div className="space-y-8">
                {/* Top Tracks */}
                {(topTracks && topTracks.length > 0) && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-text-primary flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Músicas populares
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('tracks')}>
                        Ver todas <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {topTracks.slice(0, 5).map((track, index) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          number={index + 1}
                          variant="compact"
                          onPlay={() => play({ type: 'track', trackId: track.id })}
                          showArtist={false}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Albums */}
                {(albums && albums.length > 0) && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-text-primary flex items-center gap-2">
                        <SquarePlay className="w-5 h-5" />
                        Álbuns e EPs
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('albums')}>
                        Ver todos <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {albums.slice(0, 6).map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Related Artists */}
                {(relatedArtists && relatedArtists.length > 0) && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-text-primary flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Artistas relacionados
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('related')}>
                        Ver todos <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {relatedArtists.slice(0, 6).map((relatedArtist) => (
                        <ArtistCard key={relatedArtist.id} artist={relatedArtist} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </TabsContent>

            {/* Tracks Tab */}
            <TabsContent value="tracks" forceMount>
              {tracksLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-lg bg-background-tertiary" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-background-tertiary rounded w-1/2" />
                        <div className="h-3 bg-background-tertiary rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topTracks && topTracks.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        aria-label="Grade"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        aria-label="Lista"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {topTracks.map((track) => (
                        <TrackCard key={track.id} track={track} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {topTracks.map((track, index) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          number={index + 1}
                          onPlay={() => play({ type: 'track', trackId: track.id })}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <p className="text-text-secondary">Nenhuma música encontrada</p>
                </div>
              )}
            </TabsContent>

            {/* Albums Tab */}
            <TabsContent value="albums" forceMount>
              {albumsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse aspect-square bg-background-tertiary rounded-xl" />
                  ))}
                </div>
              ) : albums && albums.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        aria-label="Grade"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        aria-label="Lista"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {albums.map((album, index) => (
                        <AlbumRow key={album.id} album={album} number={index + 1} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <SquarePlay className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <p className="text-text-secondary">Nenhum álbum encontrado</p>
                </div>
              )}
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists" forceMount>
              <div className="text-center py-12">
                <ListMusic className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">Playlists do artista em desenvolvimento</p>
              </div>
            </TabsContent>

            {/* Related Artists Tab */}
            <TabsContent value="related" forceMount>
              {relatedLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse aspect-square bg-background-tertiary rounded-full" />
                  ))}
                </div>
              ) : relatedArtists && relatedArtists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {relatedArtists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <p className="text-text-secondary">Nenhum artista relacionado</p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default ArtistPage;
