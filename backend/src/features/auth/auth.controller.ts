import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

export class AuthController {
  static async createGuest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token, user } = AuthService.generateGuestToken();

      logger.info({ userId: user.id, username: user.username }, 'Guest user created');

      return reply.status(201).send({
        token,
        user: {
          id: user.id,
          username: user.username,
          isGuest: user.isGuest,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to create guest user');
      throw new AppError('Failed to create guest user', 500);
    }
  }

  static async verifyToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('No token provided', 401);
      }

      const payload = AuthService.verifyToken(token);

      return reply.status(200).send({
        valid: true,
        user: {
          id: payload.userId,
          username: payload.username,
          isGuest: payload.isGuest,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ error }, 'Token verification failed');
      throw new AppError('Invalid token', 401);
    }
  }

  static async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('No token provided', 401);
      }

      const payload = AuthService.verifyToken(token);
      const newToken = AuthService.refreshToken(payload);

      return reply.status(200).send({
        token: newToken,
        user: {
          id: payload.userId,
          username: payload.username,
          isGuest: payload.isGuest,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ error }, 'Token refresh failed');
      throw new AppError('Invalid token', 401);
    }
  }
}
