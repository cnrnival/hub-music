/**
 * Hub Music - SearchSuggestions
 * Dropdown de sugestões de busca com categorias
 * Search suggestions dropdown with categories
 *
 * @languages pt-BR / en-US
 */

import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Music, Users, Film, Mic, Globe, Clock, TrendingUp, X, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';

interface SearchSuggestion {
  type: 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'episode';
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

interface SearchSuggestionsProps {
  query: string;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  trendingSearches: string[];
  isLoading: boolean;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  onSelectRecent: (query: string) => void;
  onSelectTrending: (query: string) => void;
  onRemoveRecent: (query: string) => void;
  onClearRecent: () => void;
  wrapperRef: React.RefObject<HTMLDivElement>;
  showShortcuts?: boolean;
}

export function SearchSuggestions({
  query,
  suggestions,
  recentSearches,
  trendingSearches,
  isLoading,
  onSelectSuggestion,
  onSelectRecent,
  onSelectTrending,
  onRemoveRecent,
  onClearRecent,
  wrapperRef,
  showShortcuts = true,
}: SearchSuggestionsProps) {
  // Group suggestions by type
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, SearchSuggestion[]> = {};
    suggestions.forEach(s => {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type].push(s);
    });
    return groups;
  }, [suggestions]);

  const hasSuggestions = suggestions.length > 0;
  const hasRecent = recentSearches.length > 0;
  const hasTrending = trendingSearches.length > 0;

  if (!hasSuggestions && !hasRecent && !hasTrending && !isLoading && query.trim()) {
    return createPortal(
      <div className="fixed z-50 w-full max-w-md mt-1 bg-background-secondary border border-border-primary rounded-xl shadow-lg overflow-hidden animate-fade-in">
        <div className="p-6 text-center">
          <Search className="w-12 h-12 mx-auto text-text-muted mb-3" />
          <p className="text-text-primary font-medium">Nenhum resultado para &ldquo;<strong>{query}</strong>&rdquo;</p>
          <p className="text-text-secondary text-sm mt-1">Tente buscar com outras palavras</p>
        </div>
      </div>,
      document.body
    );
  }

  if (!hasSuggestions && !hasRecent && !hasTrending && !isLoading) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'track': return <Music className="w-4 h-4" />;
      case 'artist': return <Users className="w-4 h-4" />;
      case 'album': return <Film className="w-4 h-4" />;
      case 'playlist': return <Film className="w-4 h-4" />;
      case 'show': return <Mic className="w-4 h-4" />;
      case 'episode': return <Mic className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'track': return 'Músicas';
      case 'artist': return 'Artistas';
      case 'album': return 'Álbuns';
      case 'playlist': return 'Playlists';
      case 'show': return 'Podcasts';
      case 'episode': return 'Episódios';
      default: return type;
    }
  };

  return createPortal(
    <div
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
      {/* Loading */}
      {isLoading && (
        <div className="px-3 py-2 border-b border-border-primary flex items-center justify-center gap-2 text-sm text-text-muted">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Buscando...
        </div>
      )}

      {/* Suggestions by type */}
      {hasSuggestions && (
        <>
          {Object.entries(groupedSuggestions).map(([type, items]) => (
            <div key={type}>
              <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-border-primary flex items-center gap-2">
                {getTypeIcon(type)}
                {getTypeLabel(type)}
                <span className="ml-auto px-2 py-0.5 text-[10px] bg-background-tertiary rounded">{items.length}</span>
              </div>
              {items.slice(0, 5).map((suggestion, index) => (
                <button
                  key={`${type}-${suggestion.id}`}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className={cn(
                    'w-full px-3 py-2.5 flex items-center gap-3',
                    'hover:bg-background-tertiary transition-colors',
                    'text-left'
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
                  <span className="text-xs text-text-muted">{getTypeLabel(type).slice(0, -1)}</span>
                </button>
              ))}
              {items.length > 5 && (
                <button className="w-full px-3 py-2 text-sm text-primary hover:bg-background-tertiary transition-colors text-left">
                  Ver todos os {items.length} {getTypeLabel(type).toLowerCase()}...
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {/* Recent searches */}
      {hasRecent && !hasSuggestions && (
        <div>
          <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider border-b border-border-primary">
            <span><Clock className="w-4 h-4 inline mr-1" /> Recentes</span>
            {recentSearches.length > 1 && (
              <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary" onClick={onClearRecent}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {recentSearches.slice(0, 8).map((recentQuery, index) => (
            <button
              key={recentQuery}
              onClick={() => onSelectRecent(recentQuery)}
              className={cn(
                'w-full px-3 py-2.5 flex items-center gap-3',
                'hover:bg-background-tertiary transition-colors',
                'text-left'
              )}
            >
              <Clock className="w-5 h-5 text-text-muted flex-shrink-0" />
              <span className="flex-1 text-text-primary truncate">{recentQuery}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveRecent(recentQuery); }}
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
          {trendingSearches.slice(0, 8).map((trendingQuery, index) => (
            <button
              key={trendingQuery}
              onClick={() => onSelectTrending(trendingQuery)}
              className={cn(
                'w-full px-3 py-2.5 flex items-center gap-3',
                'hover:bg-background-tertiary transition-colors',
                'text-left'
              )}
            >
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="flex-1 text-text-primary truncate">{trendingQuery}</span>
              <span className="text-xs text-text-muted">#{index + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* Shortcuts hint */}
      {showShortcuts && (
        <div className="px-3 py-2 border-t border-border-primary bg-background-tertiary/50">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <kbd className="px-1.5 py-0.5 bg-background-primary rounded text-text-primary border border-border-primary">
              ↑ ↓
            </kbd>
            <span>Navegar</span>
            <kbd className="px-1.5 py-0.5 bg-background-primary rounded text-text-primary border border-border-primary ml-2">
              Enter
            </kbd>
            <span>Selecionar</span>
            <kbd className="px-1.5 py-0.5 bg-background-primary rounded text-text-primary border border-border-primary ml-2">
              Esc
            </kbd>
            <span>Fechar</span>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}