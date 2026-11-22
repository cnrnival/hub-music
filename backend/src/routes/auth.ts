/**
 * Hub Music - Auth Routes
 * Rotas de autenticação: cadastro, login, logout, refresh, perfil
 * Authentication routes: register, login, logout, refresh, profile
 * 
 * @languages pt-BR / en-US
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { prisma } from '../utils/prisma.js';
import { ConflictError, ValidationError } from '../utils/errors.js';

const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().max(100).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function authRoutes(fastify: FastifyInstance) {
  // Register / Cadastro
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          displayName: { type: 'string', maxLength: 100 }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                displayName: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, email, password, displayName } = registerSchema.parse(request.body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email já cadastrado');
      }
      throw new ConflictError('Nome de usuário já está em uso');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName: displayName || username
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { userId: user.id },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = fastify.jwt.sign(
      { userId: user.id },
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Set cookies
    reply.setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    });

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return reply.status(201).send({ user });
  });

  // Login
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ValidationError('Credenciais inválidas');
    }

    const validPassword = await verifyPassword(password, user.passwordHash);

    if (!validPassword) {
      throw new ValidationError('Credenciais inválidas');
    }

    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { userId: user.id },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = fastify.jwt.sign(
      { userId: user.id },
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Set cookies
    reply.setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60
    });

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        accountType: user.accountType
      }
    };
  });

  // Logout
  fastify.post('/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    reply.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return { message: 'Logout realizado com sucesso' };
  });

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw new ValidationError('Refresh token não fornecido');
    }

    try {
      const decoded = await fastify.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      } as any);

      // Generate new tokens (token rotation)
      const newAccessToken = fastify.jwt.sign(
        { userId: (decoded as any).userId },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const newRefreshToken = fastify.jwt.sign(
        { userId: (decoded as any).userId },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      reply.setCookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60
      });

      reply.setCookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      });

      return { message: 'Token renovado' };
    } catch (err) {
      throw new ValidationError('Refresh token inválido ou expirado');
    }
  });

  // Get current user
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user?.id;

    if (!userId) {
      throw new ValidationError('Usuário não autenticado');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        accountType: true,
        createdAt: true,
        _count: {
          select: {
            tracks: true,
            playlists: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      throw new ValidationError('Usuário não encontrado');
    }

    return { user };
  });
}