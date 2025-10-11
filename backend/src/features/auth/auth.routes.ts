import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { z } from 'zod';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/guest - Create guest user
  fastify.post('/guest', {
    schema: {
      description: 'Create a guest user account',
      tags: ['auth'],
      response: {
        201: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                isGuest: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, AuthController.createGuest);

  // POST /auth/verify - Verify token
  fastify.post('/verify', {
    schema: {
      description: 'Verify JWT token',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                isGuest: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, AuthController.verifyToken);

  // POST /auth/refresh - Refresh token
  fastify.post('/refresh', {
    schema: {
      description: 'Refresh JWT token',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                isGuest: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, AuthController.refreshToken);
}
