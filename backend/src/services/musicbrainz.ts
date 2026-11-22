/**
 * Hub Music - MusicBrainz Service
 * Serviço de integração com MusicBrainz: metadados authoritative de artistas e álbuns
 * MusicBrainz API integration service: authoritative artist and album metadata
 * 
 * @languages pt-BR / en-US
 */

import { getOrSet } from './cache.js';

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const USER_AGENT = process.env.MUSICBRAINZ_USER_AGENT || 'HubMusic/1.0 (https://github.com/seu-usuario/hub-music)';
const CACHE_TTL = 3600; // 1 hour (MusicBrainz data is stable)

interface MBRecording {
  id: string;
  title: string;
  length: number;
  'artist-credit': Array<{
    artist: { id: string; name: string };
    name: string;
    joinphrase: string;
  }>;
  releases?: Array<{
    id: string;
    title: string;
    'cover-art-archive': { artwork: boolean; front: boolean; back: boolean };
  }>;
  isrcs?: string[];
  tags?: Array<{ name: string; count: number }>;
}

interface MBArtist {
  id: string;
  name: string;
  sort_name: string;
  disambiguation: string;
  type: string;
  gender: string;
  country: string;
  'life-span': { begin: string; end: string; ended: boolean };
  tags?: Array<{ name: string; count: number }>;
  aliases?: Array<{ name: string; sort_name: string }>;
}

interface MBRelease {
  id: string;
  title: string;
  status: string;
  'date': string;
  country: string;
  'artist-credit': Array<{
    artist: { id: string; name: string };
    name: string;
    joinphrase: string;
  }>;
  'cover-art-archive': { artwork: boolean; front: boolean; back: boolean };
  'media': Array<{
    position: number;
    format: string;
    'track-count': number;
    tracks: Array<{
      id: string;
      number: string;
      title: string;
      length: number;
      recording: { id: string; title: string };
    }>;
  }>;
  tags?: Array<{ name: string; count: number }>;
}

interface MBSearchResponse<T> {
  created: string;
  count: number;
  offset: number;
  scoring?: any;
  data: T[];
}

export async function searchMusicBrainzRecordings(query: string, limit = 20): Promise<any[]> {
  const cacheKey = `mb:recordings:${query}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const data: MBSearchResponse<MBRecording> = await response.json();
    return data.data.map(transformMBRecording);
  }, { ttl: CACHE_TTL });
}

export async function getMusicBrainzRecording(id: string): Promise<any | null> {
  const cacheKey = `mb:recording:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/recording/${id}?inc=releases+isrcs+tags+artist-credits&fmt=json`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const recording: MBRecording = await response.json();
    return transformMBRecording(recording, true);
  }, { ttl: CACHE_TTL });
}

export async function searchMusicBrainzArtists(query: string, limit = 20): Promise<any[]> {
  const cacheKey = `mb:artists:${query}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/artist?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const data: MBSearchResponse<MBArtist> = await response.json();
    return data.data.map(transformMBArtist);
  }, { ttl: CACHE_TTL });
}

export async function getMusicBrainzArtist(id: string): Promise<any | null> {
  const cacheKey = `mb:artist:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/artist/${id}?inc=tags+aliases&fmt=json`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const artist: MBArtist = await response.json();
    return transformMBArtist(artist, true);
  }, { ttl: CACHE_TTL });
}

export async function searchMusicBrainzReleases(query: string, limit = 20): Promise<any[]> {
  const cacheKey = `mb:releases:${query}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/release?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const data: MBSearchResponse<MBRelease> = await response.json();
    return data.data.map(transformMBRelease);
  }, { ttl: CACHE_TTL });
}

export async function getMusicBrainzRelease(id: string): Promise<any | null> {
  const cacheKey = `mb:release:${id}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/release/${id}?inc=recordings+artist-credits+cover-art&fmt=json`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const release: MBRelease = await response.json();
    return transformMBRelease(release, true);
  }, { ttl: CACHE_TTL });
}

export async function getCoverArt(releaseId: string): Promise<string | null> {
  // Use Cover Art Archive
  const url = `https://coverartarchive.org/release/${releaseId}/front`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (response.ok) {
      return url;
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function getISRCRecording(isrc: string): Promise<any | null> {
  const cacheKey = `mb:isrc:${isrc}`;
  return getOrSet(cacheKey, async () => {
    const url = `${MUSICBRAINZ_API}/recording?query=isrc:${isrc}&fmt=json&limit=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) return null;

    const data: MBSearchResponse<MBRecording> = await response.json();
    if (data.count === 0) return null;

    return transformMBRecording(data.data[0], true);
  }, { ttl: CACHE_TTL });
}

function transformMBRecording(recording: MBRecording, _indexOrDetailed?: number | boolean): any {
  const artistNames = recording['artist-credit']?.map(ac => ac.name).join(', ') || 'Unknown';
  const artistIds = recording['artist-credit']?.map(ac => `mb:${ac.artist.id}`) || [];

  const result: any = {
    id: `mb:${recording.id}`,
    source: 'MUSICBRAINZ',
    externalId: recording.id,
    title: recording.title,
    artist: artistNames,
    artistIds,
    durationSeconds: recording.length ? Math.round(recording.length / 1000) : 0,
    isrcs: recording.isrcs || [],
    type: 'track'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    result.releases = recording.releases?.map(r => ({
      id: `mb:${r.id}`,
      title: r.title,
      hasCover: r['cover-art-archive']?.front || false
    })) || [];
    result.tags = recording.tags?.map(t => t.name) || [];
  }

  return result;
}

function transformMBArtist(artist: MBArtist, _indexOrDetailed?: number | boolean): any {
  const result: any = {
    id: `mb:${artist.id}`,
    source: 'MUSICBRAINZ',
    externalId: artist.id,
    name: artist.name,
    sortName: artist.sort_name,
    disambiguation: artist.disambiguation,
    type: artist.type,
    gender: artist.gender,
    country: artist.country,
    lifeSpan: artist['life-span'],
    entityType: 'artist'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    result.tags = artist.tags?.map(t => t.name) || [];
    result.aliases = artist.aliases?.map(a => a.name) || [];
  }

  return result;
}

function transformMBRelease(release: MBRelease, _indexOrDetailed?: number | boolean): any {
  const artistNames = release['artist-credit']?.map(ac => ac.name).join(', ') || 'Unknown';
  const hasCover = release['cover-art-archive']?.front || false;

  const result: any = {
    id: `mb:${release.id}`,
    source: 'MUSICBRAINZ',
    externalId: release.id,
    title: release.title,
    artist: artistNames,
    date: release.date,
    country: release.country,
    status: release.status,
    coverUrl: hasCover ? `https://coverartarchive.org/release/${release.id}/front-500.jpg` : null,
    trackCount: release.media?.reduce((sum, m) => sum + m['track-count'], 0) || 0,
    type: 'album'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    result.media = release.media?.map(m => ({
      position: m.position,
      format: m.format,
      trackCount: m['track-count'],
      tracks: m.tracks?.map(t => ({
        id: `mb:${t.recording.id}`,
        number: t.number,
        title: t.title,
        durationSeconds: Math.round(t.length / 1000)
      }))
    })) || [];
    result.tags = release.tags?.map(t => t.name) || [];
  }

  return result;
}

export default {
  searchRecordings: searchMusicBrainzRecordings,
  getRecording: getMusicBrainzRecording,
  searchArtists: searchMusicBrainzArtists,
  getArtist: getMusicBrainzArtist,
  searchReleases: searchMusicBrainzReleases,
  getRelease: getMusicBrainzRelease,
  getCoverArt,
  getISRCRecording
};