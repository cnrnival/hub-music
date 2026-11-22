/**
 * Hub Music - Search Routes
 * Rotas de busca: unificada (Deefer + APIs públicas), sugestões, tendências, gêneros
 * Search routes: unified (public APIs + Deezer), suggestions, trending, genres
 * 
 * @languages pt-BR / en-US
 *
 * Note: Busca local não suportada — apenas APIs públicas (Deezer, Free To Use, Jamendo, LRCLIB).
 * Note: Local search not supported — only public APIs (Deezer, Free To Use, Jamendo, LRCLIB).
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { ValidationError } from '../utils/errors.js';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  source: z.enum(['local', 'deezer', 'all']).default('all'),
  genreId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  page: z.coerce.number().min(1).default(1),
  sortBy: z.enum(['relevance', 'createdAt', 'title', 'playCount']).default('relevance')
});

const suggestQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(10).default(5)
});

export async function searchRoutes(fastify: FastifyInstance) {
  // Unified search
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 200 },
          source: { type: 'string', enum: ['local', 'deezer', 'all'], default: 'all' },
          genreId: { type: 'string', format: 'uuid' },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          page: { type: 'number', minimum: 1, default: 1 },
          sortBy: { type: 'string', enum: ['relevance', 'createdAt', 'title', 'playCount'], default: 'relevance' }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = searchQuerySchema.parse(request.query);
    const userId = (request as any).user?.id;
    const { q, source, genreId, limit, page, sortBy } = query;

    const results: any = {
      local: { tracks: [], playlists: [], users: [], total: 0 },
      deezer: { tracks: [], albums: [], artists: [], total: 0 },
      pagination: { page, limit, total: 0, totalPages: 0 }
    };

    // Search local tracks
    if (source === 'local' || source === 'all') {
      const where: any = {
        visibility: 'PUBLIC',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { artist: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      };

      if (genreId) where.genreId = genreId;

      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'title') orderBy = { title: 'asc' };
      else if (sortBy === 'playCount') orderBy = { playCount: 'desc' };
      else if (sortBy === 'relevance') {
        // For relevance, we'll sort by a combination
        orderBy = [{ playCount: 'desc' }, { createdAt: 'desc' }];
      }

      const [tracks, playlists, users, trackCount] = await Promise.all([
        prisma.track.findMany({
          where,
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            genre: { select: { id: true, name: true, slug: true } },
            _count: { select: { likes: true, reposts: true, comments: true } }
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.playlist.findMany({
          where: {
            visibility: 'PUBLIC',
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          },
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            _count: { select: { tracks: true } }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { displayName: { contains: q, mode: 'insensitive' } }
            ]
          },
          select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
          take: 5
        }),
        prisma.track.count({ where })
      ]);

      const { generateSignedUrl } = await import('../services/storage.js');
      const tracksWithUrls = await Promise.all(
        tracks.map(async (track: any) => ({
          ...track,
          audioUrl: await generateSignedUrl(track.audioUrl),
          userLiked: userId ? !!(await prisma.like.findUnique({
            where: { userId_trackId: { userId, trackId: track.id } }
          })) : false,
          userReposted: userId ? !!(await prisma.repost.findUnique({
            where: { userId_trackId: { userId, trackId: track.id } }
          })) : false
        }))
      );

      results.local = { tracks: tracksWithUrls, playlists, users, total: trackCount };
    }

    // Search Deezer via proxy
    if (source === 'deezer' || source === 'all') {
      try {
        const deezerResults = await searchDeezer(q, limit);
        results.deezer = deezerResults;
      } catch (err) {
        console.error('Deezer search failed:', err);
        // Don't fail the whole request if Deezer is down
      }
    }

    // Calculate total for pagination (local only for now)
    const total = results.local.total;
    results.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };

    return results;
  });

  // Search suggestions (autocomplete)
  fastify.get('/suggest', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 100 },
          limit: { type: 'number', minimum: 1, maximum: 10, default: 5 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit } = suggestQuerySchema.parse(request.query);

    const [tracks, artists, playlists] = await Promise.all([
      prisma.track.findMany({
        where: {
          visibility: 'PUBLIC',
          OR: [
            { title: { startsWith: q, mode: 'insensitive' } },
            { artist: { startsWith: q, mode: 'insensitive' } }
          ]
        },
        select: { id: true, title: true, artist: true },
        take: limit
      }),
      prisma.track.findMany({
        where: {
          visibility: 'PUBLIC',
          artist: { startsWith: q, mode: 'insensitive' }
        },
        select: { artist: true },
        distinct: ['artist'],
        take: limit
      }),
      prisma.playlist.findMany({
        where: {
          visibility: 'PUBLIC',
          name: { startsWith: q, mode: 'insensitive' }
        },
        select: { id: true, name: true },
        take: limit
      })
    ]);

    return {
      tracks: tracks.map((t: any) => ({ id: t.id, title: t.title, artist: t.artist, type: 'track' })),
      artists: artists.map((a: any) => ({ name: a.artist, type: 'artist' })),
      playlists: playlists.map((p: any) => ({ id: p.id, name: p.name, type: 'playlist' }))
    };
  });

  // Get trending searches
  fastify.get('/trending', async (_request: FastifyRequest, reply: FastifyReply) => {
    // In a real app, you'd track search analytics
    // For now, return popular tracks/artists
    const [topTracks, topArtists] = await Promise.all([
      prisma.track.findMany({
        where: { visibility: 'PUBLIC' },
        select: { artist: true },
        orderBy: { playCount: 'desc' },
        take: 20
      }),
      prisma.track.findMany({
        where: { visibility: 'PUBLIC' },
        select: { title: true, artist: true },
        orderBy: { playCount: 'desc' },
        take: 10
      })
    ]);

    // Get unique artists sorted by frequency
    const artistCounts = new Map<string, number>();
    for (const track of topTracks) {
      artistCounts.set(track.artist, (artistCounts.get(track.artist) || 0) + 1);
    }

    const trendingArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    return {
      artists: trendingArtists,
      tracks: topTracks.slice(0, 10).map((t: any) => ({ title: t.title, artist: t.artist }))
    };
  });

  // Get genres for filter
  fastify.get('/genres', async (_request: FastifyRequest, reply: FastifyReply) => {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { tracks: true } } }
    });

    return { genres: genres.filter((g: any) => g._count.tracks > 0) };
  });
}

/**
 * Search Deezer API via backend proxy
 */
async function searchDeezer(query: string, limit: number) {
  const { searchDeezer: searchDeezerFn } = await import('../services/deezer.js');
  return searchDeezerFn(query, limit);
}