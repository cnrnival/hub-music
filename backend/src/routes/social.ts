/**
 * Hub Music - Social Routes
 * Rotas sociais: curtir, repostar, comentar, seguir usuários, feed
 * Social routes: like, repost, comment, follow users, feed
 * 
 * @languages pt-BR / en-US
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

const commentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(280)
});

const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

export async function socialRoutes(fastify: FastifyInstance) {
  // Like a track
  fastify.post('/tracks/:id/like', {
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
    if (!userId) throw new ValidationError('Usuário não autenticado');

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId: id } }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { userId_trackId: { userId, trackId: id } }
      });

      return { liked: false, message: 'Like removido' };
    } else {
      // Like
      await prisma.like.create({
        data: { userId, trackId: id }
      });

      return { liked: true, message: 'Faixa curtida' };
    }
  });

  // Get track likes
  fastify.get('/tracks/:id/likes', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = commentQuerySchema.parse(request.query);

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { trackId: id },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.like.count({ where: { trackId: id } })
    ]);

    return {
      likes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Check if user liked a track
  fastify.get('/tracks/:id/like/status', {
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

    if (!userId) {
      return { liked: false };
    }

    const like = await prisma.like.findUnique({
      where: { userId_trackId: { userId, trackId: id } }
    });

    return { liked: !!like };
  });

  // Repost a track
  fastify.post('/tracks/:id/repost', {
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
    if (!userId) throw new ValidationError('Usuário não autenticado');

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    const existingRepost = await prisma.repost.findUnique({
      where: { userId_trackId: { userId, trackId: id } }
    });

    if (existingRepost) {
      // Unrepost
      await prisma.repost.delete({
        where: { userId_trackId: { userId, trackId: id } }
      });

      return { reposted: false, message: 'Repost removido' };
    } else {
      // Repost
      await prisma.repost.create({
        data: { userId, trackId: id }
      });

      return { reposted: true, message: 'Faixa repostada' };
    }
  });

  // Get track reposts
  fastify.get('/tracks/:id/reposts', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = commentQuerySchema.parse(request.query);

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    const [reposts, total] = await Promise.all([
      prisma.repost.findMany({
        where: { trackId: id },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.repost.count({ where: { trackId: id } })
    ]);

    return {
      reposts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Check if user reposted a track
  fastify.get('/tracks/:id/repost/status', {
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

    if (!userId) {
      return { reposted: false };
    }

    const repost = await prisma.repost.findUnique({
      where: { userId_trackId: { userId, trackId: id } }
    });

    return { reposted: !!repost };
  });

  // Add comment to track
  fastify.post('/tracks/:id/comments', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: { content: { type: 'string', minLength: 1, maxLength: 280 } }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user?.id;
    if (!userId) throw new ValidationError('Usuário não autenticado');

    const { content } = createCommentSchema.parse(request.body);

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    const comment = await prisma.comment.create({
      data: { userId, trackId: id, content },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
      }
    });

    return reply.status(201).send({ comment });
  });

  // Get track comments
  fastify.get('/tracks/:id/comments', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = commentQuerySchema.parse(request.query);

    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      throw new NotFoundError('Faixa não encontrada');
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { trackId: id },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.comment.count({ where: { trackId: id } })
    ]);

    return {
      comments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Delete comment (author or track owner)
  fastify.delete('/comments/:commentId', {
    schema: {
      params: {
        type: 'object',
        properties: { commentId: { type: 'string', format: 'uuid' } },
        required: ['commentId']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { commentId } = request.params as { commentId: string };
    const userId = (request as any).user?.id;
    if (!userId) throw new ValidationError('Usuário não autenticado');

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { track: { select: { userId: true } } }
    });

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    // Check permissions: comment author or track owner
    if (comment.userId !== userId && comment.track.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para excluir este comentário');
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return { message: 'Comentário excluído com sucesso' };
  });

  // Follow a user
  fastify.post('/users/:id/follow', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: followedId } = request.params as { id: string };
    const followerId = (request as any).user?.id;
    if (!followerId) throw new ValidationError('Usuário não autenticado');

    if (followerId === followedId) {
      throw new ValidationError('Você não pode seguir a si mesmo');
    }

    const followedUser = await prisma.user.findUnique({
      where: { id: followedId }
    });

    if (!followedUser) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followedId: { followerId, followedId } }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { followerId_followedId: { followerId, followedId } }
      });

      return { following: false, message: 'Deixou de seguir' };
    } else {
      // Follow
      await prisma.follow.create({
        data: { followerId, followedId }
      });

      return { following: true, message: 'Agora você segue este usuário' };
    }
  });

  // Get user followers
  fastify.get('/users/:id/followers', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = userQuerySchema.parse(request.query);
    const currentUserId = (request as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followedId: id },
        include: {
          follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.follow.count({ where: { followedId: id } })
    ]);

    // Check if current user follows each follower
    let followingSet = new Set<string>();
    if (currentUserId) {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followedId: { in: followers.map((f: any) => f.follower.id) }
        },
        select: { followedId: true }
      });
      followingSet = new Set(follows.map((f: any) => f.followedId));
    }

    return {
      followers: followers.map((f: any) => ({
        ...f.follower,
        isFollowing: followingSet.has(f.follower.id)
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Get user following
  fastify.get('/users/:id/following', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = userQuerySchema.parse(request.query);
    const currentUserId = (request as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: id },
        include: {
          followed: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.follow.count({ where: { followerId: id } })
    ]);

    // Check if current user follows each
    let followingSet = new Set<string>();
    if (currentUserId) {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followedId: { in: following.map((f: any) => f.followed.id) }
        },
        select: { followedId: true }
      });
      followingSet = new Set(follows.map((f: any) => f.followedId));
    }

    return {
      following: following.map((f: any) => ({
        ...f.followed,
        isFollowing: followingSet.has(f.followed.id)
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Check if current user follows a user
  fastify.get('/users/:id/follow/status', {
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

    if (!userId) {
      return { following: false };
    }

    const follow = await prisma.follow.findUnique({
      where: { followerId_followedId: { followerId: userId, followedId: id } }
    });

    return { following: !!follow };
  });

  // Get feed (tracks from followed users + reposts)
  fastify.get('/feed', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page, limit } = commentQuerySchema.parse(request.query);
    const userId = (request as any).user?.id;

    if (!userId) {
      // Return popular tracks for non-authenticated users
      const [tracks, total] = await Promise.all([
        prisma.track.findMany({
          where: { visibility: 'PUBLIC' },
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            genre: { select: { id: true, name: true, slug: true } },
            _count: { select: { likes: true, reposts: true, comments: true } }
          },
          orderBy: { playCount: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.track.count({ where: { visibility: 'PUBLIC' } })
      ]);

      const { generateSignedUrl } = await import('../services/storage.js');
      const tracksWithUrls = await Promise.all(
        tracks.map(async (track: any) => ({
          ...track,
          audioUrl: await generateSignedUrl(track.audioUrl),
          userLiked: false,
          userReposted: false
        }))
      );

      return {
        tracks: tracksWithUrls,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      };
    }

    // Get followed user IDs
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followedId: true }
    });

    const followedIds = follows.map((f: any) => f.followedId);

    // Get reposted track IDs from followed users
    const reposts = await prisma.repost.findMany({
      where: { userId: { in: followedIds } },
      select: { trackId: true }
    });
    const repostedTrackIds = reposts.map((r: any) => r.trackId);

    // Get tracks from followed users + reposted tracks
    const where: any = {
      visibility: 'PUBLIC',
      OR: [
        { userId: { in: followedIds } },
        { id: { in: repostedTrackIds } }
      ]
    };

    // Exclude user's own tracks from feed (they're in profile)
    where.userId = { not: userId };

    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          genre: { select: { id: true, name: true, slug: true } },
          _count: { select: { likes: true, reposts: true, comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.track.count({ where })
    ]);

    // Get like/repost status for current user
    const trackIds = tracks.map((t: any) => t.id);
    const [userLikes, userReposts] = await Promise.all([
      prisma.like.findMany({
        where: { userId, trackId: { in: trackIds } },
        select: { trackId: true }
      }),
      prisma.repost.findMany({
        where: { userId, trackId: { in: trackIds } },
        select: { trackId: true }
      })
    ]);

    const likedSet = new Set(userLikes.map((l: any) => l.trackId));
    const repostedSet = new Set(userReposts.map((r: any) => r.trackId));

    const { generateSignedUrl } = await import('../services/storage.js');
    const tracksWithUrls = await Promise.all(
      tracks.map(async (track: any) => ({
        ...track,
        audioUrl: await generateSignedUrl(track.audioUrl),
        userLiked: likedSet.has(track.id),
        userReposted: repostedSet.has(track.id)
      }))
    );

    return {
      tracks: tracksWithUrls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Get user's liked tracks
  fastify.get('/users/:id/likes', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = commentQuerySchema.parse(request.query);
    const currentUserId = (request as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { userId: id },
        include: {
          track: {
            include: {
              user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
              genre: { select: { id: true, name: true, slug: true } },
              _count: { select: { likes: true, reposts: true, comments: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.like.count({ where: { userId: id } })
    ]);

    // Check if current user liked these tracks
    let likedSet = new Set<string>();
    if (currentUserId) {
      const trackIds = likes.map((l: any) => l.track.id);
      const userLikes = await prisma.like.findMany({
        where: { userId: currentUserId, trackId: { in: trackIds } },
        select: { trackId: true }
      });
      likedSet = new Set(userLikes.map((l: any) => l.trackId));
    }

    const { generateSignedUrl } = await import('../services/storage.js');
    const tracksWithUrls = await Promise.all(
      likes.map(async (like: any) => ({
        ...like.track,
        audioUrl: await generateSignedUrl(like.track.audioUrl),
        userLiked: likedSet.has(like.track.id),
        userReposted: false
      }))
    );

    return {
      tracks: tracksWithUrls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });

  // Get user's reposts
  fastify.get('/users/:id/reposts', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { page, limit } = commentQuerySchema.parse(request.query);
    const currentUserId = (request as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const [reposts, total] = await Promise.all([
      prisma.repost.findMany({
        where: { userId: id },
        include: {
          track: {
            include: {
              user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
              genre: { select: { id: true, name: true, slug: true } },
              _count: { select: { likes: true, reposts: true, comments: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.repost.count({ where: { userId: id } })
    ]);

    let repostedSet = new Set<string>();
    if (currentUserId) {
      const trackIds = reposts.map((r: any) => r.track.id);
      const userReposts = await prisma.repost.findMany({
        where: { userId: currentUserId, trackId: { in: trackIds } },
        select: { trackId: true }
      });
      repostedSet = new Set(userReposts.map((r: any) => r.trackId));
    }

    const { generateSignedUrl } = await import('../services/storage.js');
    const tracksWithUrls = await Promise.all(
      reposts.map(async (repost: any) => ({
        ...repost.track,
        audioUrl: await generateSignedUrl(repost.track.audioUrl),
        userLiked: false,
        userReposted: repostedSet.has(repost.track.id)
      }))
    );

    return {
      tracks: tracksWithUrls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  });
}