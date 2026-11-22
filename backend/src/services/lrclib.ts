/**
 * Hub Music - LRCLIB Service
 * Serviço de integração com LRCLIB: letras sincronizadas (LRC)
 * LRCLIB API integration service: synced lyrics (LRC)
 * 
 * @languages pt-BR / en-US
 */

import { getOrSet } from './cache.js';

const LRCLIB_API = process.env.LRCLIB_API_URL || 'https://lrclib.net/api';
const CACHE_TTL = 86400; // 24 hours (lyrics don't change often)

interface LRCLIBLyrics {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string | null;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export async function searchLRCLIBLyrics(query: string, limit = 20): Promise<any[]> {
  const cacheKey = `lrclib:search:${query}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${LRCLIB_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      throw new Error(`LRCLIB API error: ${response.status}`);
    }

    const data: LRCLIBLyrics[] = await response.json();
    return data.map(transformLRCLIBLyrics);
  }, { ttl: CACHE_TTL });
}

export async function getLRCLIBLyricsById(id: number): Promise<any | null> {
  const cacheKey = `lrclib:lyrics:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${LRCLIB_API}/get/${id}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`LRCLIB API error: ${response.status}`);
    }

    const lyrics: LRCLIBLyrics = await response.json();
    return transformLRCLIBLyrics(lyrics, true);
  }, { ttl: CACHE_TTL });
}

export async function getLRCLIBLyricsByTrack(artist: string, track: string, album?: string, duration?: number): Promise<any | null> {
  const cacheKey = `lrclib:track:${artist}:${track}:${album || ''}:${duration || ''}`;
  return getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      artist_name: artist,
      track_name: track
    });
    if (album) params.append('album_name', album);
    if (duration) params.append('duration', String(duration));

    const url = `${LRCLIB_API}/get?${params.toString()}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`LRCLIB API error: ${response.status}`);
    }

    const lyrics: LRCLIBLyrics = await response.json();
    return transformLRCLIBLyrics(lyrics, true);
  }, { ttl: CACHE_TTL });
}

export async function getLRCLIBRandomLyrics(): Promise<any | null> {
  const cacheKey = 'lrclib:random';
  return getOrSet(cacheKey, async () => {
    const url = `${LRCLIB_API}/random`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'HubMusic/1.0' }
    });

    if (!response.ok) return null;

    const lyrics: LRCLIBLyrics = await response.json();
    return transformLRCLIBLyrics(lyrics);
  }, { ttl: 300 }); // Short cache for random
}

function transformLRCLIBLyrics(lyrics: LRCLIBLyrics, _indexOrDetailed?: number | boolean): any {
  const result: any = {
    id: `lrclib:${lyrics.id}`,
    source: 'LRCLIB',
    externalId: String(lyrics.id),
    trackName: lyrics.trackName,
    artistName: lyrics.artistName,
    albumName: lyrics.albumName,
    durationSeconds: lyrics.duration,
    instrumental: lyrics.instrumental,
    plainLyrics: lyrics.plainLyrics,
    syncedLyrics: lyrics.syncedLyrics,
    hasSynced: !!lyrics.syncedLyrics,
    type: 'lyrics'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    // Parse synced lyrics into structured format
    if (lyrics.syncedLyrics) {
      result.parsedSynced = parseSyncedLyrics(lyrics.syncedLyrics);
    }
  }

  return result;
}

/**
 * Parse LRC format synced lyrics into array of { time, text }
 * Format: [mm:ss.xx]text
 */
function parseSyncedLyrics(lrc: string): Array<{ time: number; text: string }> {
  const lines = lrc.split('\n');
  const result: Array<{ time: number; text: string }> = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = match[3].length === 3
        ? parseInt(match[3], 10) / 10
        : parseInt(match[3], 10);
      const text = match[4].trim();

      const time = minutes * 60 + seconds + centiseconds / 100;
      result.push({ time, text });
    }
  }

  return result;
}

export default {
  search: searchLRCLIBLyrics,
  getById: getLRCLIBLyricsById,
  getByTrack: getLRCLIBLyricsByTrack,
  getRandom: getLRCLIBRandomLyrics
};