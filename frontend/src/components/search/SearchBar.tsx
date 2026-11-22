/**
 * Hub Music - Search Bar Component
 * Componente Busca: campo de busca com sugestões e filtros
 * Search Bar component: search bar with suggestions and filters
 * 
 * @languages pt-BR / en-US
 */

import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, X, Filter, Music } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  onFilterClick?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Buscar músicas, artistas, playlists...',
  showFilters = true,
  onFilterClick,
  className
}: SearchBarProps) {
  const { query, setQuery, source, setSource, suggestions, trending } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setFocused(true);
    if (query.length >= 2) setShowSuggestions(true);
  };

  const handleBlur = () => {
    setFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'track') {
      setQuery(suggestion.title);
    } else if (suggestion.type === 'artist') {
      setQuery(suggestion.name);
    } else if (suggestion.type === 'playlist') {
      setQuery(suggestion.name);
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleTrendingClick = (item: string) => {
    setQuery(item);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-background-tertiary border border-border rounded-xl text-text-primary placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
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
      {(showSuggestions || focused) && (suggestions || trending) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-card overflow-hidden z-20"
        >
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
                    <Music className="w-4 h-4" />
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
                          <Music className="w-5 h-5 text-primary" />
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
                    <Music className="w-4 h-4" />
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
                          <Music className="w-5 h-5 text-primary" />
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
                <Search className="w-4 h-4" />
                Tendências
              </h3>
              <div className="flex flex-wrap gap-2">
                {trending.artists?.slice(0, 8).map((artist, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(artist)}
                    className="px-3 py-1.5 bg-background-tertiary text-text-secondary rounded-full text-sm hover:bg-background-hover hover:text-text-primary transition-colors"
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
  );
}