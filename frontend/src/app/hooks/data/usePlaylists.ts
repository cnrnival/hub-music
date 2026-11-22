/**
 * Hub Music - usePlaylists Hooks
 * React Query hooks para playlists: CRUD, reorder, colaborativa
 * React Query hooks for playlists: CRUD, reorder, collaborative
 *
 * @languages pt-BR / en-US
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

// Query keys
export const playlistKeys = {
  all: ['playlists'] as const,
  lists: () => [...playlistKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...playlistKeys.lists(), params] as const,
  detail: (id: string) => [...playlistKeys.all, 'detail', id] as const,
  userPlaylists: (userId: string) => [...playlistKeys.all, 'user', userId] as const,
  tracks: (playlistId: string) => [...playlistKeys.all, 'tracks', playlistId] as const,
};

// Types
export interface Playlist {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  name: string;
  description?: string;
  coverUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  updatedAt: string;
  _count?: {
    tracks: number;
    followers: number;
  };
  tracks?: PlaylistTrack[];
  isFollowing?: boolean;
  isOwner?: boolean;
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  track: any;
  position: number;
  addedAt: string;
}

export interface PlaylistsResponse {
  playlists: Playlist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlaylistDetailResponse {
  playlist: Playlist;
}

export interface PlaylistTracksResponse {
  tracks: PlaylistTrack[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hooks
export function usePlaylists(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  visibility?: string;
}) {
  return useQuery({
    queryKey: playlistKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.getPlaylists(params);
      return response.data as PlaylistsResponse;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlaylist(id: string | undefined, params?: { page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: playlistKeys.detail(id!),
    queryFn: async () => {
      const response = await api.getPlaylist(id!);
      return response.data as PlaylistDetailResponse;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlaylistTracks(playlistId: string | undefined, params?: { page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: playlistKeys.tracks(playlistId!),
    queryFn: async () => {
      const response = await api.axios.get(`/playlists/${playlistId}/tracks`, { params });
      return response.data as PlaylistTracksResponse;
    },
    enabled: enabled && !!playlistId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserPlaylists(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: playlistKeys.userPlaylists(userId!),
    queryFn: async () => {
      const response = await api.getPlaylists({ userId: userId!, ...params });
      return response.data as PlaylistsResponse;
    },
    enabled: !!userId,
  });
}

// Mutations
export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; visibility?: 'PUBLIC' | 'PRIVATE'; coverUrl?: string }) =>
      api.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Playlist> }) => api.updatePlaylist(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: playlistKeys.detail(id) });
      const previous = queryClient.getQueryData<PlaylistDetailResponse>(playlistKeys.detail(id));

      queryClient.setQueryData<PlaylistDetailResponse>(playlistKeys.detail(id), (old) => {
        if (!old) return old;
        return { ...old, playlist: { ...old.playlist, ...data } };
      });

      return { previous };
    },
    onError: (err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys.detail(id), context.previous);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistId: string) => api.deletePlaylist(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, trackId, position }: { playlistId: string; trackId: string; position?: number }) =>
      api.addTrackToPlaylist(playlistId, trackId, position),
    onMutate: async ({ playlistId, trackId, position }) => {
      await queryClient.cancelQueries({ queryKey: playlistKeys.tracks(playlistId) });
      const previous = queryClient.getQueryData<PlaylistTracksResponse>(playlistKeys.tracks(playlistId));

      // Optimistically add track
      queryClient.setQueryData<PlaylistTracksResponse>(playlistKeys.tracks(playlistId), (old) => {
        if (!old) return old;
        // Would need to fetch track details for full optimistic update
        return old;
      });

      return { previous };
    },
    onError: (err, { playlistId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys.tracks(playlistId), context.previous);
      }
    },
    onSettled: (data, error, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.tracks(playlistId) });
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}

export function useRemoveTrackFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      api.removeTrackFromPlaylist(playlistId, trackId),
    onMutate: async ({ playlistId, trackId }) => {
      await queryClient.cancelQueries({ queryKey: playlistKeys.tracks(playlistId) });
      const previous = queryClient.getQueryData<PlaylistTracksResponse>(playlistKeys.tracks(playlistId));

      queryClient.setQueryData<PlaylistTracksResponse>(playlistKeys.tracks(playlistId), (old) => {
        if (!old) return old;
        return {
          ...old,
          tracks: old.tracks.filter((t) => t.trackId !== trackId),
        };
      });

      return { previous };
    },
    onError: (err, { playlistId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys.tracks(playlistId), context.previous);
      }
    },
    onSettled: (data, error, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.tracks(playlistId) });
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}

export function useReorderPlaylistTracks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, trackIds }: { playlistId: string; trackIds: string[] }) =>
      api.reorderPlaylistTracks(playlistId, trackIds),
    onMutate: async ({ playlistId, trackIds }) => {
      await queryClient.cancelQueries({ queryKey: playlistKeys.tracks(playlistId) });
      const previous = queryClient.getQueryData<PlaylistTracksResponse>(playlistKeys.tracks(playlistId));

      queryClient.setQueryData<PlaylistTracksResponse>(playlistKeys.tracks(playlistId), (old) => {
        if (!old) return old;
        const trackMap = new Map(old.tracks.map((t) => [t.trackId, t]));
        const reordered = trackIds.map((id, index) => ({
          ...trackMap.get(id)!,
          position: index,
        }));
        return { ...old, tracks: reordered };
      });

      return { previous };
    },
    onError: (err, { playlistId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys.tracks(playlistId), context.previous);
      }
    },
    onSettled: (data, error, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.tracks(playlistId) });
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}

export function useFollowPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistId: string) => api.axios.post(`/playlists/${playlistId}/follow`),
    onMutate: async (playlistId) => {
      await queryClient.cancelQueries({ queryKey: playlistKeys.detail(playlistId) });
      const previous = queryClient.getQueryData<PlaylistDetailResponse>(playlistKeys.detail(playlistId));

      queryClient.setQueryData<PlaylistDetailResponse>(playlistKeys.detail(playlistId), (old) => {
        if (!old) return old;
        return {
          ...old,
          playlist: {
            ...old.playlist,
            isFollowing: !old.playlist.isFollowing,
            _count: {
              ...old.playlist._count,
              followers: old.playlist.isFollowing
                ? old.playlist._count!.followers - 1
                : old.playlist._count!.followers + 1,
            },
          },
        };
      });

      return { previous };
    },
    onError: (err, playlistId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(playlistKeys.detail(playlistId), context.previous);
      }
    },
    onSettled: (data, error, playlistId) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) });
    },
  });
}