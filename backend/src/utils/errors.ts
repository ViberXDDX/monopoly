import { FastifyError } from 'fastify';
import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class GameError extends AppError {
  constructor(message: string) {
    super(message, 400, 'GAME_ERROR');
    this.name = 'GameError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export function createErrorHandler() {
  return (error: FastifyError, request: any, reply: any) => {
    const { method, url } = request;
    const { statusCode, message, code } = error;

    // Log error
    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      },
      request: {
        method,
        url,
        headers: request.headers,
        body: request.body,
      },
    }, 'Request error');

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment ? message : 'Internal server error';

    // Send error response
    reply.status(statusCode || 500).send({
      error: {
        code: code || 'INTERNAL_ERROR',
        message: errorMessage,
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  };
}

export function handleAsyncErrors(fn: Function) {
  return (request: any, reply: any) => {
    Promise.resolve(fn(request, reply)).catch((error) => {
      if (error instanceof AppError) {
        reply.status(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      } else {
        logger.error({ error }, 'Unhandled error');
        reply.status(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        });
      }
    });
  };
}
