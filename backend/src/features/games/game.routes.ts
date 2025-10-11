import { FastifyInstance } from 'fastify';
import { GameController } from './game.controller';
import { z } from 'zod';

export async function gameRoutes(fastify: FastifyInstance) {
  // POST /games - Create new game
  fastify.post('/', {
    schema: {
      description: 'Create a new game',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'color'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            game: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                code: { type: 'string' },
                status: { type: 'string' },
                currentTurn: { type: 'number' },
                settings: { type: 'object' },
                version: { type: 'number' },
              },
            },
            joinCode: { type: 'string' },
          },
        },
      },
    },
  }, GameController.createGame);

  // POST /games/:id/join - Join existing game
  fastify.post('/:id/join', {
    schema: {
      description: 'Join an existing game',
      tags: ['games'],
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
        required: ['name', 'color'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            player: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                cash: { type: 'number' },
                position: { type: 'number' },
                order: { type: 'number' },
                color: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, GameController.joinGame);

  // POST /games/:id/start - Start game
  fastify.post('/:id/start', {
    schema: {
      description: 'Start a game',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            game: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                currentTurn: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, GameController.startGame);

  // GET /games/:id/state - Get game state
  fastify.get('/:id/state', {
    schema: {
      description: 'Get current game state',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            game: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                code: { type: 'string' },
                status: { type: 'string' },
                currentTurn: { type: 'number' },
                settings: { type: 'object' },
                version: { type: 'number' },
              },
            },
            players: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  cash: { type: 'number' },
                  position: { type: 'number' },
                  inJail: { type: 'boolean' },
                  jailTurns: { type: 'number' },
                  doublesInRow: { type: 'number' },
                  bankrupt: { type: 'boolean' },
                  order: { type: 'number' },
                  color: { type: 'string' },
                  isConnected: { type: 'boolean' },
                },
              },
            },
            tiles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  index: { type: 'number' },
                  type: { type: 'string' },
                  name: { type: 'string' },
                  color: { type: 'string' },
                  price: { type: 'number' },
                  baseRent: { type: 'number' },
                  groupKey: { type: 'string' },
                  railroadGroup: { type: 'string' },
                  utilityGroup: { type: 'string' },
                },
              },
            },
            properties: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  tileId: { type: 'string' },
                  ownerId: { type: 'string' },
                  mortgaged: { type: 'boolean' },
                  houses: { type: 'number' },
                  hotel: { type: 'boolean' },
                },
              },
            },
            logs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  ts: { type: 'string' },
                  actorId: { type: 'string' },
                  type: { type: 'string' },
                  payload: { type: 'object' },
                },
              },
            },
            trades: {
              type: 'array',
              items: {
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
                },
              },
            },
          },
        },
      },
    },
  }, GameController.getGameState);

  // POST /games/:id/pause - Pause game
  fastify.post('/:id/pause', {
    schema: {
      description: 'Pause a running game',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, GameController.pauseGame);

  // POST /games/:id/resume - Resume game
  fastify.post('/:id/resume', {
    schema: {
      description: 'Resume a paused game',
      tags: ['games'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, GameController.resumeGame);
}
