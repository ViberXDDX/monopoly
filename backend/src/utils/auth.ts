import jwt from 'jsonwebtoken';
import { env } from './env';
import { logger } from './logger';

export interface JWTPayload {
  userId: string;
  username: string;
  isGuest: boolean;
  iat?: number;
  exp?: number;
}

export interface GuestUser {
  id: string;
  username: string;
  isGuest: true;
}

export class AuthService {
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: payload.isGuest ? env.GUEST_TOKEN_EXPIRES_IN : env.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      return payload;
    } catch (error) {
      logger.warn({ error, token: token.substring(0, 20) + '...' }, 'Invalid JWT token');
      throw new Error('Invalid token');
    }
  }

  static createGuestUser(): GuestUser {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const guestUsername = `Guest_${Math.random().toString(36).substring(2, 8)}`;

    return {
      id: guestId,
      username: guestUsername,
      isGuest: true,
    };
  }

  static generateGuestToken(): { token: string; user: GuestUser } {
    const guestUser = this.createGuestUser();
    const token = this.generateToken({
      userId: guestUser.id,
      username: guestUser.username,
      isGuest: true,
    });

    return { token, user: guestUser };
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  static isTokenExpired(payload: JWTPayload): boolean {
    if (!payload.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000;
  }

  static refreshToken(payload: JWTPayload): string {
    return this.generateToken({
      userId: payload.userId,
      username: payload.username,
      isGuest: payload.isGuest,
    });
  }
}
