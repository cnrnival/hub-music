/**
 * Hub Music - useTracks Hooks
 * React Query hooks para faixas: lista, detalhe, waveform, stream URL
 * React Query hooks for tracks: list, detail, waveform, stream URL
 *
 * @languages pt-BR / en-US
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Track } from '../../../types/player';

// Query keys
export const trackKeys = {
  all: ['tracks'] as const,
  lists: () => [...trackKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...trackKeys.lists(), params] as const,
  detail: (id: string) => [...trackKeys.all, 'detail', id] as const,
  waveform: (id: string) => [...trackKeys.all, 'waveform', id] as const,
  stream: (id: string) => [...trackKeys.all, 'stream', id] as const,
  playCount: (id: string) => [...trackKeys.all, 'playCount', id] as const,
  userTracks: (userId: string) => [...trackKeys.all, 'user', userId] as const,
  liked: (userId: string) => [...trackKeys.all, 'liked', userId] as const,
};

// Types
export interface TracksResponse {
  tracks: Track[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrackDetailResponse {
  track: Track;
}

export interface WaveformResponse {
  peaks: number[];
}

export interface StreamResponse {
  url: string;
  expiresIn: number;
}

// Hooks
export function useTracks(params?: {
  page?: number;
  limit?: number;
  genreId?: string;
  userId?: string;
  visibility?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: trackKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.getTracks(params);
      return response.data as TracksResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTrack(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: trackKeys.detail(id!),
    queryFn: async () => {
      const response = await api.getTrack(id!);
      return response.data as TrackDetailResponse;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useTrackWaveform(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: trackKeys.waveform(id!),
    queryFn: async () => {
      const response = await api.getWaveform(id!);
      return response.data as WaveformResponse;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (waveforms don't change)
  });
}

export function useTrackStreamUrl(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: trackKeys.stream(id!),
    queryFn: async () => {
      // This would call a backend endpoint that returns a signed URL
      const response = await api.axios.get(`/tracks/${id}/stream`);
      return response.data as StreamResponse;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes (signed URLs expire)
  });
}

export function useUserTracks(userId: string | undefined, params?: { limit?: number; sortBy?: string; sortOrder?: string }) {
  return useQuery({
    queryKey: trackKeys.userTracks(userId!),
    queryFn: async () => {
      const response = await api.getTracks({ userId: userId!, ...params });
      return response.data as TracksResponse;
    },
    enabled: !!userId,
  });
}

export function useUserLikes(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: trackKeys.liked(userId!),
    queryFn: async () => {
      const response = await api.getUserLikes(userId!, params);
      return response.data as { tracks: Track[]; pagination: any };
    },
    enabled: !!userId,
  });
}

// Mutations
export function useLikeTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => api.toggleLike(trackId),
    onMutate: async (trackId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: trackKeys.detail(trackId) });
      const previousTrack = queryClient.getQueryData<TrackDetailResponse>(trackKeys.detail(trackId));

      queryClient.setQueryData<TrackDetailResponse>(trackKeys.detail(trackId), (old) => {
        if (!old) return old;
        return {
          ...old,
          track: {
            ...old.track,
            userLiked: !old.track.userLiked,
            _count: {
              ...old.track._count,
              likes: old.track.userLiked ? old.track._count!.likes - 1 : old.track._count!.likes + 1,
            },
          },
        };
      });

      return { previousTrack };
    },
    onError: (err, trackId, context) => {
      if (context?.previousTrack) {
        queryClient.setQueryData(trackKeys.detail(trackId), context.previousTrack);
      }
    },
    onSettled: (data, error, trackId) => {
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(trackId) });
    },
  });
}

export function useRepostTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => api.toggleRepost(trackId),
    onMutate: async (trackId) => {
      await queryClient.cancelQueries({ queryKey: trackKeys.detail(trackId) });
      const previousTrack = queryClient.getQueryData<TrackDetailResponse>(trackKeys.detail(trackId));

      queryClient.setQueryData<TrackDetailResponse>(trackKeys.detail(trackId), (old) => {
        if (!old) return old;
        return {
          ...old,
          track: {
            ...old.track,
            userReposted: !old.track.userReposted,
            _count: {
              ...old.track._count,
              reposts: old.track.userReposted ? old.track._count!.reposts - 1 : old.track._count!.reposts + 1,
            },
          },
        };
      });

      return { previousTrack };
    },
    onError: (err, trackId, context) => {
      if (context?.previousTrack) {
        queryClient.setQueryData(trackKeys.detail(trackId), context.previousTrack);
      }
    },
    onSettled: (data, error, trackId) => {
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(trackId) });
    },
  });
}

export function useIncrementPlayCount() {
  return useMutation({
    mutationFn: (trackId: string) => api.axios.post(`/tracks/${trackId}/play-count`),
    // No optimistic update needed, just fire and forget
  });
}

export function useUploadTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => api.uploadTrack(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Track> }) => api.updateTrack(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: trackKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => api.deleteTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}