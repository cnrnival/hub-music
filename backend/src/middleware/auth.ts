/**
 * Hub Music - Auth Middleware
 * Middleware de autenticação: verificação de JWT, rotação de token
 * Authentication middleware: JWT verification, token rotation
 *
 * @languages pt-BR / en-US
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Try to get token from cookie first
    const accessToken = request.cookies.accessToken;

    if (!accessToken) {
      // Check Authorization header
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        // Verify token manually using the default JWT instance
        const decoded = await request.server.jwt.verify<{ userId: string }>(token);
        (request as any).user = { id: decoded.userId };
      } else {
        throw new UnauthorizedError('Token de acesso não fornecido');
      }
    } else {
      // Use the built-in jwtVerify which reads from cookie
      await request.jwtVerify<{ userId: string }>();
    }
  } catch (err) {
    // Check if it's a token expiration
    if (err instanceof Error && (
      err.message.includes('expired') ||
      err.message.includes('jwt expired') ||
      err.message.includes('JWT expired')
    )) {
      // Try to refresh token
      const refreshToken = request.cookies.refreshToken;
      if (refreshToken) {
        try {
          // Use the second JWT instance for refresh token (accessToken is default)
          const decoded = await request.server.jwt.verify<{ userId: string }>(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET
          } as any);

          // Generate new access token
          const newAccessToken = request.server.jwt.sign(
            { userId: (decoded as any).userId },
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
          );

          // Set new access token cookie
          reply.setCookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 // 15 minutes
          });

          // Attach user to request
          (request as any).user = { id: (decoded as any).userId };
          return;
        } catch (refreshErr) {
          throw new UnauthorizedError('Sessão expirada, faça login novamente');
        }
      }
      throw new UnauthorizedError('Token expirado');
    }

    if (err instanceof Error && err.message.includes('invalid')) {
      throw new UnauthorizedError('Token inválido');
    }

    throw err;
  }
}

export function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const accessToken = request.cookies.accessToken;

  if (accessToken) {
    request.jwtVerify<{ userId: string }>().catch(() => {
      // Ignore invalid token for optional auth
    });
  }

  done();
}