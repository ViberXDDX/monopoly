import { prisma } from '../client';
import { Game, Player, Property, Tile, GameLog, Trade, GameStatus, Prisma } from '@prisma/client';
import { logger } from '../../utils/logger';

export interface GameWithDetails extends Game {
  players: Player[];
  tiles: Tile[];
  properties: Property[];
  logs: GameLog[];
  trades: Trade[];
}

export class GameRepository {
  async create(data: {
    code: string;
    settings: any;
    players: Array<{
      userId?: string;
      name: string;
      cash: number;
      order: number;
      color: string;
    }>;
  }): Promise<GameWithDetails> {
    return prisma.game.create({
      data: {
        code: data.code,
        settings: data.settings,
        players: {
          create: data.players,
        },
      },
      include: {
        players: true,
        tiles: true,
        properties: true,
        logs: true,
        trades: true,
      },
    });
  }

  async findById(id: string): Promise<GameWithDetails | null> {
    return prisma.game.findUnique({
      where: { id },
      include: {
        players: true,
        tiles: true,
        properties: true,
        logs: true,
        trades: true,
      },
    });
  }

  async findByCode(code: string): Promise<GameWithDetails | null> {
    return prisma.game.findUnique({
      where: { code },
      include: {
        players: true,
        tiles: true,
        properties: true,
        logs: true,
        trades: true,
      },
    });
  }

  async update(id: string, data: Partial<Game>): Promise<GameWithDetails> {
    return prisma.game.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        players: true,
        tiles: true,
        properties: true,
        logs: true,
        trades: true,
      },
    });
  }

  async updateWithOptimisticLocking(
    id: string,
    data: Partial<Game>,
    expectedVersion: number
  ): Promise<GameWithDetails> {
    try {
      return prisma.game.update({
        where: {
          id,
          version: expectedVersion,
        },
        data: {
          ...data,
          version: { increment: 1 },
          updatedAt: new Date(),
        },
        include: {
          players: true,
          tiles: true,
          properties: true,
          logs: true,
          trades: true,
        },
      });
    } catch (error) {
      logger.warn({ error, gameId: id, expectedVersion }, 'Optimistic locking failed');
      throw new Error('Game state has been modified by another player');
    }
  }

  async addPlayer(gameId: string, playerData: {
    userId?: string;
    name: string;
    cash: number;
    order: number;
    color: string;
  }): Promise<Player> {
    return prisma.player.create({
      data: {
        gameId,
        ...playerData,
      },
    });
  }

  async updatePlayer(playerId: string, data: Partial<Player>): Promise<Player> {
    return prisma.player.update({
      where: { id: playerId },
      data,
    });
  }

  async updatePlayers(updates: Array<{ id: string; data: Partial<Player> }>): Promise<Player[]> {
    const transactions = updates.map(({ id, data }) =>
      prisma.player.update({
        where: { id },
        data,
      })
    );

    return prisma.$transaction(transactions);
  }

  async addProperty(gameId: string, propertyData: {
    tileId: string;
    ownerId?: string;
    mortgaged?: boolean;
    houses?: number;
    hotel?: boolean;
  }): Promise<Property> {
    return prisma.property.create({
      data: {
        gameId,
        ...propertyData,
      },
    });
  }

  async updateProperty(propertyId: string, data: Partial<Property>): Promise<Property> {
    return prisma.property.update({
      where: { id: propertyId },
      data,
    });
  }

  async updateProperties(updates: Array<{ id: string; data: Partial<Property> }>): Promise<Property[]> {
    const transactions = updates.map(({ id, data }) =>
      prisma.property.update({
        where: { id },
        data,
      })
    );

    return prisma.$transaction(transactions);
  }

  async addTile(gameId: string, tileData: {
    index: number;
    type: string;
    name: string;
    color?: string;
    price?: number;
    baseRent?: number;
    groupKey?: string;
    railroadGroup?: string;
    utilityGroup?: string;
  }): Promise<Tile> {
    return prisma.tile.create({
      data: {
        gameId,
        ...tileData,
      },
    });
  }

  async addTiles(gameId: string, tilesData: Array<{
    index: number;
    type: string;
    name: string;
    color?: string;
    price?: number;
    baseRent?: number;
    groupKey?: string;
    railroadGroup?: string;
    utilityGroup?: string;
  }>): Promise<Tile[]> {
    const transactions = tilesData.map(tileData =>
      prisma.tile.create({
        data: {
          gameId,
          ...tileData,
        },
      })
    );

    return prisma.$transaction(transactions);
  }

  async addLog(gameId: string, logData: {
    actorId?: string;
    type: string;
    payload: any;
  }): Promise<GameLog> {
    return prisma.gameLog.create({
      data: {
        gameId,
        ...logData,
      },
    });
  }

  async addLogs(gameId: string, logsData: Array<{
    actorId?: string;
    type: string;
    payload: any;
  }>): Promise<GameLog[]> {
    const transactions = logsData.map(logData =>
      prisma.gameLog.create({
        data: {
          gameId,
          ...logData,
        },
      })
    );

    return prisma.$transaction(transactions);
  }

  async createTrade(tradeData: {
    gameId: string;
    fromId: string;
    toId: string;
    cashFrom: number;
    cashTo: number;
    fromPropertyIds: string[];
    toPropertyIds: string[];
  }): Promise<Trade> {
    return prisma.trade.create({
      data: tradeData,
    });
  }

  async updateTrade(tradeId: string, data: Partial<Trade>): Promise<Trade> {
    return prisma.trade.update({
      where: { id: tradeId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async findTradeById(tradeId: string): Promise<Trade | null> {
    return prisma.trade.findUnique({
      where: { id: tradeId },
    });
  }

  async findTradesByGame(gameId: string): Promise<Trade[]> {
    return prisma.trade.findMany({
      where: { gameId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteGame(id: string): Promise<void> {
    await prisma.game.delete({
      where: { id },
    });
  }

  async findActiveGames(): Promise<Game[]> {
    return prisma.game.findMany({
      where: {
        status: {
          in: [GameStatus.LOBBY, GameStatus.RUNNING, GameStatus.PAUSED],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findGamesByUser(userId: string): Promise<Game[]> {
    return prisma.game.findMany({
      where: {
        players: {
          some: {
            userId,
          },
        },
      },
      include: {
        players: {
          where: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async generateUniqueGameCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique game code');
      }
    } while (await this.findByCode(code));

    return code;
  }
}
