/**
 * Hub Music - Search Hook
 * Hook de busca: busca unificada, sugestões, tendências
 * Search hook: unified search, suggestions, trending
 * 
 * @languages pt-BR / en-US
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useDebouncedCallback } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SearchResult {
  local: {
    tracks: any[];
    playlists: any[];
    users: any[];
    total: number;
  };
  deezer: {
    tracks: any[];
    albums: any[];
    artists: any[];
    total: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SearchSuggestion {
  tracks: Array<{ id: string; title: string; artist: string; type: 'track' }>;
  artists: Array<{ name: string; type: 'artist' }>;
  playlists: Array<{ id: string; name: string; type: 'playlist' }>;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'local' | 'deezer' | 'all'>('all');
  const [page, setPage] = useState(1);
  const [genreId, setGenreId] = useState<string | undefined>();

  const searchQuery = useDebouncedCallback(
    (q: string) => setQuery(q),
    300
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['search', query, source, page, genreId],
    queryFn: async () => {
      if (!query.trim()) return null;
      const response = await api.search({
        q: query,
        source,
        genreId,
        page,
        limit: 20
      });
      return response.data as SearchResult;
    },
    enabled: !!query.trim(),
    keepPreviousData: true
  });

  const suggestions = useQuery({
    queryKey: ['search', 'suggest', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return null;
      const response = await api.searchSuggest(query, 5);
      return response.data as SearchSuggestion;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5
  });

  const trending = useQuery({
    queryKey: ['search', 'trending'],
    queryFn: async () => {
      const response = await api.getTrending();
      return response.data;
    },
    staleTime: 1000 * 60 * 30
  });

  const genres = useQuery({
    queryKey: ['search', 'genres'],
    queryFn: async () => {
      const response = await api.getGenres();
      return response.data.genres;
    },
    staleTime: 1000 * 60 * 60
  });

  const search = useCallback((q: string) => {
    searchQuery(q);
    setPage(1);
  }, [searchQuery]);

  const nextPage = useCallback(() => {
    if (data && page < data.pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  }, [data, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  return {
    query,
    setQuery: search,
    source,
    setSource,
    page,
    setPage,
    genreId,
    setGenreId,
    data,
    isLoading,
    error,
    suggestions: suggestions.data,
    trending: trending.data,
    genres: genres.data,
    nextPage,
    prevPage,
    hasNextPage: data ? page < data.pagination.totalPages : false,
    hasPrevPage: page > 1,
    totalResults: data?.pagination.total ?? 0,
    refetch
  };
}

export function useUnifiedSearch() {
  const [query, setQuery] = useState('');
  const [sources, setSources] = useState<string[]>(['deezer', 'musicbrainz', 'freetouse', 'jamendo']);

  const { data, isLoading } = useQuery({
    queryKey: ['unified-search', query, sources],
    queryFn: async () => {
      if (!query.trim()) return null;
      const response = await api.unifiedSearch(query, sources, 20);
      return response.data;
    },
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 5
  });

  return {
    query,
    setQuery,
    sources,
    setSources,
    data,
    isLoading
  };
}

export function useDeezerSearch() {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['deezer-search', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const response = await api.searchDeezer(query, 20);
      return response.data;
    },
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 5
  });

  return {
    query,
    setQuery,
    data,
    isLoading
  };
}