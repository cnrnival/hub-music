/**
 * Hub Music - SearchPage
 * Página de busca inicial com sugestões e histórico
 * Search landing page with suggestions and history
 *
 * @languages pt-BR / en-US
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Music, User, ListMusic, PlayCircle, Mic, ChevronRight } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { ScrollArea } from '@/ui/scroll-area';
import { Avatar } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { useSearchStore } from '@/state/searchStore';
import { useSearch } from '@/hooks/data/useSearch';

interface SearchSuggestion {
  type: 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'query';
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  query?: string;
}

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trending, setTrending] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { searchSuggestions, trendingSearches } = useSearch();
  const { recentSearches: storeRecentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();

  // Load recent searches and trending on mount
  useEffect(() => {
    setRecentSearches(storeRecentSearches);
    // Fetch trending searches
    trendingSearches({ enabled: true });
  }, [storeRecentSearches, trendingSearches]);

  // Debounced search suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        // In production, use the actual search suggestions API
        // For now, simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 300));

        const mockSuggestions: SearchSuggestion[] = [
          { type: 'query', id: `q-1`, title: query, query: query, subtitle: 'Pesquisar por "' + query + '"' },
          { type: 'track', id: `t-1`, title: `${query} - Música 1`, subtitle: 'Artista 1', imageUrl: 'https://picsum.photos/seed/track1/100/100' },
          { type: 'track', id: `t-2`, title: `${query} - Música 2`, subtitle: 'Artista 2', imageUrl: 'https://picsum.photos/seed/track2/100/100' },
          { type: 'artist', id: `a-1`, title: `Artista ${query}`, subtitle: '10.000 ouvintes', imageUrl: 'https://picsum.photos/seed/artist1/100/100' },
          { type: 'album', id: `al-1`, title: `Álbum ${query}`, subtitle: 'Artista 1 • 2024', imageUrl: 'https://picsum.photos/seed/album1/100/100' },
          { type: 'playlist', id: `pl-1`, title: `Playlist ${query}`, subtitle: 'Por Usuário 1 • 50 faixas', imageUrl: 'https://picsum.photos/seed/playlist1/100/100' },
        ];
        setSuggestions(mockSuggestions);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch(query);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    addRecentSearch(searchQuery.trim());
    setShowSuggestions(false);
    navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'query' && suggestion.query) {
      handleSearch(suggestion.query);
    } else {
      // Navigate to entity page
      const entityMap: Record<string, string> = {
        track: 'track',
        artist: 'artist',
        album: 'album',
        playlist: 'playlist',
      };
      const route = entityMap[suggestion.type];
      if (route) {
        addRecentSearch(suggestion.title);
        navigate(`/${route}/${suggestion.id}`);
      }
    }
  };

  const handleRecentClick = (recent: string) => {
    handleSearch(recent);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'track': return <Music className="w-5 h-5" />;
      case 'artist': return <User className="w-5 h-5" />;
      case 'album': return <SquarePlay className="w-5 h-5" />;
      case 'playlist': return <ListMusic className="w-5 h-5" />;
      case 'show': return <Mic className="w-5 h-5" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  const getSuggestionBadge = (type: SearchSuggestion['type']) => {
    const labels: Record<string, string> = {
      track: 'Música',
      artist: 'Artista',
      album: 'Álbum',
      playlist: 'Playlist',
      show: 'Podcast',
      query: 'Pesquisar',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-8">
          {/* Search Input */}
          <div className="relative" ref={suggestionsRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="O que você quer ouvir?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                className="pl-12 pr-12 py-4 text-lg bg-background-tertiary/50 border-border-primary focus:border-primary"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  aria-label="Limpar busca"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background-secondary border border-border-primary rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                {isLoadingSuggestions && (
                  <div className="p-4 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!isLoadingSuggestions && (
                  <div className="max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-tertiary transition-colors border-t border-border-primary/50 first:border-t-0"
                      >
                        {suggestion.imageUrl ? (
                          <img
                            src={suggestion.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center flex-shrink-0">
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-text-primary truncate">{suggestion.title}</p>
                          {suggestion.subtitle && (
                            <p className="text-text-secondary text-sm truncate">{suggestion.subtitle}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0">
                          {getSuggestionBadge(suggestion.type)}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trending Searches */}
          {trending.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Tendências
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.slice(0, 10).map((item, index) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleSearch(item.title)}
                  >
                    <span className="text-text-muted text-[11px]">{index + 1}.</span>
                    <span className="font-medium text-text-primary">{item.title}</span>
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </Button>
                ))}
              </div>
            </section>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Pesquisas recentes
                </h2>
                {recentSearches.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-secondary hover:text-primary"
                    onClick={handleClearRecent}
                  >
                    Limpar tudo
                  </Button>
                )}
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 10).map((recent, index) => (
                  <button
                    key={recent}
                    onClick={() => handleRecentClick(recent)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-tertiary rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-text-primary truncate">{recent}</p>
                      <p className="text-text-muted text-sm">Pesquisado recentemente</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse Categories */}
          <section>
            <h2 className="font-semibold text-text-primary text-lg mb-4">Navegar por categoria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Músicas', icon: Music, href: '/search/tracks' },
                { label: 'Artistas', icon: User, href: '/search/artists' },
                { label: 'Álbuns', icon: SquarePlay, href: '/search/albums' },
                { label: 'Playlists', icon: ListMusic, href: '/search/playlists' },
                { label: 'Podcasts', icon: Mic, href: '/search/shows' },
                { label: 'Gêneros', icon: <Music className="w-5 h-5" />, href: '/search/genres' },
                { label: 'Humores', icon: <Heart className="w-5 h-5" />, href: '/search/moods' },
                { label: 'Décadas', icon: <Clock className="w-5 h-5" />, href: '/search/decades' },
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => navigate(cat.href)}
                  className="card-hover p-4 flex flex-col items-center gap-3 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {cat.icon}
                  </div>
                  <span className="font-medium text-text-primary">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

import { Heart } from 'lucide-react';export default SearchPage;
