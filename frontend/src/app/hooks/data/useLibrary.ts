/**
 * Hub Music - useLibrary Hooks
 * React Query hooks para abas da biblioteca: tracks, albums, artists, playlists, episodes, recents
 * React Query hooks for library tabs: tracks, albums, artists, playlists, episodes, recents
 *
 * @languages pt-BR / en-US
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useLibraryStore } from '../../../state/libraryStore';
import type { LibraryTab, LibraryFilters, SortOption } from '../../../state/libraryStore';

// Query keys
export const libraryKeys = {
  all: ['library'] as const,
  tracks: (userId: string, params: any) => [...libraryKeys.all, 'tracks', userId, params] as const,
  albums: (userId: string, params: any) => [...libraryKeys.all, 'albums', userId, params] as const,
  artists: (userId: string, params: any) => [...libraryKeys.all, 'artists', userId, params] as const,
  playlists: (userId: string, params: any) => [...libraryKeys.all, 'playlists', userId, params] as const,
  episodes: (userId: string, params: any) => [...libraryKeys.all, 'episodes', userId, params] as const,
  recents: (userId: string, params: any) => [...libraryKeys.all, 'recents', userId, params] as const,
  liked: (userId: string, params: any) => [...libraryKeys.all, 'liked', userId, params] as const,
  followedArtists: (userId: string, params: any) => [...libraryKeys.all, 'followedArtists', userId, params] as const,
};

// Helper to build query params from store state
function buildLibraryParams(
  filters: LibraryFilters,
  sortBy: SortOption,
  sortOrder: 'asc' | 'desc',
  page = 1,
  limit = 50
) {
  const params: any = { page, limit, sortBy, sortOrder };

  if (filters.genre) params.genreId = filters.genre;
  if (filters.source && filters.source !== 'all') params.source = filters.source.toUpperCase();
  if (filters.search) params.q = filters.search;

  return params;
}

// Tracks tab
export function useLibraryTracks(userId: string | undefined, page = 1, limit = 50) {
  const { filters, sortBy, sortOrder } = useLibraryStore();
  const params = buildLibraryParams(filters, sortBy, sortOrder, page, limit);

  return useQuery({
    queryKey: libraryKeys.tracks(userId!, params),
    queryFn: async () => {
      const response = await api.getTracks({ userId: userId!, ...params });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// Liked tracks tab
export function useLibraryLikes(userId: string | undefined, page = 1, limit = 50) {
  return useQuery({
    queryKey: libraryKeys.liked(userId!, { page, limit }),
    queryFn: async () => {
      const response = await api.getUserLikes(userId!, { page, limit });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// Playlists tab
export function useLibraryPlaylists(userId: string | undefined, page = 1, limit = 50) {
  const { filters, sortBy, sortOrder } = useLibraryStore();
  const params = { ...buildLibraryParams(filters, sortBy, sortOrder, page, limit), userId: userId! };

  return useQuery({
    queryKey: libraryKeys.playlists(userId!, params),
    queryFn: async () => {
      const response = await api.getPlaylists(params);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

// Artists tab (followed artists)
export function useLibraryArtists(userId: string | undefined, page = 1, limit = 50) {
  return useQuery({
    queryKey: libraryKeys.followedArtists(userId!, { page, limit }),
    queryFn: async () => {
      const response = await api.axios.get(`/users/${userId}/following`, { params: { page, limit, type: 'artist' } });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
}

// Albums tab (from followed artists or saved albums)
export function useLibraryAlbums(userId: string | undefined, page = 1, limit = 50) {
  return useQuery({
    queryKey: libraryKeys.albums(userId!, { page, limit }),
    queryFn: async () => {
      const response = await api.axios.get(`/users/${userId}/albums`, { params: { page, limit } });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
}

// Episodes tab
export function useLibraryEpisodes(userId: string | undefined, page = 1, limit = 50) {
  return useQuery({
    queryKey: libraryKeys.episodes(userId!, { page, limit }),
    queryFn: async () => {
      const response = await api.axios.get(`/users/${userId}/episodes`, { params: { page, limit } });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
}

// Recents tab (recently played)
export function useLibraryRecents(userId: string | undefined, page = 1, limit = 50) {
  return useQuery({
    queryKey: libraryKeys.recents(userId!, { page, limit }),
    queryFn: async () => {
      const response = await api.axios.get(`/users/${userId}/recents`, { params: { page, limit } });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // Shorter cache for recents
    keepPreviousData: true,
  });
}

// Hook to get the right query based on active tab
export function useLibraryTabData(userId: string | undefined, page = 1, limit = 50) {
  const { activeTab } = useLibraryStore();

  const tracks = useLibraryTracks(userId, page, limit);
  const likes = useLibraryLikes(userId, page, limit);
  const playlists = useLibraryPlaylists(userId, page, limit);
  const artists = useLibraryArtists(userId, page, limit);
  const albums = useLibraryAlbums(userId, page, limit);
  const episodes = useLibraryEpisodes(userId, page, limit);
  const recents = useLibraryRecents(userId, page, limit);

  const queries: Record<LibraryTab, ReturnType<typeof useQuery>> = {
    tracks,
    likes,
    playlists,
    artists,
    albums,
    episodes,
    recents,
  };

  return queries[activeTab];
}

// Infinite query versions for infinite scroll
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteLibraryTracks(userId: string | undefined, limit = 50) {
  const { filters, sortBy, sortOrder } = useLibraryStore();

  return useInfiniteQuery({
    queryKey: ['library', 'tracks', 'infinite', userId, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const params = buildLibraryParams(filters, sortBy, sortOrder, pageParam, limit);
      const response = await api.getTracks({ userId: userId!, ...params });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useInfiniteLibraryPlaylists(userId: string | undefined, limit = 50) {
  const { filters, sortBy, sortOrder } = useLibraryStore();

  return useInfiniteQuery({
    queryKey: ['library', 'playlists', 'infinite', userId, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...buildLibraryParams(filters, sortBy, sortOrder, pageParam, limit), userId: userId! };
      const response = await api.getPlaylists(params);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}