/**
 * Hub Music - Public API Routes
 * Rotas de proxy para APIs públicas: Deezer, MusicBrainz, Free To Use, Jamendo, LRCLIB
 * Public API routes: proxy for Deezer, MusicBrainz, Free To Use, Jamendo, LRCLIB
 * 
 * @languages pt-BR / en-US
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

// Deezer
import {
  searchDeezer,
  getDeezerTrack,
  getDeezerArtist,
  getDeezerAlbum,
  getDeezerArtistTopTracks,
  getDeezerAlbumTracks
} from '../services/deezer.js';

// MusicBrainz
import {
  searchMusicBrainzRecordings,
  getMusicBrainzRecording,
  searchMusicBrainzArtists,
  getMusicBrainzArtist,
  searchMusicBrainzReleases,
  getMusicBrainzRelease,
  getCoverArt,
  getISRCRecording
} from '../services/musicbrainz.js';

// Free To Use
import {
  searchFreeToUse,
  getFreeToUseTracks,
  getFreeToUseTrack,
  getFreeToUseGenres,
  getFreeToUseMoods
} from '../services/freetouse.js';

// Jamendo
import {
  searchJamendo,
  getJamendoTracks,
  getJamendoTrack,
  getJamendoArtist
} from '../services/jamendo.js';

// LRCLIB
import {
  searchLRCLIBLyrics,
  getLRCLIBLyricsById,
  getLRCLIBLyricsByTrack
} from '../services/lrclib.js';

// Radio Browser
import {
  searchRadioStations,
  getRadioStationsByCountry,
  getRadioStationsByTag,
  getRadioStationsByLanguage,
  getTopRadioStations,
  getRadioStationByUUID,
  getRadioCountries,
  getRadioTags,
  getRadioLanguages
} from '../services/radiobrowser.js';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(50).default(20),
  page: z.coerce.number().min(1).default(1)
});

const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  genre: z.string().optional(),
  mood: z.string().optional(),
  tags: z.string().optional()
});

const lyricsQuerySchema = z.object({
  artist: z.string().min(1),
  track: z.string().min(1),
  album: z.string().optional(),
  duration: z.coerce.number().optional()
});

export async function publicApiRoutes(fastify: FastifyInstance) {
  // ========== DEEZER ==========
  fastify.get('/deezer/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = searchQuerySchema.parse(request.query);
    const results = await searchDeezer(q, limit);
    return results;
  });

  fastify.get('/deezer/track/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const trackId = parseInt(id, 10);
    if (isNaN(trackId)) throw new ValidationError('ID inválido');

    const track = await getDeezerTrack(trackId);
    if (!track) throw new ValidationError('Faixa não encontrada');

    return { track };
  });

  fastify.get('/deezer/artist/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const artistId = parseInt(id, 10);
    if (isNaN(artistId)) throw new ValidationError('ID inválido');

    const artist = await getDeezerArtist(artistId);
    if (!artist) throw new ValidationError('Artista não encontrado');

    return { artist };
  });

  fastify.get('/deezer/album/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const albumId = parseInt(id, 10);
    if (isNaN(albumId)) throw new ValidationError('ID inválido');

    const album = await getDeezerAlbum(albumId);
    if (!album) throw new ValidationError('Álbum não encontrado');

    return { album };
  });

  fastify.get('/deezer/artist/:id/top-tracks', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: { limit: { type: 'number', minimum: 1, maximum: 50, default: 20 } }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { limit } = paginationSchema.parse(request.query);
    const artistId = parseInt(id, 10);
    if (isNaN(artistId)) throw new ValidationError('ID inválido');

    const tracks = await getDeezerArtistTopTracks(artistId, limit);
    return { tracks };
  });

  fastify.get('/deezer/album/:id/tracks', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const albumId = parseInt(id, 10);
    if (isNaN(albumId)) throw new ValidationError('ID inválido');

    const tracks = await getDeezerAlbumTracks(albumId);
    return { tracks };
  });

  // ========== MUSICBRAINZ ==========
  fastify.get('/musicbrainz/recordings', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = searchQuerySchema.parse(request.query);
    const recordings = await searchMusicBrainzRecordings(q, limit);
    return { recordings };
  });

  fastify.get('/musicbrainz/recording/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const recording = await getMusicBrainzRecording(id);
    if (!recording) throw new ValidationError('Gravação não encontrada');
    return { recording };
  });

  fastify.get('/musicbrainz/artists', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = searchQuerySchema.parse(request.query);
    const artists = await searchMusicBrainzArtists(q, limit);
    return { artists };
  });

  fastify.get('/musicbrainz/artist/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const artist = await getMusicBrainzArtist(id);
    if (!artist) throw new ValidationError('Artista não encontrado');
    return { artist };
  });

  fastify.get('/musicbrainz/releases', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = searchQuerySchema.parse(request.query);
    const releases = await searchMusicBrainzReleases(q, limit);
    return { releases };
  });

  fastify.get('/musicbrainz/release/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const release = await getMusicBrainzRelease(id);
    if (!release) throw new ValidationError('Lançamento não encontrado');
    return { release };
  });

  fastify.get('/musicbrainz/cover-art/:releaseId', {
    schema: {
      params: {
        type: 'object',
        properties: { releaseId: { type: 'string', format: 'uuid' } },
        required: ['releaseId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { releaseId } = request.params as { releaseId: string };
    const coverUrl = await getCoverArt(releaseId);
    if (!coverUrl) throw new ValidationError('Capa não encontrada');
    return { coverUrl };
  });

  fastify.get('/musicbrainz/isrc/:isrc', {
    schema: {
      params: {
        type: 'object',
        properties: { isrc: { type: 'string', pattern: '^[A-Z]{2}[A-Z0-9]{3}\\d{7}$' } },
        required: ['isrc']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { isrc } = request.params as { isrc: string };
    const recording = await getISRCRecording(isrc);
    if (!recording) throw new ValidationError('Gravação não encontrada para este ISRC');
    return { recording };
  });

  // ========== FREE TO USE ==========
  fastify.get('/freetouse/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          page: { type: 'number', minimum: 1, default: 1 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit, page } = searchQuerySchema.parse(request.query);
    const results = await searchFreeToUse(q, limit, page);
    return results;
  });

  fastify.get('/freetouse/tracks', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          page: { type: 'number', minimum: 1, default: 1 },
          genre: { type: 'string' },
          mood: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit, page, genre, mood } = paginationSchema.parse(request.query);
    const results = await getFreeToUseTracks(limit, page, genre, mood);
    return results;
  });

  fastify.get('/freetouse/track/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const track = await getFreeToUseTrack(id);
    if (!track) throw new ValidationError('Faixa não encontrada');
    return { track };
  });

  fastify.get('/freetouse/genres', async (_request: FastifyRequest, reply: FastifyReply) => {
    const genres = await getFreeToUseGenres();
    return { genres };
  });

  fastify.get('/freetouse/moods', async (_request: FastifyRequest, reply: FastifyReply) => {
    const moods = await getFreeToUseMoods();
    return { moods };
  });

  // ========== JAMENDO ==========
  fastify.get('/jamendo/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          page: { type: 'number', minimum: 1, default: 1 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit, page } = searchQuerySchema.parse(request.query);
    const results = await searchJamendo(q, limit, page);
    return results;
  });

  fastify.get('/jamendo/tracks', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          page: { type: 'number', minimum: 1, default: 1 },
          tags: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit, page, tags } = paginationSchema.parse(request.query);
    const tagArray = tags ? tags.split(',') : undefined;
    const results = await getJamendoTracks(limit, page, tagArray);
    return results;
  });

  fastify.get('/jamendo/track/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const track = await getJamendoTrack(id);
    if (!track) throw new ValidationError('Faixa não encontrada');
    return { track };
  });

  fastify.get('/jamendo/artist/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const artist = await getJamendoArtist(id);
    if (!artist) throw new ValidationError('Artista não encontrado');
    return { artist };
  });

  // ========== LRCLIB (Lyrics) ==========
  fastify.get('/lrclib/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = searchQuerySchema.parse(request.query);
    const lyrics = await searchLRCLIBLyrics(q, limit);
    return { lyrics };
  });

  fastify.get('/lrclib/lyrics/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const lyricsId = parseInt(id, 10);
    if (isNaN(lyricsId)) throw new ValidationError('ID inválido');

    const lyrics = await getLRCLIBLyricsById(lyricsId);
    if (!lyrics) throw new ValidationError('Letra não encontrada');
    return { lyrics };
  });

  fastify.get('/lrclib/lyrics', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          artist: { type: 'string', minLength: 1 },
          track: { type: 'string', minLength: 1 },
          album: { type: 'string' },
          duration: { type: 'number' }
        },
        required: ['artist', 'track']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { artist, track, album, duration } = lyricsQuerySchema.parse(request.query);
    const lyrics = await getLRCLIBLyricsByTrack(artist, track, album, duration);
    if (!lyrics) throw new ValidationError('Letra não encontrada');
    return { lyrics };
  });

  // ========== RADIO BROWSER ==========
  fastify.get('/radio/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = searchQuerySchema.parse(request.query);
    const stations = await searchRadioStations(q, limit);
    return { stations };
  });

  fastify.get('/radio/stations', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          country: { type: 'string', pattern: '^[A-Z]{2}$' },
          tag: { type: 'string' },
          language: { type: 'string', pattern: '^[a-z]{2,3}$' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { country, tag, language, limit } = request.query as any;

    let stations: any[] = [];
    if (country) {
      stations = await getRadioStationsByCountry(country.toUpperCase(), limit);
    } else if (tag) {
      stations = await getRadioStationsByTag(tag, limit);
    } else if (language) {
      stations = await getRadioStationsByLanguage(language.toLowerCase(), limit);
    } else {
      stations = await getTopRadioStations(limit);
    }

    return { stations };
  });

  fastify.get('/radio/station/:uuid', {
    schema: {
      params: {
        type: 'object',
        properties: { uuid: { type: 'string', format: 'uuid' } },
        required: ['uuid']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { uuid } = request.params as { uuid: string };
    const station = await getRadioStationByUUID(uuid);
    if (!station) throw new ValidationError('Estação não encontrada');
    return { station };
  });

  fastify.get('/radio/countries', async (_request: FastifyRequest, reply: FastifyReply) => {
    const countries = await getRadioCountries();
    return { countries };
  });

  fastify.get('/radio/tags', {
    schema: {
      querystring: {
        type: 'object',
        properties: { limit: { type: 'number', minimum: 1, maximum: 500, default: 100 } }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit } = paginationSchema.parse(request.query);
    const tags = await getRadioTags(limit);
    return { tags };
  });

  fastify.get('/radio/languages', async (_request: FastifyRequest, reply: FastifyReply) => {
    const languages = await getRadioLanguages();
    return { languages };
  });

  // ========== UNIFIED SEARCH ACROSS ALL APIs ==========
  fastify.get('/unified/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          sources: { type: 'string' }, // comma-separated: deezer,musicbrainz,freetouse,jamendo
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, sources, limit } = request.query as any;
    const sourceList = sources ? sources.split(',') : ['deezer', 'musicbrainz', 'freetouse', 'jamendo'];
    const perSourceLimit = Math.ceil(limit / sourceList.length);

    const results: Record<string, any> = {};

    await Promise.all(
      sourceList.map(async (source: string) => {
        try {
          switch (source) {
            case 'deezer':
              results.deezer = await searchDeezer(q, perSourceLimit);
              break;
            case 'musicbrainz':
              results.musicbrainz = { recordings: await searchMusicBrainzRecordings(q, perSourceLimit) };
              break;
            case 'freetouse':
              results.freetouse = await searchFreeToUse(q, perSourceLimit);
              break;
            case 'jamendo':
              results.jamendo = await searchJamendo(q, perSourceLimit);
              break;
          }
        } catch (err) {
          console.error(`Search failed for ${source}:`, err);
          results[source] = { error: 'Search failed', tracks: [] };
        }
      })
    );

    return { query: q, results };
  });
}