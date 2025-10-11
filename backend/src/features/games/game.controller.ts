import { FastifyRequest, FastifyReply } from 'fastify';
import { GameRepository } from '../../db/repositories/game.repository';
import { AuthService } from '../../utils/auth';
import { GameEngine } from '../../core/engine';
import { logger } from '../../utils/logger';
import { AppError, NotFoundError, ConflictError, GameError } from '../../utils/errors';
import { env } from '../../utils/env';
import { Board } from '../../core/board';

export class GameController {
  private static gameRepository = new GameRepository();
  private static gameEngine = new GameEngine();
  private static board = Board.getInstance();

  static async createGame(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { name, color } = request.body as { name: string; color: string };

      // Generate unique game code
      const code = await this.gameRepository.generateUniqueGameCode();

      // Create game with initial player
      const game = await this.gameRepository.create({
        code,
        settings: {
          startingCash: env.DEFAULT_STARTING_CASH,
          houseLimit: env.DEFAULT_HOUSE_LIMIT,
          hotelLimit: env.DEFAULT_HOTEL_LIMIT,
          freeParkingRule: 'taxes',
          auctionOnNoBuy: true,
          jailFine: 50,
          mortgageInterest: 0.1,
        },
        players: [{
          userId: payload.isGuest ? undefined : payload.userId,
          name,
          cash: env.DEFAULT_STARTING_CASH,
          order: 0,
          color,
        }],
      });

      // Initialize board tiles
      const tiles = this.board.getAllTiles();
      await this.gameRepository.addTiles(game.id, tiles.map(tile => ({
        index: tile.index,
        type: tile.type,
        name: tile.name,
        color: tile.color,
        price: tile.price,
        baseRent: tile.baseRent,
        groupKey: tile.groupKey,
        railroadGroup: tile.railroadGroup,
        utilityGroup: tile.utilityGroup,
      })));

      // Initialize properties
      const properties = tiles
        .filter(tile => ['PROPERTY', 'RAILROAD', 'UTILITY'].includes(tile.type))
        .map(tile => ({
          tileId: tile.index.toString(),
          ownerId: undefined,
          mortgaged: false,
          houses: 0,
          hotel: false,
        }));

      for (const property of properties) {
        await this.gameRepository.addProperty(game.id, property);
      }

      logger.info({ gameId: game.id, code, playerName: name }, 'Game created');

      return reply.status(201).send({
        game: {
          id: game.id,
          code: game.code,
          status: game.status,
          currentTurn: game.currentTurn,
          settings: game.settings,
          version: game.version,
        },
        joinCode: game.code,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to create game');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create game', 500);
    }
  }

  static async joinGame(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };
      const { name, color } = request.body as { name: string; color: string };

      const game = await this.gameRepository.findById(id);
      if (!game) {
        throw new NotFoundError('Game');
      }

      if (game.status !== 'LOBBY') {
        throw new ConflictError('Game has already started');
      }

      if (game.players.length >= 8) {
        throw new ConflictError('Game is full');
      }

      // Check if name is already taken
      const nameExists = game.players.some(p => p.name === name);
      if (nameExists) {
        throw new ConflictError('Name already taken');
      }

      // Check if color is already taken
      const colorExists = game.players.some(p => p.color === color);
      if (colorExists) {
        throw new ConflictError('Color already taken');
      }

      // Add player to game
      const player = await this.gameRepository.addPlayer(game.id, {
        userId: payload.isGuest ? undefined : payload.userId,
        name,
        cash: env.DEFAULT_STARTING_CASH,
        order: game.players.length,
        color,
      });

      logger.info({ gameId: game.id, playerName: name }, 'Player joined game');

      return reply.status(201).send({
        player: {
          id: player.id,
          name: player.name,
          cash: player.cash,
          position: player.position,
          order: player.order,
          color: player.color,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to join game');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to join game', 500);
    }
  }

  static async startGame(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };

      const game = await this.gameRepository.findById(id);
      if (!game) {
        throw new NotFoundError('Game');
      }

      if (game.status !== 'LOBBY') {
        throw new ConflictError('Game has already started');
      }

      if (game.players.length < 2) {
        throw new ConflictError('Need at least 2 players to start');
      }

      // Check if requesting player is in the game
      const player = game.players.find(p =>
        payload.isGuest ? p.name === payload.username : p.userId === payload.userId
      );

      if (!player) {
        throw new AppError('You are not in this game', 403);
      }

      // Start the game using the engine
      const gameState = {
        id: game.id,
        status: game.status,
        currentTurn: game.currentTurn,
        players: game.players.map(p => ({
          id: p.id,
          userId: p.userId,
          name: p.name,
          cash: p.cash,
          position: p.position,
          inJail: p.inJail,
          jailTurns: p.jailTurns,
          doublesInRow: p.doublesInRow,
          bankrupt: p.bankrupt,
          order: p.order,
          color: p.color,
          isConnected: p.isConnected,
          getOutOfJailCards: 0, // TODO: Implement get out of jail cards
        })),
        tiles: game.tiles,
        properties: game.properties.map(p => ({
          id: p.id,
          tileId: p.tileId,
          ownerId: p.ownerId,
          mortgaged: p.mortgaged,
          houses: p.houses,
          hotel: p.hotel,
        })),
        settings: game.settings as any,
        version: game.version,
        freeParkingPot: 0,
        chanceDeck: [],
        chestDeck: [],
        chanceDiscard: [],
        chestDiscard: [],
      };

      const patches = this.gameEngine.startGame(game.id, gameState.players, gameState.settings);

      // Apply patches to database
      await this.applyPatches(game.id, patches);

      // Update game status
      await this.gameRepository.update(game.id, { status: 'RUNNING' });

      logger.info({ gameId: game.id }, 'Game started');

      return reply.status(200).send({
        message: 'Game started successfully',
        game: {
          id: game.id,
          status: 'RUNNING',
          currentTurn: game.currentTurn,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to start game');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to start game', 500);
    }
  }

  static async getGameState(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };

      const game = await this.gameRepository.findById(id);
      if (!game) {
        throw new NotFoundError('Game');
      }

      // Check if requesting player is in the game
      const player = game.players.find(p =>
        payload.isGuest ? p.name === payload.username : p.userId === payload.userId
      );

      if (!player) {
        throw new AppError('You are not in this game', 403);
      }

      // Return sanitized game state
      return reply.status(200).send({
        game: {
          id: game.id,
          code: game.code,
          status: game.status,
          currentTurn: game.currentTurn,
          settings: game.settings,
          version: game.version,
        },
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          cash: p.cash,
          position: p.position,
          inJail: p.inJail,
          jailTurns: p.jailTurns,
          doublesInRow: p.doublesInRow,
          bankrupt: p.bankrupt,
          order: p.order,
          color: p.color,
          isConnected: p.isConnected,
        })),
        tiles: game.tiles,
        properties: game.properties,
        logs: game.logs.slice(-50), // Last 50 logs
        trades: game.trades.filter(t => t.status === 'PENDING'),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get game state');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get game state', 500);
    }
  }

  static async pauseGame(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };

      const game = await this.gameRepository.findById(id);
      if (!game) {
        throw new NotFoundError('Game');
      }

      if (game.status !== 'RUNNING') {
        throw new ConflictError('Game is not running');
      }

      // Check if requesting player is in the game
      const player = game.players.find(p =>
        payload.isGuest ? p.name === payload.username : p.userId === payload.userId
      );

      if (!player) {
        throw new AppError('You are not in this game', 403);
      }

      await this.gameRepository.update(game.id, { status: 'PAUSED' });

      logger.info({ gameId: game.id }, 'Game paused');

      return reply.status(200).send({
        message: 'Game paused successfully',
      });
    } catch (error) {
      logger.error({ error }, 'Failed to pause game');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to pause game', 500);
    }
  }

  static async resumeGame(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };

      const game = await this.gameRepository.findById(id);
      if (!game) {
        throw new NotFoundError('Game');
      }

      if (game.status !== 'PAUSED') {
        throw new ConflictError('Game is not paused');
      }

      // Check if requesting player is in the game
      const player = game.players.find(p =>
        payload.isGuest ? p.name === payload.username : p.userId === payload.userId
      );

      if (!player) {
        throw new AppError('You are not in this game', 403);
      }

      await this.gameRepository.update(game.id, { status: 'RUNNING' });

      logger.info({ gameId: game.id }, 'Game resumed');

      return reply.status(200).send({
        message: 'Game resumed successfully',
      });
    } catch (error) {
      logger.error({ error }, 'Failed to resume game');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to resume game', 500);
    }
  }

  private static async applyPatches(gameId: string, patches: any[]): Promise<void> {
    for (const patch of patches) {
      switch (patch.type) {
        case 'player_update':
          if (patch.playerId && patch.data) {
            await this.gameRepository.updatePlayer(patch.playerId, patch.data);
          }
          break;
        case 'property_update':
          if (patch.propertyId && patch.data) {
            await this.gameRepository.updateProperty(patch.propertyId, patch.data);
          }
          break;
        case 'game_update':
          if (patch.data) {
            await this.gameRepository.update(gameId, patch.data);
          }
          break;
        case 'log_add':
          if (patch.data) {
            await this.gameRepository.addLog(gameId, patch.data);
          }
          break;
      }
    }
  }
}
