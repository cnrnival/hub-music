/**
 * Hub Music - useProfile Hooks
 * React Query hooks para perfis, artistas, álbuns
 * React Query hooks for profiles, artists, albums
 *
 * @languages pt-BR / en-US
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  displayName: string;
  avatarUrl?: string;
  headerUrl?: string;
  bio?: string;
  followersCount: number;
  monthlyListeners: number;
  isFollowing: boolean;
  verified: boolean;
  genres: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  coverUrl?: string;
  releaseDate: string;
  totalTracks: number;
  duration: number;
  type: 'album' | 'single' | 'ep' | 'compilation';
  isLiked: boolean;
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: Artist;
  album?: Album;
  coverUrl?: string;
  duration: number;
  trackNumber: number;
  audioUrl: string;
  waveformData?: number[];
  isLiked: boolean;
  playCount: number;
  explicit: boolean;
  createdAt: string;
}

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
  followers: (id: string) => [...profileKeys.all, 'followers', id] as const,
  following: (id: string) => [...profileKeys.all, 'following', id] as const,
};

export const artistKeys = {
  all: ['artists'] as const,
  detail: (id: string) => [...artistKeys.all, 'detail', id] as const,
  topTracks: (id: string) => [...artistKeys.all, 'topTracks', id] as const,
  albums: (id: string) => [...artistKeys.all, 'albums', id] as const,
  related: (id: string) => [...artistKeys.all, 'related', id] as const,
};

export const albumKeys = {
  all: ['albums'] as const,
  detail: (id: string) => [...albumKeys.all, 'detail', id] as const,
  tracks: (id: string) => [...albumKeys.all, 'tracks', id] as const,
};

// Mock data for development
const mockArtist: Artist = {
  id: 'artist-1',
  name: 'artist1',
  displayName: 'Artista Exemplo',
  avatarUrl: 'https://picsum.photos/seed/artist1/300/300',
  headerUrl: 'https://picsum.photos/seed/header1/1200/400',
  bio: 'Biografia do artista exemplo',
  followersCount: 125000,
  monthlyListeners: 2500000,
  isFollowing: false,
  verified: true,
  genres: ['Pop', 'Rock', 'Indie'],
};

const mockAlbum: Album = {
  id: 'album-1',
  title: 'Álbum Exemplo',
  artist: mockArtist,
  coverUrl: 'https://picsum.photos/seed/album1/300/300',
  releaseDate: '2024-01-15',
  totalTracks: 12,
  duration: 2700,
  type: 'album',
  isLiked: false,
  tracks: Array.from({ length: 12 }, (_, i) => ({
    id: `track-${i}`,
    title: `Faixa ${i + 1}`,
    artist: mockArtist,
    coverUrl: `https://picsum.photos/seed/track${i}/300/300`,
    duration: 180 + i * 10,
    trackNumber: i + 1,
    audioUrl: '',
    waveformData: [],
    isLiked: false,
    playCount: 10000,
    explicit: false,
    createdAt: '2024-01-15T00:00:00Z',
  })),
};

const mockProfile: Profile = {
  id: 'user-1',
  username: 'usuario1',
  displayName: 'Usuário Exemplo',
  avatarUrl: 'https://picsum.photos/seed/user1/100/100',
  bio: 'Bio do usuário',
  followersCount: 500,
  followingCount: 300,
  isFollowing: false,
  isVerified: false,
  createdAt: '2024-01-01T00:00:00Z',
};

// Hooks
export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      // await api.get(`/users/${userId}`);
      return mockProfile;
    },
    enabled: !!userId,
  });
}

export function useArtist(artistId: string) {
  return useQuery({
    queryKey: artistKeys.detail(artistId),
    queryFn: async () => {
      // await api.get(`/artists/${artistId}`);
      return mockArtist;
    },
    enabled: !!artistId,
  });
}

export function useArtistTopTracks(artistId: string) {
  return useQuery({
    queryKey: artistKeys.topTracks(artistId),
    queryFn: async () => {
      // await api.get(`/artists/${artistId}/top-tracks`);
      return mockAlbum.tracks.slice(0, 5);
    },
    enabled: !!artistId,
  });
}

export function useArtistAlbums(artistId: string) {
  return useQuery({
    queryKey: artistKeys.albums(artistId),
    queryFn: async () => {
      // await api.get(`/artists/${artistId}/albums`);
      return [mockAlbum];
    },
    enabled: !!artistId,
  });
}

export function useArtistRelated(artistId: string) {
  return useQuery({
    queryKey: artistKeys.related(artistId),
    queryFn: async () => {
      // await api.get(`/artists/${artistId}/related`);
      return [mockArtist];
    },
    enabled: !!artistId,
  });
}

export function useFollowArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ artistId, following }: { artistId: string; following: boolean }) => {
      // await api.post(`/artists/${artistId}/follow`, { following });
      return { success: true };
    },
    onSuccess: (_, { artistId }) => {
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) });
    },
  });
}

export function useAlbum(albumId: string) {
  return useQuery({
    queryKey: albumKeys.detail(albumId),
    queryFn: async () => {
      // await api.get(`/albums/${albumId}`);
      return mockAlbum;
    },
    enabled: !!albumId,
  });
}

export function useAlbumTracks(albumId: string) {
  return useQuery({
    queryKey: albumKeys.tracks(albumId),
    queryFn: async () => {
      // await api.get(`/albums/${albumId}/tracks`);
      return mockAlbum.tracks;
    },
    enabled: !!albumId,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, following }: { userId: string; following: boolean }) => {
      // await api.post(`/users/${userId}/follow`, { following });
      return { success: true };
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}

export function useUserPlaylists(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...profileKeys.all, 'playlists', userId],
    queryFn: async () => {
      // await api.get(`/users/${userId}/playlists`);
      return { playlists: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    },
    enabled: !!userId,
  });
}

export function useUserTracks(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...profileKeys.all, 'tracks', userId],
    queryFn: async () => {
      // await api.get(`/users/${userId}/tracks`);
      return { tracks: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    },
    enabled: !!userId,
  });
}

export function useUserLikes(userId: string | undefined, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...profileKeys.all, 'likes', userId],
    queryFn: async () => {
      // await api.get(`/users/${userId}/likes`);
      return { tracks: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      // await api.patch('/users/me', data);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // await api.post('/users/me/password', { currentPassword, newPassword });
      return { success: true };
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (password: string) => {
      // await api.delete('/users/me', { data: { password } });
      return { success: true };
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      // await api.uploadAvatar(file);
      return { url: URL.createObjectURL(file) };
    },
  });
}

export function useUploadCover() {
  return useMutation({
    mutationFn: async (file: File) => {
      // await api.uploadCover(file);
      return { url: URL.createObjectURL(file) };
    },
  });
}