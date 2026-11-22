/**
 * Hub Music - Playlist Routes
 * Rotas de playlists: CRUD, adicionar/remover faixas, reordenação
 * Playlist routes: CRUD, add/remove tracks, reordering
 * 
 * @languages pt-BR / en-US
 *
 * Note: Não há upload de arquivos de áudio — faixas vêm de APIs públicas.
 * Note: No audio file upload — tracks come from public APIs.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

const playlistQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  userId: z.string().uuid().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional()
});

const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  coverUrl: z.string().url().optional().nullable()
});

const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  coverUrl: z.string().url().optional().nullable()
});

const addTrackSchema = z.object({
  trackId: z.string().uuid(),
  position: z.number().int().min(0).optional()
});

const reorderTracksSchema = z.object({
  trackIds: z.array(z.string().uuid()).min(1)
});

export async function playlistsRoutes(fastify: FastifyInstance) {
  // List playlists
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          userId: { type: 'string', format: 'uuid' },
          visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = playlistQuerySchema.parse(request.query);
    const userId = (request as any).user?.id;
    const { page, limit, ...filters } = query;

    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.visibility) {
      where.visibility = filters.visibility;
    } else {
      // Default: show public playlists + user's own private playlists
      where.OR = [
        { visibility: 'PUBLIC' },
        ...(userId ? [{ userId }] : [])
      ];
    }

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true }
          },
          tracks: {
            include: {
              track: {
                include: {
                  user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                  genre: { select: { id: true, name: true, slug: true } },
                  _count: { select: { likes: true, reposts: true, comments: true } }
                }
              }
            },
            orderBy: { position: 'asc' },
            take: 5 // Preview only
          },
          _count: { select: { tracks: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.playlist.count({ where })
    ]);

    return {
      playlists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  });

  // Get playlist by ID
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

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true }
        },
        tracks: {
          include: {
            track: {
              include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                genre: { select: { id: true, name: true, slug: true } },
                _count: { select: { likes: true, reposts: true, comments: true } }
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        _count: { select: { tracks: true } }
      }
    });

    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    // Check visibility
    if (playlist.visibility === 'PRIVATE' && playlist.userId !== userId) {
      throw new NotFoundError('Playlist não encontrada');
    }

    // Check if user liked (if we add likes to playlists later)
    let userLiked = false;
    if (userId) {
      // Could add playlist likes later
    }

    // Generate signed URLs for tracks
    const { generateSignedUrl } = await import('../services/storage.js');

    const tracksWithUrls = await Promise.all(
      playlist.tracks.map(async (pt: any) => {
        const audioUrl = await generateSignedUrl(pt.track.audioUrl);
        return {
          ...pt,
          track: {
            ...pt.track,
            audioUrl
          }
        };
      })
    );

    return {
      playlist: {
        ...playlist,
        tracks: tracksWithUrls,
        userLiked
      }
    };
  });

  // Create playlist
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
          coverUrl: { type: 'string', format: 'uri' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user?.id;
    if (!userId) throw new ValidationError('Usuário não autenticado');

    const body = createPlaylistSchema.parse(request.body);

    const playlist = await prisma.playlist.create({
      data: {
        ...body,
        userId
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
      }
    });

    return reply.status(201).send({ playlist });
  });

  // Update playlist
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
    const body = updatePlaylistSchema.parse(request.body);

    const playlist = await prisma.playlist.findUnique({
      where: { id }
    });

    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para editar esta playlist');
    }

    const updated = await prisma.playlist.update({
      where: { id },
      data: body,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
      }
    });

    return { playlist: updated };
  });

  // Delete playlist
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

    const playlist = await prisma.playlist.findUnique({
      where: { id }
    });

    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para excluir esta playlist');
    }

    await prisma.playlist.delete({ where: { id } });

    return { message: 'Playlist excluída com sucesso' };
  });

  // Add track to playlist
  fastify.post('/:id/tracks', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['trackId'],
        properties: {
          trackId: { type: 'string', format: 'uuid' },
          position: { type: 'number', minimum: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;
    const { trackId, position } = addTrackSchema.parse(request.body);

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { tracks: true }
    });

    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para modificar esta playlist');
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    // Check if track already in playlist
    const existing = await prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId: id, trackId } }
    });

    if (existing) {
      throw new ValidationError('Esta faixa já está na playlist');
    }

    // Determine position
    const maxPosition = playlist.tracks.length > 0
      ? Math.max(...playlist.tracks.map((t: any) => t.position))
      : -1;
    const newPosition = position ?? maxPosition + 1;

    // Shift existing tracks if inserting in middle
    if (position !== undefined && position <= maxPosition) {
      await prisma.playlistTrack.updateMany({
        where: {
          playlistId: id,
          position: { gte: position }
        },
        data: { position: { increment: 1 } }
      });
    }

    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId: id,
        trackId,
        position: newPosition
      },
      include: {
        track: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            genre: { select: { id: true, name: true, slug: true } }
          }
        }
      }
    });

    return reply.status(201).send({ playlistTrack });
  });

  // Remove track from playlist
  fastify.delete('/:id/tracks/:trackId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          trackId: { type: 'string', format: 'uuid' }
        },
        required: ['id', 'trackId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, trackId } = request.params as { id: string; trackId: string };
    const userId = (request as any).user?.id;

    const playlist = await prisma.playlist.findUnique({
      where: { id }
    });

    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para modificar esta playlist');
    }

    const playlistTrack = await prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId: id, trackId } }
    });

    if (!playlistTrack) {
      throw new NotFoundError('Faixa não encontrada na playlist');
    }

    const deletedPosition = playlistTrack.position;

    await prisma.playlistTrack.delete({
      where: { playlistId_trackId: { playlistId: id, trackId } }
    });

    // Shift remaining tracks
    await prisma.playlistTrack.updateMany({
      where: {
        playlistId: id,
        position: { gt: deletedPosition }
      },
      data: { position: { decrement: 1 } }
    });

    return { message: 'Faixa removida da playlist' };
  });

  // Reorder tracks (drag-drop)
  fastify.patch('/:id/tracks/reorder', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['trackIds'],
        properties: {
          trackIds: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;
    const { trackIds } = reorderTracksSchema.parse(request.body);

    const playlist = await prisma.playlist.findUnique({
      where: { id }
    });

    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para modificar esta playlist');
    }

    // Verify all tracks belong to this playlist
    const existingTracks = await prisma.playlistTrack.findMany({
      where: { playlistId: id },
      select: { trackId: true }
    });

    const existingTrackIds = new Set(existingTracks.map((t: any) => t.trackId));
    const allValid = trackIds.every(tid => existingTrackIds.has(tid));

    if (!allValid || trackIds.length !== existingTrackIds.size) {
      throw new ValidationError('Lista de faixas inválida');
    }

    // Update positions in a transaction
    await prisma.$transaction(
      trackIds.map((trackId, index) =>
        prisma.playlistTrack.update({
          where: { playlistId_trackId: { playlistId: id, trackId } },
          data: { position: index }
        })
      )
    );

    return { message: 'Playlist reordenada com sucesso' };
  });
}