/**
 * Hub Music - SearchInput
 * Input de busca com sugestões, atalhos e histórico
 * Search input with suggestions, shortcuts, and history
 *
 * @languages pt-BR / en-US
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Clock, TrendingUp, Keyboard, Command } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/ui/useDebounce';
import { useKeyboardShortcuts } from '@/hooks/ui/useKeyboardShortcuts';
import { api } from '@/lib/api';
import { useSearchStore } from '@/state/searchStore';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showShortcuts?: boolean;
  className?: string;
}

interface SearchSuggestion {
  type: 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'episode' | 'recent' | 'trending';
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  query?: string; // For trending/recent searches
}

export function SearchInput({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = 'O que você quer ouvir?',
  autoFocus = false,
  showShortcuts = true,
  className,
}: SearchInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const value = controlledValue ?? uncontrolledValue;
  const setValue = controlledValue ? onChange : setUncontrolledValue;

  const { recentSearches: storedRecent } = useSearchStore();

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(storedRecent);
  }, [storedRecent]);

  // Load trending searches
  useEffect(() => {
    api.get<string[]>('/search/trending').then(res => {
      setTrendingSearches(res.data.slice(0, 5));
    }).catch(() => {});
  }, []);

  // Debounced search suggestions
  const fetchSuggestions = useDebouncedCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get<SearchSuggestion[]>(`/search/suggest?q=${encodeURIComponent(query)}`);
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
    fetchSuggestions(newValue);
    setSelectedIndex(-1);
  }, [setValue, onChange, fetchSuggestions]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit?.(value.trim());
      // Add to recent searches
      // TODO: Implement via searchStore
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [value, onSubmit]);

  // Keyboard navigation
  useKeyboardShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return;

      const maxIndex = suggestions.length - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            const suggestion = suggestions[selectedIndex];
            if (suggestion.query) {
              onSubmit?.(suggestion.query);
            } else {
              // Navigate to entity
              window.location.href = `/${suggestion.type}/${suggestion.id}`;
            }
            setShowSuggestions(false);
            inputRef.current?.blur();
          } else if (value.trim()) {
            handleSubmit(e as any);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          inputRef.current?.blur();
          break;
      }
    };

    if (showSuggestions) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex, value, onSubmit, handleSubmit]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    if (value.trim() || recentSearches.length > 0 || trendingSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay to allow clicking on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleClear = () => {
    setValue('');
    onChange?.('');
    inputRef.current?.focus();
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.query) {
      onSubmit?.(suggestion.query);
    } else {
      window.location.href = `/${suggestion.type}/${suggestion.id}`;
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleRecentClick = (query: string) => {
    setValue(query);
    onChange?.(query);
    onSubmit?.(query);
    setShowSuggestions(false);
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    // TODO: Implement via searchStore
  };

  // Render suggestions dropdown
  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    const hasSuggestions = suggestions.length > 0;
    const hasRecent = recentSearches.length > 0;
    const hasTrending = trendingSearches.length > 0;

    if (!hasSuggestions && !hasRecent && !hasTrending && value.trim()) {
      return (
        <div className="p-4 text-center text-text-muted">
          Nenhuma sugestão encontrada para &ldquo;<strong>{value}</strong>&rdquo;
        </div>
      );
    }

    return createPortal(
      <div
        ref={suggestionsRef}
        className={cn(
          'fixed z-50 w-full max-w-md mt-1',
          'bg-background-secondary border border-border-primary',
          'rounded-xl shadow-lg overflow-hidden animate-fade-in'
        )}
        style={{
          top: wrapperRef.current?.getBoundingClientRect().bottom,
          left: wrapperRef.current?.getBoundingClientRect().left,
          width: wrapperRef.current?.offsetWidth,
        }}
      >
        {/* Search suggestions */}
        {hasSuggestions && (
          <div>
            <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-border-primary">
              Resultados
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-3 py-2.5 flex items-center gap-3',
                  'hover:bg-background-tertiary transition-colors',
                  'text-left',
                  selectedIndex === index && 'bg-background-tertiary'
                )}
              >
                {suggestion.imageUrl && (
                  <img
                    src={suggestion.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-text-primary truncate">{suggestion.title}</p>
                  {suggestion.subtitle && (
                    <p className="text-sm text-text-secondary truncate">{suggestion.subtitle}</p>
                  )}
                </div>
                <span className="text-xs text-text-muted capitalize">{suggestion.type}</span>
              </button>
            ))}
          </div>
        )}

        {/* Recent searches */}
        {hasRecent && !hasSuggestions && (
          <div>
            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wighter border-b border-border-primary">
              <span>Recentes</span>
              <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary" onClick={() => { /* clear all */ }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {recentSearches.slice(0, 5).map((query, index) => (
              <button
                key={query}
                onClick={() => handleRecentClick(query)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-3 py-2.5 flex items-center gap-3',
                  'hover:bg-background-tertiary transition-colors',
                  'text-left'
                )}
              >
                <Clock className="w-5 h-5 text-text-muted flex-shrink-0" />
                <span className="flex-1 text-text-primary truncate">{query}</span>
                <button
                  onClick={(e) => handleRemoveRecent(e, query)}
                  className="text-text-muted hover:text-error transition-colors p-1"
                  aria-label="Remover do histórico"
                >
                  <X className="w-4 h-4" />
                </button>
              </button>
            ))}
          </div>
        )}

        {/* Trending searches */}
        {hasTrending && !hasSuggestions && !hasRecent && (
          <div>
            <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-border-primary">
              <TrendingUp className="w-4 h-4 inline mr-1" /> Em alta
            </div>
            {trendingSearches.map((query, index) => (
              <button
                key={query}
                onClick={() => handleRecentClick(query)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'w-full px-3 py-2.5 flex items-center gap-3',
                  'hover:bg-background-tertiary transition-colors',
                  'text-left'
                )}
              >
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="flex-1 text-text-primary truncate">{query}</span>
              </button>
            ))}
          </div>
        )}

        {/* Shortcuts hint */}
        {showShortcuts && (
          <div className="px-3 py-2 border-t border-border-primary bg-background-tertiary/50">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Keyboard className="w-4 h-4" />
              <span>Pressione <kbd className="px-1.5 py-0.5 bg-background-primary rounded text-text-primary">Enter</kbd> para buscar</span>
            </div>
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('relative flex items-center', className)}
      onMouseEnter={() => setShowSuggestions(isFocused || value.trim() !== '')}
    >
      <form onSubmit={handleSubmit} className="w-full flex items-center">
        <div className={cn(
          'relative flex-1 flex items-center',
          'bg-background-tertiary border rounded-xl',
          'transition-all duration-200',
          isFocused
            ? 'border-primary bg-background-secondary shadow-lg shadow-primary/10'
            : 'border-border-primary hover:border-border-secondary'
        )}>
          <Search className="absolute left-4 w-5 h-5 text-text-muted pointer-events-none" />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent border-none outline-none',
              'px-12 py-3 text-text-primary placeholder-text-muted',
              'text-base',
              'w-full min-w-0'
            )}
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
          />

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 p-1 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-background-tertiary"
              aria-label="Limpar busca"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {isLoading && (
            <div className="absolute right-12 w-5 h-5">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {showShortcuts && (
            <kbd className="absolute right-4 mr-8 hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-text-muted bg-background-primary rounded">
              <Command className="w-3.5 h-3.5" />
              K
            </kbd>
          )}
        </div>
      </form>

      {renderSuggestions()}
    </div>
  );
}