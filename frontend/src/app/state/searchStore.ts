/**
 * Hub Music - Search Store (Zustand)
 * Estado de busca: pesquisas recentes, sugestões cache, trending
 * Search state: recent searches, suggestions cache, trending
 *
 * @languages pt-BR / en-US
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SearchSuggestion {
  id: string;
  type: 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'episode';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  entityId: string;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
  type?: 'local' | 'deezer' | 'all';
}

export interface TrendingItem {
  id: string;
  type: 'track' | 'artist' | 'album' | 'playlist';
  title: string;
  subtitle: string;
  imageUrl?: string;
  score: number;
}

export interface SearchState {
  // Recent searches (max 10)
  recentSearches: RecentSearch[];
  addRecentSearch: (query: string, type?: RecentSearch['type']) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Suggestions cache (query -> suggestions)
  suggestionsCache: Record<string, SearchSuggestion[]>;
  setSuggestions: (query: string, suggestions: SearchSuggestion[]) => void;
  getSuggestions: (query: string) => SearchSuggestion[] | undefined;
  clearSuggestionsCache: () => void;

  // Trending
  trending: TrendingItem[];
  trendingLastFetched: number;
  setTrending: (items: TrendingItem[]) => void;
  isTrendingStale: () => boolean;

  // Search history for autocomplete
  searchHistory: string[];
  addToHistory: (query: string) => void;
}

const MAX_RECENT_SEARCHES = 10;
const MAX_HISTORY = 20;
const TRENDING_TTL = 1000 * 60 * 30; // 30 minutes

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Recent searches
      recentSearches: [],
      addRecentSearch: (query, type) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s.query.toLowerCase() !== trimmed.toLowerCase());
          return {
            recentSearches: [{ query: trimmed, timestamp: Date.now(), type }, ...filtered].slice(0, MAX_RECENT_SEARCHES),
          };
        });
      },
      removeRecentSearch: (query) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s.query.toLowerCase() !== query.toLowerCase()),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Suggestions cache
      suggestionsCache: {},
      setSuggestions: (query, suggestions) =>
        set((state) => ({
          suggestionsCache: {
            ...state.suggestionsCache,
            [query.toLowerCase()]: suggestions,
          },
        })),
      getSuggestions: (query) => get().suggestionsCache[query.toLowerCase()],
      clearSuggestionsCache: () => set({ suggestionsCache: {} }),

      // Trending
      trending: [],
      trendingLastFetched: 0,
      setTrending: (items) => set({ trending: items, trendingLastFetched: Date.now() }),
      isTrendingStale: () => Date.now() - get().trendingLastFetched > TRENDING_TTL,

      // Search history
      searchHistory: [],
      addToHistory: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const filtered = state.searchHistory.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
          return { searchHistory: [trimmed, ...filtered].slice(0, MAX_HISTORY) };
        }),
    }),
    {
      name: 'hubmusic:search',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        suggestionsCache: state.suggestionsCache,
        trending: state.trending,
        trendingLastFetched: state.trendingLastFetched,
        searchHistory: state.searchHistory,
      }),
    }
  )
);