/**
 * Hub Music - Player Types
 * Tipos do player: estado, queue, snapshot, contexto de reprodução
 * Player types: state, queue, snapshot, playback context
 *
 * @languages pt-BR / en-US
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  durationSeconds: number;
  waveformData?: number[];
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  source?: 'LOCAL' | 'DEEZER' | 'FREETOUSE' | 'JAMENDO' | 'SOUNDCLOUD' | 'RADIO';
  explicit?: boolean;
  genre?: { name: string };
  _count?: {
    likes: number;
    reposts: number;
    comments: number;
  };
  userLiked?: boolean;
  userReposted?: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE';
  createdAt?: string;
  description?: string;
}

export interface QueuedTrack {
  id: string;
  track: Track;
  source: 'local' | 'deezer' | 'freetouse' | 'jamendo' | 'soundcloud' | 'radio';
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
  // Current
  currentTrack: Track | null;
  currentQueueTrack: QueuedTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackRate: number;

  // Queue & History
  queue: QueuedTrack[];
  history: QueuedTrack[];
  currentIndex: number;

  // Modes
  repeatMode: RepeatMode;
  shuffle: boolean;
  crossfade: boolean;
  crossfadeDuration: number;

  // PIP
  pipVisible: boolean;
  pipPosition: { x: number; y: number };
  pipSize: 'mini' | 'compact' | 'full';

  // UI
  queuePanelOpen: boolean;
  lyricsPanelOpen: boolean;
  devicePickerOpen: boolean;

  // Actions — Playback
  play: (context: PlayContext, options?: { startPosition?: number }) => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  seekRelative: (delta: number) => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;

  // Actions — Queue Management
  addToQueue: (tracks: Track[], position?: 'next' | 'end', source?: QueuedTrack['source']) => void;
  removeFromQueue: (index: number) => void;
  moveQueueItem: (from: number, to: number) => void;
  clearQueue: () => void;
  playNext: (track: Track) => void;
  playLater: (track: Track) => void;

  // Actions — Modes
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleCrossfade: () => void;

  // Actions — PIP
  togglePip: () => void;
  setPipPosition: (pos: { x: number; y: number }) => void;
  setPipSize: (size: 'mini' | 'compact' | 'full') => void;

  // Actions — Panels
  toggleQueuePanel: () => void;
  toggleLyricsPanel: () => void;
  toggleDevicePicker: () => void;

  // Snapshot
  snapshot: () => PlayerSnapshot;
  restore: (snapshot: PlayerSnapshot) => void;
  hydrate: () => void;
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

export const SNAPSHOT_STORAGE_KEY = 'hubmusic:player:snapshot';
export const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days