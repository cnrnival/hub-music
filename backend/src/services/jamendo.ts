/**
 * Hub Music - Jamendo Service
 * Serviço de integração com Jamendo API: faixas CC licenciadas
 * Jamendo API integration service: CC-licensed tracks
 * 
 * @languages pt-BR / en-US
 */

import { getOrSet } from './cache.js';

const JAMENDO_API = process.env.JAMENDO_API_URL || 'https://api.jamendo.com/v3.0';
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || '';
const CACHE_TTL = 600; // 10 minutes

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  artist_id: string;
  album_id: string;
  album_name: string;
  duration: number;
  audiodownload: string;
  audio: string; // streaming URL
  audiodownload_allowed: boolean;
  license_ccurl: string;
  image: string;
  tag_list: string;
  musicinfo: {
    tags: Array<{ name: string; category: string }>;
  };
}

interface JamendoResponse {
  results: JamendoTrack[];
  total: number;
  page: number;
  per_page: number;
}

export async function searchJamendo(query: string, limit = 20, page = 1): Promise<{
  tracks: any[];
  total: number;
}> {
  if (!JAMENDO_CLIENT_ID) {
    console.warn('Jamendo client ID not configured');
    return { tracks: [], total: 0 };
  }

  const cacheKey = `jamendo:search:${query}:${limit}:${page}`;
  return getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      search: query,
      limit: String(limit),
      offset: String((page - 1) * limit),
      include: 'musicinfo',
      order: 'relevance'
    });

    const url = `${JAMENDO_API}/tracks/?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data: JamendoResponse = await response.json();
    return {
      tracks: data.results
        .filter(t => t.audiodownload_allowed) // Only tracks that allow streaming
        .map(transformJamendoTrack),
      total: data.total
    };
  }, { ttl: CACHE_TTL });
}

export async function getJamendoTracks(limit = 20, page = 1, tags?: string[]): Promise<{
  tracks: any[];
  total: number;
}> {
  if (!JAMENDO_CLIENT_ID) {
    return { tracks: [], total: 0 };
  }

  const cacheKey = `jamendo:tracks:${limit}:${page}:${tags?.join(',') || ''}`;
  return getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      limit: String(limit),
      offset: String((page - 1) * limit),
      include: 'musicinfo',
      order: 'popularity_total'
    });

    if (tags && tags.length > 0) {
      params.append('tags', tags.join('+'));
    }

    const url = `${JAMENDO_API}/tracks/?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data: JamendoResponse = await response.json();
    return {
      tracks: data.results
        .filter(t => t.audiodownload_allowed)
        .map(transformJamendoTrack),
      total: data.total
    };
  }, { ttl: CACHE_TTL });
}

export async function getJamendoTrack(id: string): Promise<any | null> {
  if (!JAMENDO_CLIENT_ID) return null;

  const cacheKey = `jamendo:track:${id}`;
  return getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      include: 'musicinfo'
    });

    const url = `${JAMENDO_API}/tracks/${id}/?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data: JamendoResponse = await response.json();
    if (data.results.length === 0) return null;

    return transformJamendoTrack(data.results[0], true);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getJamendoArtist(artistId: string): Promise<any | null> {
  if (!JAMENDO_CLIENT_ID) return null;

  const cacheKey = `jamendo:artist:${artistId}`;
  return getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json'
    });

    const url = `${JAMENDO_API}/artists/${artistId}/?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const artist = data.results[0];
    return {
      id: `jamendo:${artist.id}`,
      source: 'JAMENDO',
      externalId: artist.id,
      name: artist.name,
      image: artist.image,
      description: artist.description,
      tagList: artist.tag_list,
      type: 'artist'
    };
  }, { ttl: CACHE_TTL * 10 });
}

function transformJamendoTrack(track: JamendoTrack, _indexOrDetailed?: number | boolean): any {
  const result: any = {
    id: `jamendo:${track.id}`,
    source: 'JAMENDO',
    externalId: track.id,
    title: track.name,
    artist: track.artist_name,
    artistId: `jamendo:${track.artist_id}`,
    album: track.album_name,
    albumId: `jamendo:${track.album_id}`,
    durationSeconds: track.duration,
    streamUrl: track.audio,
    downloadUrl: track.audiodownload_allowed ? track.audiodownload : null,
    licenseUrl: track.license_ccurl,
    coverUrl: track.image,
    tags: track.tag_list?.split(', ') || [],
    musicInfoTags: track.musicinfo?.tags || [],
    type: 'track'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    result.downloadAllowed = track.audiodownload_allowed;
  }

  return result;
}

export default {
  search: searchJamendo,
  getTracks: getJamendoTracks,
  getTrack: getJamendoTrack,
  getArtist: getJamendoArtist
};