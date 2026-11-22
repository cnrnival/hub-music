/**
 * Hub Music - Backend API
 * Platforma de streaming e compartilhamento de áudio open source
 * Open source music streaming and sharing platform
 * 
 * @languages pt-BR / en-US
 */

import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { authRoutes } from './routes/auth.js';
import { tracksRoutes } from './routes/tracks.js';
import { playlistsRoutes } from './routes/playlists.js';
import { socialRoutes } from './routes/social.js';
import { searchRoutes } from './routes/search.js';
import { publicApiRoutes } from './routes/public-apis/index.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './utils/errors.js';
import { prisma } from './utils/prisma.js';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

async function setupPlugins() {
  // CORS - allow configured frontend + known Vercel domain + localhost
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://hub-music.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });

  // Cookies
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-production',
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  });

  // JWT (access token)
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production-at-least-32-chars-long',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    },
    cookie: {
      cookieName: 'accessToken',
      signed: false
    }
  });

  // Refresh token JWT (named instance)
  await app.register(jwt, {
    secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production-at-least-32-chars-long',
    sign: {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    cookie: {
      cookieName: 'refreshToken',
      signed: false
    },
    namespace: 'refreshToken'
  });

  // Multipart for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 1
    }
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip
  });

  // Swagger/OpenAPI
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Hub Music API',
        description: 'Open source music streaming platform API',
        version: '1.0.0'
      },
      servers: [
        { url: process.env.API_URL || 'http://localhost:3000', description: 'Server' }
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'accessToken'
          }
        }
      },
      security: [{ cookieAuth: [] }]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });
}

async function setupRoutes() {
  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected'
    }
  }));

  // API routes with prefix
  await app.register(async function (fastify) {
    // Public routes
    fastify.register(authRoutes, { prefix: '/auth' });
    fastify.register(searchRoutes, { prefix: '/search' });
    fastify.register(publicApiRoutes, { prefix: '/api' });

    // Protected routes
    fastify.addHook('onRequest', authMiddleware);
    fastify.register(tracksRoutes, { prefix: '/tracks' });
    fastify.register(playlistsRoutes, { prefix: '/playlists' });
    fastify.register(socialRoutes, { prefix: '' });
  }, { prefix: '/api' });
}

async function start() {
  try {
    await setupPlugins();
    await setupRoutes();

    // Error handler
    app.setErrorHandler(errorHandler);

    // Connect to database
    await prisma.$connect();
    app.log.info('Database connected');

    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server running on port ${port}`);
    app.log.info(`API docs available at http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  app.log.info('Shutting down...');
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  app.log.info('Shutting down...');
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
});

start();

export { app };