/**
 * Hub Music - Search Page
 * Página de busca: busca unificada com filtros e resultados
 * Search page: unified search with filters and results
 * 
 * @languages pt-BR / en-US
 */

import { useState, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { TrackCard } from '../components/track/TrackCard';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { cn, formatNumber } from '@/lib/utils';
import { Search as SearchIcon, Filter, Music, Users, ListMusic, ChevronDown, X } from 'lucide-react';

export function Search() {
  const {
    query,
    setQuery,
    source,
    setSource,
    page,
    setPage,
    genreId,
    setGenreId,
    data,
    isLoading,
    suggestions,
    trending,
    genres,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    totalResults
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'users' | 'artists'>('tracks');

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'track') {
      setQuery(suggestion.title);
    } else if (suggestion.type === 'artist') {
      setQuery(suggestion.name);
    } else if (suggestion.type === 'playlist') {
      setQuery(suggestion.name);
    }
    setShowSuggestions(false);
  };

  // Handle trending click
  const handleTrendingClick = (item: string) => {
    setQuery(item);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-display-sm font-bold gradient-text">Buscar</h1>
          <p className="text-text-secondary">Encontre músicas, artistas, playlists e mais</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="O que você quer ouvir?"
            className="w-full pl-12 pr-4 py-4 bg-background-tertiary border border-border rounded-2xl text-text-primary placeholder-text-muted text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {(showSuggestions && (suggestions || trending)) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-card overflow-hidden z-20">
            {suggestions && (suggestions.tracks.length > 0 || suggestions.artists.length > 0 || suggestions.playlists.length > 0) && (
              <div className="p-4 space-y-4">
                {suggestions.tracks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Músicas
                    </h3>
                    <div className="space-y-2">
                      {suggestions.tracks.slice(0, 5).map((track) => (
                        <button
                          key={track.id}
                          onClick={() => handleSuggestionClick(track)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-background-tertiary transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{track.title}</p>
                            <p className="text-sm text-text-secondary truncate">{track.artist}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.artists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Artistas
                    </h3>
                    <div className="space-y-2">
                      {suggestions.artists.slice(0, 5).map((artist, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(artist)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-background-tertiary transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <p className="font-medium text-text-primary truncate">{artist.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.playlists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                      <ListMusic className="w-4 h-4" />
                      Playlists
                    </h3>
                    <div className="space-y-2">
                      {suggestions.playlists.slice(0, 5).map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => handleSuggestionClick(playlist)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-background-tertiary transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                            <ListMusic className="w-5 h-5 text-primary" />
                          </div>
                          <p className="font-medium text-text-primary truncate">{playlist.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(!suggestions || (suggestions.tracks.length === 0 && suggestions.artists.length === 0 && suggestions.playlists.length === 0)) && trending && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <SearchIcon className="w-4 h-4" />
                  Tendências
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trending.artists?.slice(0, 8).map((artist, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingClick(artist)}
                      className="badge-primary"
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {query && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant={source === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSource('all')}
              >
                Todas
              </Button>
              <Button
                variant={source === 'local' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSource('local')}
              >
                Hub Music
              </Button>
              <Button
                variant={source === 'deezer' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSource('deezer')}
              >
                Deezer
              </Button>
            </div>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Gênero</label>
                <select
                  value={genreId || ''}
                  onChange={(e) => setGenreId(e.target.value || undefined)}
                  className="input"
                >
                  <option value="">Todos os gêneros</option>
                  {genres?.map((genre: any) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name} ({genre._count?.tracks || 0})
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {/* Results Tabs */}
          <div className="flex gap-1 border-b border-border/50">
            {[
              { id: 'tracks', label: 'Músicas', count: data?.local?.tracks?.length || 0 },
              { id: 'playlists', label: 'Playlists', count: data?.local?.playlists?.length || 0 },
              { id: 'users', label: 'Pessoas', count: data?.local?.users?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                )}
              >
                {tab.label} {tab.count > 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-background-tertiary rounded-full">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Results Content */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(6)].map((_, i) => (
                <TrackCardSkeleton key={i} />
              ))}
            </div>
          ) : activeTab === 'tracks' && data?.local?.tracks && data.local.tracks.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {data.local.tracks.map((track) => (
                  <TrackCard key={track.id} track={track} variant="compact" />
                ))}
              </div>
              {data.deezer?.tracks && data.deezer.tracks.length > 0 && (
                <>
                  <h3 className="text-heading-sm font-bold mt-8 mb-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Deezer</Badge>
                    Resultados do Deezer
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {data.deezer.tracks.map((track: any) => (
                      <TrackCard key={track.id} track={track} variant="compact" />
                    ))}
                  </div>
                </>
              )}
              {/* Pagination */}
              {(hasPrevPage || hasNextPage) && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="secondary" size="sm" onClick={prevPage} disabled={!hasPrevPage}>
                    Anterior
                  </Button>
                  <span className="text-text-secondary">Página {page} de {data.pagination.totalPages}</span>
                  <Button variant="secondary" size="sm" onClick={nextPage} disabled={!hasNextPage}>
                    Próxima
                  </Button>
                </div>
              )}
            </>
          ) : activeTab === 'playlists' && data?.local?.playlists && data.local.playlists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.local.playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : activeTab === 'users' && data?.local?.users && data.local.users.length > 0 ? (
            <div className="space-y-3">
              {data.local.users.map((user) => (
                <UserSearchResult key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchIcon}
              title="Nenhum resultado encontrado"
              description={`Não encontramos resultados para "${query}"`}
            />
          )}
        </div>
      )}

      {/* Empty State - No Query */}
      {!query && (
        <div className="space-y-8">
          {/* Trending Searches */}
          {trending && (
            <section>
              <h2 className="text-heading-sm font-bold mb-4">Tendências</h2>
              <div className="flex flex-wrap gap-2">
                {trending.artists?.slice(0, 10).map((artist, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(artist)}
                    className="btn-secondary"
                  >
                    <SearchIcon className="w-4 h-4" />
                    {artist}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse by Genre */}
          {genres && genres.length > 0 && (
            <section>
              <h2 className="text-heading-sm font-bold mb-4">Explorar por gênero</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {genres.slice(0, 12).map((genre: any) => (
                  <button
                    key={genre.id}
                    onClick={() => {
                      setGenreId(genre.id);
                      setQuery('');
                    }}
                    className="card-interactive p-4 text-center group"
                  >
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Music className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-medium text-text-primary line-clamp-1">{genre.name}</p>
                    <p className="text-text-muted text-sm">{formatNumber(genre._count?.tracks || 0)} faixas</p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
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

function UserSearchResult({ user }: { user: any }) {
  return (
    <div className="card-interactive p-3 flex items-center gap-4">
      <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{user.displayName || user.username}</p>
        <p className="text-text-muted text-sm">@{user.username}</p>
      </div>
      <Button variant="ghost" size="sm" className="hidden sm:flex">Seguir</Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-heading-sm font-bold mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md">{description}</p>
    </div>
  );
}

import { Avatar } from '../components/ui/avatar';