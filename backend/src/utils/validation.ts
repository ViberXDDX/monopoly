import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';

export const createGameSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});

export const joinGameSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});

export const tradeCreateSchema = z.object({
  toPlayerId: z.string().min(1),
  cashFrom: z.number().min(0),
  cashTo: z.number().min(0),
  fromPropertyIds: z.array(z.string()).default([]),
  toPropertyIds: z.array(z.string()).default([]),
});

export const tradeRespondSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export const buildSchema = z.object({
  tileId: z.string().min(1),
  action: z.enum(['house', 'hotel', 'sell']),
});

export const mortgageSchema = z.object({
  tileId: z.string().min(1),
  action: z.enum(['mortgage', 'unmortgage']),
});

export const bidSchema = z.object({
  amount: z.number().min(1),
});

export const useCardSchema = z.object({
  cardId: z.string().min(1),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(500),
});

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.errors,
          },
        });
        return;
      }
      throw error;
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: error.errors,
          },
        });
        return;
      }
      throw error;
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors,
          },
        });
        return;
      }
      throw error;
    }
  };
}
