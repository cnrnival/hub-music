/**
 * Hub Music - Prisma Client
 * Cliente Prisma singleton: conexão com PostgreSQL, reutilização em dev
 * Prisma Client singleton: PostgreSQL connection, dev reuse
 * 
 * @languages pt-BR / en-US
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;