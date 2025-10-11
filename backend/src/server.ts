import Fastify from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env } from './utils/env';
import { logger } from './utils/logger';
import { createErrorHandler } from './utils/errors';
import { prisma } from './db/client';

// Import routes
import { authRoutes } from './features/auth/auth.routes';
import { gameRoutes } from './features/games/game.routes';
import { tradeRoutes } from './features/trades/trade.routes';

// Import socket handler
import { SocketHandler } from './adapters/socket/socket.handler';

async function buildServer() {
  const fastify = Fastify({
    logger: logger,
    trustProxy: true,
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    errorResponseBuilder: (request, context) => ({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        retryAfter: Math.round(context.ttl / 1000),
      },
    }),
  });

  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Monopoly Backend API',
        description: 'Production-grade backend for Monopoly-like board game',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(gameRoutes, { prefix: '/api/v1/games' });
  await fastify.register(tradeRoutes, { prefix: '/api/v1/trades' });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      };
    }
  });

  // Root endpoint
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Monopoly Backend API',
      version: '1.0.0',
      docs: '/docs',
      health: '/health',
    };
  });

  // Set error handler
  fastify.setErrorHandler(createErrorHandler());

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();
    const httpServer = createServer(fastify);

    // Initialize Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
      pingTimeout: env.SOCKET_HEARTBEAT_TIMEOUT,
      pingInterval: env.SOCKET_HEARTBEAT_INTERVAL,
    });

    // Initialize socket handler
    const socketHandler = new SocketHandler(io);
    io.on('connection', (socket) => {
      socketHandler.handleConnection(socket);
    });

    // Start server
    const address = await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`🚀 Server listening on ${address}`);
    logger.info(`📚 API Documentation available at ${address}/docs`);
    logger.info(`🔍 Health check available at ${address}/health`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        await fastify.close();
        await prisma.$disconnect();
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
