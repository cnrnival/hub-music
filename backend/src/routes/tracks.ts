/**
 * Hub Music - Track Routes
 * Rotas de faixas: listagem, reprodução, waveform, stream (APIs públicas)
 * Track routes: list, playback, waveform, stream (public APIs only)
 * 
 * @languages pt-BR / en-US
 *
 * Note: Upload de áudio local não suportado. Use apenas APIs públicas (Deezer, etc.).
 * Note: Local audio upload not supported. Use public APIs only (Deezer, etc.).
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

const trackQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  genreId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  source: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'playCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const createTrackSchema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  genreId: z.string().uuid().optional(),
  description: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC')
});

const updateTrackSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  artist: z.string().min(1).max(200).optional(),
  genreId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional()
});

export async function tracksRoutes(fastify: FastifyInstance) {
  // List tracks
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          genreId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] },
          source: { type: 'string' },
          sortBy: { type: 'string', enum: ['createdAt', 'title', 'playCount'], default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = trackQuerySchema.parse(request.query);
    const userId = (request as any).user?.id;
    const { page, limit, ...filters } = query;

    const where: any = {};

    if (filters.genreId) where.genreId = filters.genreId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.source) where.source = filters.source;

    // Visibility filter
    if (filters.visibility) {
      where.visibility = filters.visibility;
    } else {
      // Default: show public tracks + user's own private tracks
      where.OR = [
        { visibility: 'PUBLIC' },
        ...(userId ? [{ userId }] : [])
      ];
    }

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true }
          },
          genre: { select: { id: true, name: true, slug: true } },
          _count: { select: { likes: true, reposts: true, comments: true } }
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.track.count({ where })
    ]);

    return {
      tracks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  });

  // Get track by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;

    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, accountType: true }
        },
        genre: { select: { id: true, name: true, slug: true } },
        _count: { select: { likes: true, reposts: true, comments: true, playlistItems: true } }
      }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    // Check visibility
    if (track.visibility === 'PRIVATE' && track.userId !== userId) {
      throw new NotFoundError('Faixa não encontrada');
    }

    // Check if user liked/reposted
    let userLiked = false;
    let userReposted = false;

    if (userId) {
      const [like, repost] = await Promise.all([
        prisma.like.findUnique({ where: { userId_trackId: { userId, trackId: id } } }),
        prisma.repost.findUnique({ where: { userId_trackId: { userId, trackId: id } } })
      ]);
      userLiked = !!like;
      userReposted = !!repost;
    }

    // Generate signed URL for audio
    const { generateSignedUrl } = await import('../services/storage.js');
    const audioUrl = await generateSignedUrl(track.audioUrl);

    return {
      track: {
        ...track,
        audioUrl,
        userLiked,
        userReposted
      }
    };
  });

  // Get waveform data
  fastify.get('/:id/waveform', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;

    const track = await prisma.track.findUnique({
      where: { id },
      select: { waveformData: true, visibility: true, userId: true }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    if (track.visibility === 'PRIVATE' && track.userId !== userId) {
      throw new NotFoundError('Faixa não encontrada');
    }

    return { peaks: track.waveformData };
  });

  // Stream audio (with Range header support)
  fastify.get('/:id/stream', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;

    const track = await prisma.track.findUnique({
      where: { id },
      select: { audioUrl: true, visibility: true, userId: true }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    if (track.visibility === 'PRIVATE' && track.userId !== userId) {
      throw new NotFoundError('Faixa não encontrada');
    }

    // Streaming de áudio local não suportado — apenas APIs públicas
    reply.status(501).send({ error: 'Streaming de áudio local não suportado.' });
  });

  // Create track (upload)
  fastify.post('/', {
    schema: {
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        required: ['title', 'artist'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          artist: { type: 'string', minLength: 1, maxLength: 200 },
          genreId: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
          visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
          file: { type: 'string', format: 'binary' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Upload de áudio local não suportado — apenas APIs públicas
    reply.status(501).send({ error: 'Upload de áudio local não suportado. Use apenas APIs públicas.' });
  });

  // Update track
  fastify.patch('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;
    const body = updateTrackSchema.parse(request.body);

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    if (track.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para editar esta faixa');
    }

    const updated = await prisma.track.update({
      where: { id },
      data: body,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        genre: { select: { id: true, name: true, slug: true } }
      }
    });

    return { track: updated };
  });

  // Delete track
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    if (track.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para excluir esta faixa');
    }

    // Sem storage local — apenas remove do banco de dados
    await prisma.track.delete({ where: { id } });

    return { message: 'Faixa excluída com sucesso' };
  });
}