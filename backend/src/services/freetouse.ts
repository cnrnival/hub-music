/**
 * Hub Music - Free To Use Service
 * Serviço de integração com Free To Use API: faixas royalty-free completas
 * Free To Use API integration service: full royalty-free tracks
 * 
 * @languages pt-BR / en-US
 */

import { getOrSet } from './cache.js';

const FREETOUSE_API = process.env.FREETOUSE_API_URL || 'https://api.freetouse.com/v3';
const CACHE_TTL = 600; // 10 minutes

interface FTUTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: number;
  bpm: number;
  key: string;
  license: string;
  license_url: string;
  download_url: string;
  stream_url: string;
  waveform_url: string;
  cover_url: string;
  tags: string[];
  created_at: string;
}

interface FTUResponse {
  tracks: FTUTrack[];
  total: number;
  page: number;
  per_page: number;
}

export async function searchFreeToUse(query: string, limit = 20, page = 1): Promise<{
  tracks: any[];
  total: number;
}> {
  const cacheKey = `ftu:search:${query}:${limit}:${page}`;
  return getOrSet(cacheKey, async () => {
    const url = `${FREETOUSE_API}/tracks/search?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HubMusic/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Free To Use API error: ${response.status}`);
    }

    const data: FTUResponse = await response.json();
    return {
      tracks: data.tracks.map(transformFTUTrack),
      total: data.total
    };
  }, { ttl: CACHE_TTL });
}

export async function getFreeToUseTracks(limit = 20, page = 1, genre?: string, mood?: string): Promise<{
  tracks: any[];
  total: number;
}> {
  const cacheKey = `ftu:tracks:${limit}:${page}:${genre || ''}:${mood || ''}`;
  return getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page)
    });
    if (genre) params.append('genre', genre);
    if (mood) params.append('mood', mood);

    const url = `${FREETOUSE_API}/tracks?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HubMusic/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Free To Use API error: ${response.status}`);
    }

    const data: FTUResponse = await response.json();
    return {
      tracks: data.tracks.map(transformFTUTrack),
      total: data.total
    };
  }, { ttl: CACHE_TTL });
}

export async function getFreeToUseTrack(id: string): Promise<any | null> {
  const cacheKey = `ftu:track:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${FREETOUSE_API}/tracks/${id}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HubMusic/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Free To Use API error: ${response.status}`);
    }

    const track: FTUTrack = await response.json();
    return transformFTUTrack(track, true);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getFreeToUseGenres(): Promise<string[]> {
  const cacheKey = 'ftu:genres';
  return getOrSet(cacheKey, async () => {
    const url = `${FREETOUSE_API}/genres`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.genres || [];
  }, { ttl: CACHE_TTL * 24 }); // Cache genres for 24 hours
}

export async function getFreeToUseMoods(): Promise<string[]> {
  const cacheKey = 'ftu:moods';
  return getOrSet(cacheKey, async () => {
    const url = `${FREETOUSE_API}/moods`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.moods || [];
  }, { ttl: CACHE_TTL * 24 });
}

function transformFTUTrack(track: FTUTrack, _indexOrDetailed?: number | boolean): any {
  const result: any = {
    id: `ftu:${track.id}`,
    source: 'FREETOUSE',
    externalId: track.id,
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    mood: track.mood,
    durationSeconds: track.duration,
    bpm: track.bpm,
    key: track.key,
    license: track.license,
    licenseUrl: track.license_url,
    streamUrl: track.stream_url,
    downloadUrl: track.download_url,
    waveformUrl: track.waveform_url,
    coverUrl: track.cover_url,
    tags: track.tags,
    type: 'track'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    result.createdAt = track.created_at;
  }

  return result;
}

export default {
  search: searchFreeToUse,
  getTracks: getFreeToUseTracks,
  getTrack: getFreeToUseTrack,
  getGenres: getFreeToUseGenres,
  getMoods: getFreeToUseMoods
};