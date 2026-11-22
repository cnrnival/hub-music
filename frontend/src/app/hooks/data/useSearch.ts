/**
 * Hub Music - useSearch Hooks
 * React Query hooks para busca unificada, sugestões, trending
 * React Query hooks for unified search, suggestions, trending
 *
 * @languages pt-BR / en-US
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSearchStore } from '@/state/searchStore';
import type { SearchSuggestion, TrendingItem } from '@/state/searchStore';

// Query keys
export const searchKeys = {
  all: ['search'] as const,
  results: (query: string, options?: any) => [...searchKeys.all, 'results', query, options] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
  trending: () => [...searchKeys.all, 'trending'] as const,
  genres: () => [...searchKeys.all, 'genres'] as const,
  recent: () => [...searchKeys.all, 'recent'] as const,
};

// Types
export interface SearchParams {
  q: string;
  source?: 'local' | 'deezer' | 'all';
  genreId?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
}

export interface SearchResult {
  tracks: any[];
  artists: any[];
  albums: any[];
  playlists: any[];
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export interface TrendingResponse {
  trending: TrendingItem[];
}

export interface GenresResponse {
  genres: Array<{ id: string; name: string; slug: string }>;
}

// Hooks
export function useSearch(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: searchKeys.results(params.q, params),
    queryFn: async () => {
      const response = await api.search(params);
      return response.data as SearchResult;
    },
    enabled: enabled && !!params.q && params.q.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true,
  });
}

export function useSearchSuggestions(query: string, limit = 10, enabled = true) {
  const { getSuggestions, setSuggestions } = useSearchStore();

  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: async () => {
      const response = await api.searchSuggest(query, limit);
      return response.data as SearchSuggestionsResponse;
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      setSuggestions(query, data.suggestions);
    },
    initialData: () => {
      const cached = getSuggestions(query);
      return cached ? { suggestions: cached } : undefined;
    },
  });
}

export function useTrending(enabled = true) {
  const { trending, isTrendingStale, setTrending } = useSearchStore();

  return useQuery({
    queryKey: searchKeys.trending(),
    queryFn: async () => {
      const response = await api.getTrending();
      return response.data as TrendingResponse;
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    initialData: trending.length > 0 && !isTrendingStale() ? { trending } : undefined,
    onSuccess: (data) => {
      setTrending(data.trending);
    },
  });
}

export function useGenres(enabled = true) {
  return useQuery({
    queryKey: searchKeys.genres(),
    queryFn: async () => {
      const response = await api.getGenres();
      return response.data as GenresResponse;
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useUnifiedSearch(query: string, sources?: string[], limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['search', 'unified', query, sources?.join(',')],
    queryFn: async () => {
      const response = await api.unifiedSearch(query, sources, limit);
      return response.data;
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeezerSearch(query: string, limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['search', 'deezer', query, limit],
    queryFn: async () => {
      const response = await api.searchDeezer(query, limit);
      return response.data;
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFreeToUseSearch(query: string, limit = 20, page = 1, enabled = true) {
  return useQuery({
    queryKey: ['search', 'freetouse', query, limit, page],
    queryFn: async () => {
      const response = await api.searchFreeToUse(query, limit, page);
      return response.data;
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useJamendoSearch(query: string, limit = 20, page = 1, enabled = true) {
  return useQuery({
    queryKey: ['search', 'jamendo', query, limit, page],
    queryFn: async () => {
      const response = await api.searchJamendo(query, limit, page);
      return response.data;
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRadioSearch(query: string, limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['search', 'radio', query, limit],
    queryFn: async () => {
      const response = await api.searchRadioStations(query, limit);
      return response.data;
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLyricsSearch(artist: string, track: string, album?: string, duration?: number, enabled = true) {
  return useQuery({
    queryKey: ['search', 'lyrics', artist, track, album, duration],
    queryFn: async () => {
      const response = await api.searchLyrics(artist, track, album, duration);
      return response.data;
    },
    enabled: enabled && !!artist && !!track,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}