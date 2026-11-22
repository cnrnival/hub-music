/**
 * Hub Music - Player Types
 * Tipos do sistema de player (estado, fila, histórico, contexto de reprodução)
 * Player system types (state, queue, history, play context)
 * 
 * @languages pt-BR / en-US
 */

import { Genre } from './api';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  genreId?: string;
  description?: string;
  durationSeconds: number;
  format?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  coverUrl?: string;
  audioUrl?: string;
  waveformData?: number[];
  source?: 'LOCAL' | 'DEEZER' | 'FREETOUSE' | 'JAMENDO' | 'SOUNDCLOUD' | 'AUDIUS';
  externalId?: string;
  isrc?: string;
  createdAt?: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  _count?: {
    likes: number;
    reposts: number;
    comments: number;
    playlistItems: number;
  };
  userLiked?: boolean;
  userReposted?: boolean;
  playCount?: number;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  userId: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  tracks?: PlaylistTrack[];
  _count?: {
    tracks: number;
    followers: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  track?: Track;
  addedAt?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  accountType: 'LISTENER' | 'ARTIST' | 'BOTH';
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    tracks: number;
    playlists: number;
    followers: number;
    following: number;
  };
}

export interface Comment {
  id: string;
  userId: string;
  trackId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface Like {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
}

export interface Repost {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface QueuedTrack {
  id: string;
  track: Track;
  source: 'LOCAL' | 'DEEZER' | 'FREETOUSE' | 'JAMENDO' | 'SOUNDCLOUD' | 'AUDIUS' | 'RADIO';
  addedAt: number;
  addedBy?: 'user' | 'autoplay' | 'radio';
}

export type RepeatMode = 'off' | 'all' | 'one';

export type PlayContext =
  | { type: 'track'; trackId: string }
  | { type: 'playlist'; playlistId: string; startIndex?: number }
  | { type: 'album'; albumId: string }
  | { type: 'artist'; artistId: string }
  | { type: 'radio'; stationId: string }
  | { type: 'queue'; queue: QueuedTrack[] };

export interface PlayerState {
  currentTrack: Track | null;
  currentQueueTrack: QueuedTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackRate: number;

  queue: QueuedTrack[];
  history: QueuedTrack[];
  currentIndex: number;

  repeatMode: RepeatMode;
  shuffle: boolean;
  crossfade: boolean;
  crossfadeDuration: number;

  pipVisible: boolean;
  pipPosition: { x: number; y: number };
  pipSize: 'mini' | 'compact' | 'full';

  queuePanelOpen: boolean;
  lyricsPanelOpen: boolean;
  devicePickerOpen: boolean;
}

export interface PlayerSnapshot {
  version: number;
  timestamp: number;
  currentTrack: Track | null;
  queue: QueuedTrack[];
  history: QueuedTrack[];
  currentIndex: number;
  position: number;
  volume: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  crossfade: boolean;
  pipVisible: boolean;
  pipPosition: { x: number; y: number };
  pipSize: 'mini' | 'compact' | 'full';
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface Lyrics {
  id: string;
  trackId: string;
  plainLyrics?: string;
  syncedLyrics?: string;
  parsedLyrics?: LyricLine[];
  instrumental?: boolean;
}

export interface SearchResult {
  local: {
    tracks: Track[];
    playlists: Playlist[];
    users: User[];
    total: number;
  };
  external?: {
    deezer?: {
      tracks: Track[];
      total: number;
    };
    artists?: Track[];
    albums?: any[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
