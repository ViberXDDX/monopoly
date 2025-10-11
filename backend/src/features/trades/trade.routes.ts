import { FastifyInstance } from 'fastify';
import { TradeController } from './trade.controller';

export async function tradeRoutes(fastify: FastifyInstance) {
  // POST /games/:id/trade - Create trade
  fastify.post('/:id/trade', {
    schema: {
      description: 'Create a trade proposal',
      tags: ['trades'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['toPlayerId', 'cashFrom', 'cashTo'],
        properties: {
          toPlayerId: { type: 'string' },
          cashFrom: { type: 'number', minimum: 0 },
          cashTo: { type: 'number', minimum: 0 },
          fromPropertyIds: { type: 'array', items: { type: 'string' }, default: [] },
          toPropertyIds: { type: 'array', items: { type: 'string' }, default: [] },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            trade: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                fromId: { type: 'string' },
                toId: { type: 'string' },
                status: { type: 'string' },
                cashFrom: { type: 'number' },
                cashTo: { type: 'number' },
                fromPropertyIds: { type: 'array', items: { type: 'string' } },
                toPropertyIds: { type: 'array', items: { type: 'string' } },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, TradeController.createTrade);

  // POST /trades/:id/respond - Respond to trade
  fastify.post('/:id/respond', {
    schema: {
      description: 'Respond to a trade proposal',
      tags: ['trades'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['accept', 'reject'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            trade: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, TradeController.respondToTrade);
}
