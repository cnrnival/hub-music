/**
 * Hub Music - SearchResultsPage
 * Página de resultados de busca com abas por tipo
 * Search results page with type-separated tabs
 *
 * @languages pt-BR / en-US
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronRight, Music, User, SquarePlay, ListMusic, Mic, Filter, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { TrackCard } from '../../../components/track/TrackCard';
import { TrackRow } from '../../../components/track/TrackRow';
import { ArtistCard } from '../../../components/artist/ArtistCard';
import { ArtistRow } from '../../../components/artist/ArtistRow';
import { AlbumCard } from '../../../components/album/AlbumCard';
import { AlbumRow } from '../../../components/album/AlbumRow';
import { PlaylistCard } from '../../../components/playlist/PlaylistCard';
import { PlaylistRow } from '../../../components/playlist/PlaylistRow';
import { TrackSkeleton } from '../../../components/track/TrackSkeleton';
import { ArtistSkeleton } from '../../../components/artist/ArtistSkeleton';
import { AlbumSkeleton } from '../../../components/album/AlbumSkeleton';
import { PlaylistSkeleton } from '../../../components/playlist/PlaylistSkeleton';
import { EmptyState } from '../../../components/common/EmptyState';
import { useSearch } from '../../../hooks/data/useSearch';
import { useSearchStore } from '../../../state/searchStore';
import { useLibraryStore } from '../../../state/libraryStore';

type SearchTab = 'all' | 'tracks' | 'artists' | 'albums' | 'playlists' | 'shows' | 'episodes';

const TABS: { id: SearchTab; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: 'all', label: 'Todos', icon: <Search className="w-4 h-4" /> },
  { id: 'tracks', label: 'Músicas', icon: <Music className="w-4 h-4" /> },
  { id: 'artists', label: 'Artistas', icon: <User className="w-4 h-4" /> },
  { id: 'albums', label: 'Álbuns', icon: <SquarePlay className="w-4 h-4" /> },
  { id: 'playlists', label: 'Playlists', icon: <ListMusic className="w-4 h-4" /> },
  { id: 'shows', label: 'Podcasts', icon: <Mic className="w-4 h-4" /> },
];

export function SearchResultsPage() {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Search results state
  const [tracks, setTracks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);

  // Pagination
  const [tracksPage, setTracksPage] = useState(1);
  const [artistsPage, setArtistsPage] = useState(1);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(1);

  const { unifiedSearch, searchTracks, searchArtists, searchAlbums, searchPlaylists } = useSearch();
  const { addRecentSearch } = useSearchStore();
  const { viewMode: libraryViewMode, setViewMode: setLibraryViewMode } = useLibraryStore();

  // Sync view mode with library store
  useEffect(() => {
    setViewMode(libraryViewMode);
  }, [libraryViewMode]);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    setLibraryViewMode(mode);
  };

  // Perform search when query or tab changes
  const performSearch = useCallback(async (searchQuery: string, tab: SearchTab) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // In production, use the actual search hooks
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockTracks = Array.from({ length: 20 }, (_, i) => ({
        id: `track-${i}`,
        title: `${searchQuery} - Track ${i + 1}`,
        artist: { id: `artist-${i}`, displayName: `Artist ${i + 1}`, username: `artist${i + 1}` },
        album: { id: `album-${i}`, title: `Album ${i + 1}` },
        coverUrl: `https://picsum.photos/seed/track-${i}/300/300`,
        duration: 180 + i * 10,
        explicit: i % 3 === 0,
        source: ['DEEZER', 'JAMENDO', 'FREETOUSE', 'LOCAL'][i % 4],
        _count: { plays: Math.floor(Math.random() * 100000), likes: Math.floor(Math.random() * 5000) },
      }));

      const mockArtists = Array.from({ length: 15 }, (_, i) => ({
        id: `artist-${i}`,
        displayName: `${searchQuery} Artist ${i + 1}`,
        username: `artist${i + 1}`,
        avatarUrl: `https://picsum.photos/seed/artist-${i}/300/300`,
        verified: i % 5 === 0,
        _count: { followers: Math.floor(Math.random() * 100000), tracks: Math.floor(Math.random() * 50) },
      }));

      const mockAlbums = Array.from({ length: 15 }, (_, i) => ({
        id: `album-${i}`,
        title: `${searchQuery} Album ${i + 1}`,
        artist: { id: `artist-${i}`, displayName: `Artist ${i + 1}`, username: `artist${i + 1}` },
        coverUrl: `https://picsum.photos/seed/album-${i}/300/300`,
        releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { tracks: 10 + i, likes: Math.floor(Math.random() * 5000) },
        source: ['DEEZER', 'JAMENDO', 'FREETOUSE'][i % 3],
      }));

      const mockPlaylists = Array.from({ length: 15 }, (_, i) => ({
        id: `playlist-${i}`,
        name: `${searchQuery} Playlist ${i + 1}`,
        description: `Description for playlist ${i + 1}`,
        user: { id: `user-${i}`, displayName: `User ${i + 1}`, username: `user${i + 1}` },
        coverUrl: `https://picsum.photos/seed/playlist-${i}/300/300`,
        visibility: 'PUBLIC',
        _count: { tracks: 20 + i, followers: Math.floor(Math.random() * 1000) },
        tracks: Array.from({ length: 4 }, (_, j) => ({
          track: {
            id: `track-${i * 4 + j}`,
            title: `Track ${i * 4 + j}`,
            coverUrl: `https://picsum.photos/seed/track-${i * 4 + j}/300/300`,
          },
        })),
      }));

      if (tab === 'all' || tab === 'tracks') setTracks(mockTracks);
      if (tab === 'all' || tab === 'artists') setArtists(mockArtists);
      if (tab === 'all' || tab === 'albums') setAlbums(mockAlbums);
      if (tab === 'all' || tab === 'playlists') setPlaylists(mockPlaylists);
      if (tab === 'all' || tab === 'shows') setShows([]);

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial search
  useEffect(() => {
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      addRecentSearch(decodedQuery);
      performSearch(decodedQuery, activeTab);
    }
  }, [query, activeTab, performSearch, addRecentSearch]);

  // Handle tab change
  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    setTracksPage(1);
    setArtistsPage(1);
    setAlbumsPage(1);
    setPlaylistsPage(1);
    if (query) {
      performSearch(decodeURIComponent(query), tab);
    }
  };

  // Load more for infinite scroll
  const handleLoadMore = (tab: SearchTab) => {
    if (query) {
      performSearch(decodeURIComponent(query), tab);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newQuery = formData.get('q') as string;
    if (newQuery.trim()) {
      navigate(`/search/${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    navigate('/search');
  };

  const decodedQuery = query ? decodeURIComponent(query) : '';

  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col">
      {/* Top Bar - Search Input */}
      <div className="border-b border-border-primary bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/search')}
            className="text-text-secondary hover:text-primary"
            aria-label="Voltar"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              name="q"
              type="text"
              placeholder="Buscar músicas, artistas, álbuns..."
              value={decodedQuery}
              className="pl-11 pr-11 py-2.5 bg-background-tertiary/50 border-border-primary focus:border-primary"
              autoFocus
            />
            {decodedQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                onClick={clearSearch}
                aria-label="Limpar busca"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          <Button type="submit" variant="primary" className="hidden sm:flex gap-1">
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </form>

        {/* Mobile search button */}
        <div className="sm:hidden px-4 pb-3">
          <Button type="submit" form="search-form" variant="primary" className="w-full gap-1">
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-primary bg-background/95 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1 bg-transparent p-0">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 px-3 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow"
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && (
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border-primary bg-background/95 backdrop-blur-sm sticky top-52 z-20 px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">
            {decodedQuery ? `Resultados para "${decodedQuery}"` : 'Resultados da busca'}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-background-tertiary rounded-lg p-1" role="group" aria-label="Modo de visualização">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="p-1.5"
              onClick={() => handleViewModeChange('grid')}
              aria-label="Grade"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="p-1.5"
              onClick={() => handleViewModeChange('list')}
              aria-label="Lista"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          <Button variant="outline" size="sm" className="gap-1 hidden md:flex">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <TabsContent value={activeTab} className="space-y-6">
              {/* All Tab */}
              <TabsContent value="all" forceMount>
                <div className="space-y-8">
                  {tracks.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          <Music className="w-5 h-5" />
                          Músicas
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange('tracks')}>
                          Ver todos <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {tracks.slice(0, 12).map((track) => (
                            <TrackCard key={track.id} track={track} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {tracks.slice(0, 10).map((track, index) => (
                            <TrackRow key={track.id} track={track} number={index + 1} />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {artists.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Artistas
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange('artists')}>
                          Ver todos <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {artists.slice(0, 12).map((artist) => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </section>
                  )}

                  {albums.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          <SquarePlay className="w-5 h-5" />
                          Álbuns
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange('albums')}>
                          Ver todos <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {albums.slice(0, 12).map((album) => (
                            <AlbumCard key={album.id} album={album} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {albums.slice(0, 10).map((album, index) => (
                            <AlbumRow key={album.id} album={album} number={index + 1} />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {playlists.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          <ListMusic className="w-5 h-5" />
                          Playlists
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => handleTabChange('playlists')}>
                          Ver todos <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {playlists.slice(0, 12).map((playlist) => (
                            <PlaylistCard key={playlist.id} playlist={playlist} />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {playlists.slice(0, 10).map((playlist, index) => (
                            <PlaylistRow key={playlist.id} playlist={playlist} number={index + 1} />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {tracks.length === 0 && artists.length === 0 && albums.length === 0 && playlists.length === 0 && !isLoading && (
                    <EmptyState
                      icon={Search}
                      title="Nenhum resultado encontrado"
                      description={`Não encontramos nada para "${decodedQuery}"`}
                      action={{ label: 'Tentar outra busca', onClick: () => navigate('/search') }}
                    />
                  )}
                </div>
              </TabsContent>

              {/* Tracks Tab */}
              <TabsContent value="tracks" forceMount>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <TrackSkeleton key={i} />
                    ))}
                  </div>
                ) : tracks.length > 0 ? (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {tracks.map((track) => (
                          <TrackCard key={track.id} track={track} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {tracks.map((track, index) => (
                          <TrackRow key={track.id} track={track} number={index + 1} />
                        ))}
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleLoadMore('tracks')}>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Carregar mais
                    </Button>
                  </>
                ) : (
                  <EmptyState
                    icon={Music}
                    title="Nenhuma música encontrada"
                    description={`Nenhuma música corresponde a "${decodedQuery}"`}
                  />
                )}
              </TabsContent>

              {/* Artists Tab */}
              <TabsContent value="artists" forceMount>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ArtistSkeleton key={i} />
                    ))}
                  </div>
                ) : artists.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleLoadMore('artists')}>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Carregar mais
                    </Button>
                  </>
                ) : (
                  <EmptyState
                    icon={User}
                    title="Nenhum artista encontrado"
                    description={`Nenhum artista corresponde a "${decodedQuery}"`}
                  />
                )}
              </TabsContent>

              {/* Albums Tab */}
              <TabsContent value="albums" forceMount>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <AlbumSkeleton key={i} />
                    ))}
                  </div>
                ) : albums.length > 0 ? (
                  <>
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
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleLoadMore('albums')}>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Carregar mais
                    </Button>
                  </>
                ) : (
                  <EmptyState
                    icon={SquarePlay}
                    title="Nenhum álbum encontrado"
                    description={`Nenhum álbum corresponde a "${decodedQuery}"`}
                  />
                )}
              </TabsContent>

              {/* Playlists Tab */}
              <TabsContent value="playlists" forceMount>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <PlaylistSkeleton key={i} />
                    ))}
                  </div>
                ) : playlists.length > 0 ? (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {playlists.map((playlist) => (
                          <PlaylistCard key={playlist.id} playlist={playlist} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {playlists.map((playlist, index) => (
                          <PlaylistRow key={playlist.id} playlist={playlist} number={index + 1} />
                        ))}
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleLoadMore('playlists')}>
                      <Loader2 className="w-4 h-4 mr-2" />
                      Carregar mais
                    </Button>
                  </>
                ) : (
                  <EmptyState
                    icon={ListMusic}
                    title="Nenhuma playlist encontrada"
                    description={`Nenhuma playlist corresponde a "${decodedQuery}"`}
                  />
                )}
              </TabsContent>

              {/* Shows Tab */}
              <TabsContent value="shows" forceMount>
                <EmptyState
                  icon={Mic}
                  title="Nenhum podcast encontrado"
                  description={`Nenhum podcast corresponde a "${decodedQuery}"`}
                />
              </TabsContent>
            </TabsContent>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

import { Grid, List, Loader2 } from 'lucide-react';