/**
 * Hub Music - Radio Browser Service
 * Serviço de integração com Radio Browser: estações de rádio ao vivo
 * Radio Browser API integration service: live radio stations
 * 
 * @languages pt-BR / en-US
 */

import { getOrSet } from './cache.js';

const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';
const USER_AGENT = 'HubMusic/1.0 (https://github.com/seu-usuario/hub-music)';
const CACHE_TTL = 300; // 5 minutes (stations can change)

interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  languagecodes: string;
  votes: number;
  lastchangetime: string;
  lastchangetime_iso8601: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime: string;
  lastchecktime_iso8601: string;
  lastlocalchecktime: string;
  lastlocalchecktime_iso8601: string;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
}

export async function searchRadioStations(query: string, limit = 20): Promise<any[]> {
  const cacheKey = `radio:search:${query}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/stations/search?name=${encodeURIComponent(query)}&limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Radio Browser API error: ${response.status}`);
    }

    const data: RadioStation[] = await response.json();
    return data.map(transformRadioStation);
  }, { ttl: CACHE_TTL });
}

export async function getRadioStationsByCountry(countryCode: string, limit = 50): Promise<any[]> {
  const cacheKey = `radio:country:${countryCode}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/stations/bycountrycode/${countryCode}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Radio Browser API error: ${response.status}`);
    }

    const data: RadioStation[] = await response.json();
    return data.map(transformRadioStation);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getRadioStationsByTag(tag: string, limit = 50): Promise<any[]> {
  const cacheKey = `radio:tag:${tag}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Radio Browser API error: ${response.status}`);
    }

    const data: RadioStation[] = await response.json();
    return data.map(transformRadioStation);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getRadioStationsByLanguage(languageCode: string, limit = 50): Promise<any[]> {
  const cacheKey = `radio:lang:${languageCode}:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/stations/bylanguagecode/${languageCode}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Radio Browser API error: ${response.status}`);
    }

    const data: RadioStation[] = await response.json();
    return data.map(transformRadioStation);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getTopRadioStations(limit = 50): Promise<any[]> {
  const cacheKey = `radio:top:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/stations/topclicks/${limit}?hidebroken=true`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Radio Browser API error: ${response.status}`);
    }

    const data: RadioStation[] = await response.json();
    return data.map(transformRadioStation);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getRadioStationByUUID(uuid: string): Promise<any | null> {
  const cacheKey = `radio:station:${uuid}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/stations/byuuid/${uuid}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Radio Browser API error: ${response.status}`);
    }

    const data: RadioStation[] = await response.json();
    if (data.length === 0) return null;

    return transformRadioStation(data[0], true);
  }, { ttl: CACHE_TTL * 2 });
}

export async function getRadioCountries(): Promise<any[]> {
  const cacheKey = 'radio:countries';
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/countries`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((c: any) => ({
      name: c.name,
      code: c.iso_3166_1,
      stationCount: c.stationcount
    })).filter((c: any) => c.stationCount > 0);
  }, { ttl: CACHE_TTL * 24 });
}

export async function getRadioTags(limit = 100): Promise<string[]> {
  const cacheKey = `radio:tags:${limit}`;
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/tags?limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data
      .map((t: any) => t.name)
      .filter((name: string) => name && name.length > 1);
  }, { ttl: CACHE_TTL * 24 });
}

export async function getRadioLanguages(): Promise<any[]> {
  const cacheKey = 'radio:languages';
  return getOrSet(cacheKey, async () => {
    const url = `${RADIO_BROWSER_API}/languages`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((l: any) => ({
      name: l.name,
      code: l.iso_639,
      stationCount: l.stationcount
    })).filter((l: any) => l.stationCount > 0);
  }, { ttl: CACHE_TTL * 24 });
}

function transformRadioStation(station: RadioStation, _indexOrDetailed?: number | boolean): any {
  // Use resolved URL for streaming (follows redirects)
  const streamUrl = station.url_resolved || station.url;

  const result: any = {
    id: `radio:${station.stationuuid}`,
    source: 'RADIO_BROWSER',
    externalId: station.stationuuid,
    name: station.name,
    streamUrl,
    homepage: station.homepage,
    favicon: station.favicon,
    tags: station.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
    country: station.country,
    countryCode: station.countrycode,
    state: station.state,
    language: station.language,
    languageCodes: station.languagecodes?.split(',') || [],
    codec: station.codec,
    bitrate: station.bitrate,
    isHLS: station.hls === 1,
    votes: station.votes,
    clickCount: station.clickcount,
    clickTrend: station.clicktrend,
    lastCheckOk: station.lastcheckok === 1,
    type: 'radio'
  };

  if (typeof _indexOrDetailed === 'boolean' && _indexOrDetailed) {
    result.lastChangeTime = station.lastchangetime_iso8601;
    result.lastCheckTime = station.lastchecktime_iso8601;
    result.sslError = station.ssl_error;
  }

  return result;
}

export default {
  search: searchRadioStations,
  byCountry: getRadioStationsByCountry,
  byTag: getRadioStationsByTag,
  byLanguage: getRadioStationsByLanguage,
  top: getTopRadioStations,
  byUUID: getRadioStationByUUID,
  countries: getRadioCountries,
  tags: getRadioTags,
  languages: getRadioLanguages
};