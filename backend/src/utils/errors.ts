/**
 * Hub Music - Error Utils
 * Utilitários de erro: classes customizadas, handler global, mensagens em português
 * Error utils: custom error classes, global handler, Portuguese messages
 * 
 * @languages pt-BR / en-US
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflito de dados') {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Muitas requisições') {
    super(429, message, 'TOO_MANY_REQUESTS');
    this.name = 'TooManyRequestsError';
  }
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error({ err: error }, 'Error occurred');

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'campo';
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: `${field} já está em uso`,
        code: 'DUPLICATE_FIELD'
      });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Recurso não encontrado',
        code: 'NOT_FOUND'
      });
    }
  }

  // Custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      code: error.code,
      details: error.details
    });
  }

  // Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      details: error.validation
    });
  }

  // Rate limit
  if (error.statusCode === 429) {
    return reply.status(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Muitas requisições, tente novamente mais tarde',
      code: 'TOO_MANY_REQUESTS'
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    statusCode,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : error.message,
    code: 'INTERNAL_ERROR'
  });
}