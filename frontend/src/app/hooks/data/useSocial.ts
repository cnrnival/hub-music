/**
 * Hub Music - useSocial Hooks
 * React Query hooks para interações sociais: like, repost, comment, follow, feed
 * React Query hooks for social interactions: like, repost, comment, follow, feed
 *
 * @languages pt-BR / en-US
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

// Query keys
export const socialKeys = {
  all: ['social'] as const,
  likeStatus: (trackId: string) => [...socialKeys.all, 'like', trackId] as const,
  repostStatus: (trackId: string) => [...socialKeys.all, 'repost', trackId] as const,
  comments: (trackId: string, params?: any) => [...socialKeys.all, 'comments', trackId, params] as const,
  followStatus: (userId: string) => [...socialKeys.all, 'follow', userId] as const,
  followers: (userId: string, params?: any) => [...socialKeys.all, 'followers', userId, params] as const,
  following: (userId: string, params?: any) => [...socialKeys.all, 'following', userId, params] as const,
  feed: (params?: any) => [...socialKeys.all, 'feed', params] as const,
  userLikes: (userId: string, params?: any) => [...socialKeys.all, 'userLikes', userId, params] as const,
  userReposts: (userId: string, params?: any) => [...socialKeys.all, 'userReposts', userId, params] as const,
  activity: (params?: any) => [...socialKeys.all, 'activity', params] as const,
};

// Types
export interface Comment {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  trackId: string;
  content: string;
  timestamp?: number; // For timestamp comments (SoundCloud style)
  createdAt: string;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FollowResponse {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export interface FeedResponse {
  items: FeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeedItem {
  id: string;
  type: 'like' | 'repost' | 'follow' | 'playlist' | 'track';
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  target?: {
    id: string;
    type: 'track' | 'playlist' | 'user';
    title: string;
    coverUrl?: string;
  };
  createdAt: string;
}

export interface UserLikesResponse {
  tracks: any[];
  pagination: any;
}

export interface UserRepostsResponse {
  tracks: any[];
  pagination: any;
}

// Hooks
export function useLikeStatus(trackId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: socialKeys.likeStatus(trackId!),
    queryFn: async () => {
      const response = await api.getLikeStatus(trackId!);
      return response.data as { liked: boolean; count: number };
    },
    enabled: enabled && !!trackId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRepostStatus(trackId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: socialKeys.repostStatus(trackId!),
    queryFn: async () => {
      const response = await api.getRepostStatus(trackId!);
      return response.data as { reposted: boolean; count: number };
    },
    enabled: enabled && !!trackId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useComments(trackId: string | undefined, params?: { page?: number; limit?: number }, enabled = true) {
  return useQuery({
    queryKey: socialKeys.comments(trackId!, params),
    queryFn: async () => {
      const response = await api.getComments(trackId!, params);
      return response.data as CommentsResponse;
    },
    enabled: enabled && !!trackId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useFollowStatus(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: socialKeys.followStatus(userId!),
    queryFn: async () => {
      const response = await api.getFollowStatus(userId!);
      return response.data as FollowResponse;
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFollowers(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: socialKeys.followers(userId!, params),
    queryFn: async () => {
      const response = await api.getFollowers(userId!, params);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: socialKeys.following(userId!, params),
    queryFn: async () => {
      const response = await api.getFollowing(userId!, params);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useFeed(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: socialKeys.feed(params),
    queryFn: async () => {
      const response = await api.getFeed(params);
      return response.data as FeedResponse;
    },
    staleTime: 1000 * 60 * 1, // 1 minute for feed
  });
}

export function useUserLikes(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: socialKeys.userLikes(userId!, params),
    queryFn: async () => {
      const response = await api.getUserLikes(userId!, params);
      return response.data as UserLikesResponse;
    },
    enabled: !!userId,
  });
}

export function useUserReposts(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: socialKeys.userReposts(userId!, params),
    queryFn: async () => {
      const response = await api.getUserReposts(userId!, params);
      return response.data as UserRepostsResponse;
    },
    enabled: !!userId,
  });
}

// Mutations
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => api.toggleLike(trackId),
    onMutate: async (trackId) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.likeStatus(trackId) });
      await queryClient.cancelQueries({ queryKey: ['tracks', 'detail', trackId] });

      const previousLikeStatus = queryClient.getQueryData(socialKeys.likeStatus(trackId));
      const previousTrack = queryClient.getQueryData(['tracks', 'detail', trackId]);

      // Optimistic update like status
      queryClient.setQueryData(socialKeys.likeStatus(trackId), (old: any) => ({
        liked: !old?.liked,
        count: old?.liked ? old.count - 1 : old.count + 1,
      }));

      // Optimistic update track detail
      queryClient.setQueryData(['tracks', 'detail', trackId], (old: any) => {
        if (!old?.track) return old;
        return {
          ...old,
          track: {
            ...old.track,
            userLiked: !old.track.userLiked,
            _count: {
              ...old.track._count,
              likes: old.track.userLiked ? old.track._count.likes - 1 : old.track._count.likes + 1,
            },
          },
        };
      });

      return { previousLikeStatus, previousTrack, trackId };
    },
    onError: (err, trackId, context) => {
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(socialKeys.likeStatus(trackId), context.previousLikeStatus);
      }
      if (context?.previousTrack) {
        queryClient.setQueryData(['tracks', 'detail', trackId], context.previousTrack);
      }
    },
    onSettled: (data, error, trackId) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.likeStatus(trackId) });
      queryClient.invalidateQueries({ queryKey: ['tracks', 'detail', trackId] });
    },
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: string) => api.toggleRepost(trackId),
    onMutate: async (trackId) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.repostStatus(trackId) });
      await queryClient.cancelQueries({ queryKey: ['tracks', 'detail', trackId] });

      const previousRepostStatus = queryClient.getQueryData(socialKeys.repostStatus(trackId));
      const previousTrack = queryClient.getQueryData(['tracks', 'detail', trackId]);

      queryClient.setQueryData(socialKeys.repostStatus(trackId), (old: any) => ({
        reposted: !old?.reposted,
        count: old?.reposted ? old.count - 1 : old.count + 1,
      }));

      queryClient.setQueryData(['tracks', 'detail', trackId], (old: any) => {
        if (!old?.track) return old;
        return {
          ...old,
          track: {
            ...old.track,
            userReposted: !old.track.userReposted,
            _count: {
              ...old.track._count,
              reposts: old.track.userReposted ? old.track._count.reposts - 1 : old.track._count.reposts + 1,
            },
          },
        };
      });

      return { previousRepostStatus, previousTrack, trackId };
    },
    onError: (err, trackId, context) => {
      if (context?.previousRepostStatus) {
        queryClient.setQueryData(socialKeys.repostStatus(trackId), context.previousRepostStatus);
      }
      if (context?.previousTrack) {
        queryClient.setQueryData(['tracks', 'detail', trackId], context.previousTrack);
      }
    },
    onSettled: (data, error, trackId) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.repostStatus(trackId) });
      queryClient.invalidateQueries({ queryKey: ['tracks', 'detail', trackId] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trackId, content }: { trackId: string; content: string }) =>
      api.addComment(trackId, content),
    onMutate: async ({ trackId, content }) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.comments(trackId) });
      const previous = queryClient.getQueryData<CommentsResponse>(socialKeys.comments(trackId));

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        userId: 'current-user', // Will be replaced by server
        user: {
          id: 'current-user',
          username: '',
          displayName: 'Você',
          avatarUrl: undefined,
        },
        trackId,
        content,
        timestamp: undefined,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<CommentsResponse>(socialKeys.comments(trackId), (old) => ({
        comments: [optimisticComment, ...(old?.comments || [])],
        pagination: old?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      }));

      return { previous, trackId };
    },
    onError: (err, { trackId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(socialKeys.comments(trackId), context.previous);
      }
    },
    onSettled: (data, error, { trackId }) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.comments(trackId) });
      queryClient.invalidateQueries({ queryKey: ['tracks', 'detail', trackId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: (data, commentId) => {
      // We need to find which track this comment belongs to
      // For simplicity, invalidate all comments
      queryClient.invalidateQueries({ queryKey: ['social', 'comments'] });
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.toggleFollow(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: socialKeys.followStatus(userId) });
      const previous = queryClient.getQueryData<FollowResponse>(socialKeys.followStatus(userId));

      queryClient.setQueryData<FollowResponse>(socialKeys.followStatus(userId), (old) => {
        if (!old) return { isFollowing: true, followerCount: 1, followingCount: 0 };
        return {
          isFollowing: !old.isFollowing,
          followerCount: old.isFollowing ? old.followerCount - 1 : old.followerCount + 1,
          followingCount: old.followingCount,
        };
      });

      return { previous, userId };
    },
    onError: (err, userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(socialKeys.followStatus(userId), context.previous);
      }
    },
    onSettled: (data, error, userId) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.followStatus(userId) });
      queryClient.invalidateQueries({ queryKey: socialKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: socialKeys.following(userId) });
    },
  });
}