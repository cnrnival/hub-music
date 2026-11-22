/**
 * Hub Music - Deezer Service
 * Serviço de integração com Deezer API: busca de faixas, artistas, álbuns
 * Deezer API integration service: track, artist, album search
 * 
 * @languages pt-BR / en-US
 */

import { getOrSet } from './cache.js';

const DEEZER_API = process.env.DEEZER_API_URL || 'https://api.deezer.com';
const CACHE_TTL = 300; // 5 minutes

interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  title_version: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string; // 30s preview MP3
  md5_image: string;
  artist: {
    id: number;
    name: string;
    link: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    tracklist: string;
    type: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    md5_image: string;
    tracklist: string;
    type: string;
  };
  type: string;
}

interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
  next: string;
}

interface DeezerArtist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_album?: number;
  nb_fan?: number;
  radio?: boolean;
  tracklist: string;
  type: string;
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  md5_image: string;
  tracklist: string;
  link?: string;
  type: string;
}

export async function searchDeezer(query: string, limit = 20): Promise<{
  tracks: any[];
  albums: any[];
  artists: any[];
  total: number;
}> {
  const cacheKey = `deezer:search:${query}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HubMusic/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const data: DeezerSearchResponse = await response.json();

    const tracks = data.data.map(transformDeezerTrack);

    // Get unique albums and artists
    const albumMap = new Map<number, any>();
    const artistMap = new Map<number, any>();

    for (const track of data.data) {
      if (track.album && !albumMap.has(track.album.id)) {
        albumMap.set(track.album.id, transformDeezerAlbum(track.album));
      }
      if (track.artist && !artistMap.has(track.artist.id)) {
        artistMap.set(track.artist.id, transformDeezerArtist(track.artist));
      }
    }

    return {
      tracks,
      albums: Array.from(albumMap.values()),
      artists: Array.from(artistMap.values()),
      total: data.total
    };
  }, { ttl: CACHE_TTL });
}

export async function getDeezerTrack(id: number): Promise<any> {
  const cacheKey = `deezer:track:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${DEEZER_API}/track/${id}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const track: DeezerTrack = await response.json();
    return transformDeezerTrack(track);
  }, { ttl: CACHE_TTL });
}

export async function getDeezerArtist(id: number): Promise<any> {
  const cacheKey = `deezer:artist:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${DEEZER_API}/artist/${id}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const artist: DeezerArtist = await response.json();
    return transformDeezerArtist(artist);
  }, { ttl: CACHE_TTL * 10 }); // Cache artist longer
}

export async function getDeezerAlbum(id: number): Promise<any> {
  const cacheKey = `deezer:album:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${DEEZER_API}/album/${id}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const album: DeezerAlbum = await response.json();
    return transformDeezerAlbum(album);
  }, { ttl: CACHE_TTL * 10 });
}

export async function getDeezerArtistTopTracks(artistId: number, limit = 20): Promise<any[]> {
  const cacheKey = `deezer:artist:${artistId}:toptracks:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${DEEZER_API}/artist/${artistId}/top?limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const data: DeezerSearchResponse = await response.json();
    return data.data.map(transformDeezerTrack);
  }, { ttl: CACHE_TTL });
}

export async function getDeezerAlbumTracks(albumId: number): Promise<any[]> {
  const cacheKey = `deezer:album:${albumId}:tracks`;
  return getOrSet(cacheKey, async () => {
    const url = `${DEEZER_API}/album/${albumId}/tracks`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }

    const data: DeezerSearchResponse = await response.json();
    return data.data.map(transformDeezerTrack);
  }, { ttl: CACHE_TTL });
}

function transformDeezerTrack(track: DeezerTrack): any {
  return {
    id: `deezer:${track.id}`,
    source: 'DEEZER',
    externalId: String(track.id),
    title: track.title,
    artist: track.artist.name,
    artistId: `deezer:${track.artist.id}`,
    album: track.album.title,
    albumId: `deezer:${track.album.id}`,
    durationSeconds: track.duration,
    previewUrl: track.preview,
    coverUrl: track.album.cover_medium || track.album.cover_big || track.album.cover,
    coverUrlLarge: track.album.cover_xl || track.album.cover_big,
    link: track.link,
    explicit: track.explicit_lyrics,
    rank: track.rank,
    type: 'track'
  };
}

function transformDeezerArtist(artist: DeezerArtist): any {
  return {
    id: `deezer:${artist.id}`,
    source: 'DEEZER',
    externalId: String(artist.id),
    name: artist.name,
    pictureUrl: artist.picture_medium || artist.picture_big,
    pictureUrlLarge: artist.picture_xl || artist.picture_big,
    nbAlbum: artist.nb_album,
    nbFan: artist.nb_fan,
    radio: artist.radio,
    link: artist.link,
    type: 'artist'
  };
}

function transformDeezerAlbum(album: DeezerAlbum): any {
  return {
    id: `deezer:${album.id}`,
    source: 'DEEZER',
    externalId: String(album.id),
    title: album.title,
    coverUrl: album.cover_medium || album.cover_big,
    coverUrlLarge: album.cover_xl || album.cover_big,
    link: album.link,
    type: 'album'
  };
}

export async function getDeezerPreviewUrl(trackId: number): Promise<string | null> {
  const track = await getDeezerTrack(trackId);
  return track?.previewUrl || null;
}

export default {
  search: searchDeezer,
  getTrack: getDeezerTrack,
  getArtist: getDeezerArtist,
  getAlbum: getDeezerAlbum,
  getArtistTopTracks: getDeezerArtistTopTracks,
  getAlbumTracks: getDeezerAlbumTracks,
  getPreviewUrl: getDeezerPreviewUrl
};