/**
 * Hub Music - Constants
 * Constantes, chaves de storage, rotas e enums compartilhados
 * Constants, storage keys, routes and enums shared across the app
 * 
 * @languages pt-BR / en-US
 */

export const APP_NAME = 'Hub Music';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Plataforma de streaming e compartilhamento de áudio open source';
export const APP_DESCRIPTION_EN = 'Open source audio streaming and sharing platform';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export const STORAGE_KEYS = {
  PLAYER_SNAPSHOT: 'hubmusic:player:snapshot',
  USER_PREFERENCES: 'hubmusic:user:preferences',
  RECENT_SEARCHES: 'hubmusic:search:recent',
  ACCESS_TOKEN: 'hubmusic:auth:accessToken',
  REFRESH_TOKEN: 'hubmusic:auth:refreshToken',
} as const;

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  SEARCH_QUERY: '/search/:query',
  TRACK: '/track/:id',
  TRACK_V2: '/track/:id/v2',
  ALBUM: '/album/:id',
  ARTIST: '/artist/:id',
  PLAYLIST: '/playlist/:id',
  PLAYLIST_EDIT: '/playlist/:id/edit',
  PLAYLIST_CREATE: '/playlist/create',
  SHOW: '/show/:id',
  EPISODE: '/episode/:id',
  PROFILE: '/profile/:username',
  SETTINGS: '/settings',
  FEED: '/feed',
  BLEND: '/blend/:id',
  UPLOAD: '/upload',
  UPLOAD_EDIT: '/upload/:id/edit',
  LIBRARY: '/library',
  LIBRARY_TRACKS: '/library/tracks',
  LIBRARY_ALBUMS: '/library/albums',
  LIBRARY_ARTISTS: '/library/artists',
  LIBRARY_PLAYLISTS: '/library/playlists',
  LIBRARY_EPISODES: '/library/episodes',
  LIBRARY_RECENTS: '/library/recents',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  NOT_FOUND: '*',
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_COMMENT_LENGTH = 280;
export const DEFAULT_PAGE_SIZE = 20;
export const DEBOUNCE_MS = 300;
export const SNAPSHOT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const REPEAT_MODES: { key: 'off' | 'all' | 'one'; label: string }[] = [
  { key: 'off', label: 'Sem repetição' },
  { key: 'all', label: 'Repetir tudo' },
  { key: 'one', label: 'Repetir faixa' },
];

export const PIP_SIZES: { key: 'mini' | 'compact' | 'full'; label: string }[] = [
  { key: 'mini', label: 'Mínimo' },
  { key: 'compact', label: 'Compacto' },
  { key: 'full', label: 'Cheio' },
];

export const LIBRARY_TABS: { key: string; label: string }[] = [
  { key: 'tracks', label: 'Faixas' },
  { key: 'albums', label: 'Álbuns' },
  { key: 'artists', label: 'Artistas' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'episodes', label: 'Episódios' },
  { key: 'recents', label: 'Recentes' },
];

export const VIEW_MODES: { key: 'grid' | 'list'; label: string }[] = [
  { key: 'grid', label: 'Grid' },
  { key: 'list', label: 'Lista' },
];

export const SORT_OPTIONS: { key: 'recent' | 'alphabetical' | 'artist' | 'duration' | 'plays'; label: string }[] = [
  { key: 'recent', label: 'Mais recentes' },
  { key: 'alphabetical', label: 'A-Z' },
  { key: 'artist', label: 'Artista' },
  { key: 'duration', label: 'Duração' },
  { key: 'plays', label: 'Mais tocadas' },
];

export const SOURCE_LABELS: Record<string, string> = {
  LOCAL: 'Hub Music',
  DEEZER: 'Deezer',
  FREETOUSE: 'Free To Use',
  JAMENDO: 'Jamendo',
  SOUNDCLOUD: 'SoundCloud',
  AUDIUS: 'Audius',
  RADIO: 'Rádio',
} as const;

export const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
} as const;

export const COLORS = {
  PRIMARY: '#FF4081',
  PRIMARY_LIGHT: '#FF80AB',
  PRIMARY_DARK: '#E0306E',
  BACKGROUND: '#000000',
  BACKGROUND_SECONDARY: '#121212',
  BACKGROUND_TERTIARY: '#1E1E1E',
  CARD: '#1A1A1A',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#B0B0B0',
  TEXT_MUTED: '#727272',
  BORDER: '#333333',
  BORDER_LIGHT: '#404040',
  WAVEFORM_PLAYED: '#FF4081',
  WAVEFORM_UNPLAYED: '#404040',
  SUCCESS: '#00E676',
  ERROR: '#FF1744',
  WARNING: '#FF9800',
} as const;
