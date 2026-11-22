/**
 * Hub Music - API Client
 * Cliente de API: axios configurado com interceptors, cookies, base URL
 * API client: axios configured with interceptors, cookies, base URL
 *
 * @languages pt-BR / en-US
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('[API] VITE_API_URL não configurada! Configure no Vercel: Settings → Environment Variables');
  // Em dev, usa localhost. Em prod, vai falhar explicitamente.
  if (import.meta.env.DEV) {
    console.warn('[API] Usando fallback localhost:3000 (apenas desenvolvimento)');
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.client.post('/auth/refresh');
            return this.client(originalRequest);
          } catch {
            // Refresh failed, redirect to login
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get axios() {
    return this.client;
  }

  // Auth
  async register(data: { username: string; email: string; password: string; displayName?: string }) {
    return this.client.post('/auth/register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.client.post('/auth/login', data);
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  async refresh() {
    return this.client.post('/auth/refresh');
  }

  async me() {
    return this.client.get('/auth/me');
  }

  // Tracks (from public APIs and user library)
  async getTracks(params?: {
    page?: number;
    limit?: number;
    genreId?: string;
    userId?: string;
    visibility?: string;
    source?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return this.client.get('/tracks', { params });
  }

  async getTrack(id: string) {
    return this.client.get(`/tracks/${id}`);
  }

  async getWaveform(id: string) {
    return this.client.get(`/tracks/${id}/waveform`);
  }

  async getStreamUrl(id: string) {
    return this.client.get(`/tracks/${id}/stream`);
  }

  // Albums
  async getAlbum(id: string) {
    return this.client.get(`/albums/${id}`);
  }

  // Artists
  async getArtistTopTracks(artistId: string, limit?: number) {
    return this.client.get(`/artists/${artistId}/top-tracks`, { params: { limit } });
  }

  // Radio
  async getRadioStationTracks(stationId: string) {
    return this.client.get(`/radio/${stationId}/tracks`);
  }

  // Playlists
  async getPlaylists(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    visibility?: string;
  }) {
    return this.client.get('/playlists', { params });
  }

  async getPlaylist(id: string) {
    return this.client.get(`/playlists/${id}`);
  }

  async createPlaylist(data: {
    name: string;
    description?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    coverUrl?: string;
  }) {
    return this.client.post('/playlists', data);
  }

  async updatePlaylist(id: string, data: Partial<{
    name: string;
    description: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    coverUrl: string;
  }>) {
    return this.client.patch(`/playlists/${id}`, data);
  }

  async deletePlaylist(id: string) {
    return this.client.delete(`/playlists/${id}`);
  }

  async addTrackToPlaylist(playlistId: string, trackId: string, position?: number) {
    return this.client.post(`/playlists/${playlistId}/tracks`, { trackId, position });
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string) {
    return this.client.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  }

  async reorderPlaylistTracks(playlistId: string, trackIds: string[]) {
    return this.client.patch(`/playlists/${playlistId}/tracks/reorder`, { trackIds });
  }

  // Social
  async toggleLike(trackId: string) {
    return this.client.post(`/tracks/${trackId}/like`);
  }

  async getLikeStatus(trackId: string) {
    return this.client.get(`/tracks/${trackId}/like/status`);
  }

  async toggleRepost(trackId: string) {
    return this.client.post(`/tracks/${trackId}/repost`);
  }

  async getRepostStatus(trackId: string) {
    return this.client.get(`/tracks/${trackId}/repost/status`);
  }

  async addComment(trackId: string, content: string) {
    return this.client.post(`/tracks/${trackId}/comments`, { content });
  }

  async getComments(trackId: string, params?: { page?: number; limit?: number }) {
    return this.client.get(`/tracks/${trackId}/comments`, { params });
  }

  async deleteComment(commentId: string) {
    return this.client.delete(`/comments/${commentId}`);
  }

  async toggleFollow(userId: string) {
    return this.client.post(`/users/${userId}/follow`);
  }

  async getFollowStatus(userId: string) {
    return this.client.get(`/users/${userId}/follow/status`);
  }

  async getFollowers(userId: string, params?: { page?: number; limit?: number }) {
    return this.client.get(`/users/${userId}/followers`, { params });
  }

  async getFollowing(userId: string, params?: { page?: number; limit?: number }) {
    return this.client.get(`/users/${userId}/following`, { params });
  }

  async getFeed(params?: { page?: number; limit?: number }) {
    return this.client.get('/feed', { params });
  }

  async getUserLikes(userId: string, params?: { page?: number; limit?: number }) {
    return this.client.get(`/users/${userId}/likes`, { params });
  }

  async getUserReposts(userId: string, params?: { page?: number; limit?: number }) {
    return this.client.get(`/users/${userId}/reposts`, { params });
  }

  // Search
  async search(params: {
    q: string;
    source?: 'local' | 'deezer' | 'freetouse' | 'jamendo' | 'all';
    genreId?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
  }) {
    return this.client.get('/search', { params });
  }

  async searchSuggest(q: string, limit?: number) {
    return this.client.get('/search/suggest', { params: { q, limit } });
  }

  async getTrending() {
    return this.client.get('/search/trending');
  }

  async getGenres() {
    return this.client.get('/search/genres');
  }

  // Public APIs Proxy (Backend handles CORS and rate limiting)
  // Deezer
  async searchDeezer(q: string, limit?: number, page?: number) {
    return this.client.get('/api/public/deezer/search', { params: { q, limit, page } });
  }

  async getDeezerTrack(id: number) {
    return this.client.get(`/api/public/deezer/track/${id}`);
  }

  async getDeezerAlbum(id: number) {
    return this.client.get(`/api/public/deezer/album/${id}`);
  }

  async getDeezerArtist(id: number) {
    return this.client.get(`/api/public/deezer/artist/${id}`);
  }

  async getDeezerPlaylist(id: number) {
    return this.client.get(`/api/public/deezer/playlist/${id}`);
  }

  // FreeToUse
  async searchFreeToUse(q: string, limit?: number, page?: number) {
    return this.client.get('/api/public/freetouse/search', { params: { q, limit, page } });
  }

  // Jamendo
  async searchJamendo(q: string, limit?: number, page?: number) {
    return this.client.get('/api/public/jamendo/search', { params: { q, limit, page } });
  }

  // LRCLIB (Lyrics)
  async searchLyrics(artist: string, track: string, album?: string, duration?: number) {
    return this.client.get('/api/public/lrclib/lyrics', { params: { artist, track, album, duration } });
  }

  // Radio Browser
  async searchRadioStations(q: string, limit?: number, country?: string) {
    return this.client.get('/api/public/radio/search', { params: { q, limit, country } });
  }

  async getRadioCountries() {
    return this.client.get('/api/public/radio/countries');
  }

  // MusicBrainz
  async searchMusicBrainz(q: string, type?: 'recording' | 'release' | 'artist', limit?: number) {
    return this.client.get('/api/public/musicbrainz/search', { params: { q, type, limit } });
  }

  // ListenBrainz
  async getListenBrainzRecommendations(userId?: string, limit?: number) {
    return this.client.get('/api/public/listenbrainz/recommendations', { params: { userId, limit } });
  }

  // Unified search across all public APIs
  async unifiedSearch(q: string, sources?: string[], limit?: number) {
    return this.client.get('/api/public/unified/search', { params: { q, sources: sources?.join(','), limit } });
  }

  // User Library (saved/followed content)
  async getLibraryTracks(params?: { page?: number; limit?: number; sortBy?: string }) {
    return this.client.get('/library/tracks', { params });
  }

  async getLibraryAlbums(params?: { page?: number; limit?: number; sortBy?: string }) {
    return this.client.get('/library/albums', { params });
  }

  async getLibraryArtists(params?: { page?: number; limit?: number; sortBy?: string }) {
    return this.client.get('/library/artists', { params });
  }

  async getLibraryPlaylists(params?: { page?: number; limit?: number; sortBy?: string }) {
    return this.client.get('/library/playlists', { params });
  }

  async getLibraryEpisodes(params?: { page?: number; limit?: number; sortBy?: string }) {
    return this.client.get('/library/episodes', { params });
  }

  async getRecents(params?: { page?: number; limit?: number; timeFilter?: string }) {
    return this.client.get('/library/recents', { params });
  }

  // User Profile
  async getProfile(username: string) {
    return this.client.get(`/users/${username}`);
  }

  async updateProfile(data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
  }) {
    return this.client.patch('/users/me', data);
  }

  async getUserPlaylists(userId: string, params?: { page?: number; limit?: number }) {
    return this.client.get(`/users/${userId}/playlists`, { params });
  }
}

export const api = new ApiClient();
export default api;