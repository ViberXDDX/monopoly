import { Server as SocketIOServer } from 'socket.io';
import { GameRepository } from '../../db/repositories/game.repository';
import { AuthService } from '../../utils/auth';
import { GameEngine } from '../../core/engine';
import { logger } from '../../utils/logger';
import { AppError, NotFoundError, GameError } from '../../utils/errors';
import { z } from 'zod';

export class SocketHandler {
  private gameRepository: GameRepository;
  private gameEngine: GameEngine;
  private connectedPlayers: Map<string, string> = new Map(); // socketId -> playerId

  constructor(private io: SocketIOServer) {
    this.gameRepository = new GameRepository();
    this.gameEngine = new GameEngine();
  }

  async handleConnection(socket: any) {
    logger.info({ socketId: socket.id }, 'Socket connected');

    socket.on('join_room', async (data: any) => {
      try {
        const { gameId, token } = this.validateJoinRoom(data);
        const payload = AuthService.verifyToken(token);

        const game = await this.gameRepository.findById(gameId);
        if (!game) {
          socket.emit('error', { code: 'GAME_NOT_FOUND', message: 'Game not found' });
          return;
        }

        // Find player in game
        const player = game.players.find(p =>
          payload.isGuest ? p.name === payload.username : p.userId === payload.userId
        );

        if (!player) {
          socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'You are not in this game' });
          return;
        }

        // Join room
        const roomName = `game:${gameId}`;
        await socket.join(roomName);
        this.connectedPlayers.set(socket.id, player.id);

        // Update player connection status
        await this.gameRepository.updatePlayer(player.id, { isConnected: true });

        // Notify other players
        socket.to(roomName).emit('player_connected', {
          playerId: player.id,
          playerName: player.name,
        });

        logger.info({
          socketId: socket.id,
          gameId,
          playerId: player.id,
          playerName: player.name
        }, 'Player joined game room');

        socket.emit('joined_room', { gameId, playerId: player.id });

      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Failed to join room');
        socket.emit('error', {
          code: 'JOIN_ROOM_ERROR',
          message: error instanceof Error ? error.message : 'Failed to join room'
        });
      }
    });

    socket.on('roll_dice', async (data: any) => {
      try {
        const { gameId, token } = this.validateRollDice(data);
        const payload = AuthService.verifyToken(token);

        const game = await this.gameRepository.findById(gameId);
        if (!game) {
          socket.emit('error', { code: 'GAME_NOT_FOUND', message: 'Game not found' });
          return;
        }

        const player = game.players.find(p =>
          payload.isGuest ? p.name === payload.username : p.userId === payload.userId
        );

        if (!player) {
          socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'You are not in this game' });
          return;
        }

        if (game.status !== 'RUNNING') {
          socket.emit('error', { code: 'GAME_NOT_RUNNING', message: 'Game is not running' });
          return;
        }

        if (game.players[game.currentTurn].id !== player.id) {
          socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn' });
          return;
        }

        // Roll dice using game engine
        const gameState = this.convertToGameState(game);
        const { dice, patches } = this.gameEngine.rollDice(player.id, gameState);

        // Apply patches to database
        await this.applyPatches(gameId, patches);

        // Broadcast to room
        const roomName = `game:${gameId}`;
        this.io.to(roomName).emit('dice_rolled', {
          playerId: player.id,
          playerName: player.name,
          dice,
          patches,
        });

        logger.info({
          gameId,
          playerId: player.id,
          dice
        }, 'Dice rolled');

      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Failed to roll dice');
        socket.emit('error', {
          code: 'ROLL_DICE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to roll dice'
        });
      }
    });

    socket.on('buy_property', async (data: any) => {
      try {
        const { gameId, tileId, token } = this.validateBuyProperty(data);
        const payload = AuthService.verifyToken(token);

        const game = await this.gameRepository.findById(gameId);
        if (!game) {
          socket.emit('error', { code: 'GAME_NOT_FOUND', message: 'Game not found' });
          return;
        }

        const player = game.players.find(p =>
          payload.isGuest ? p.name === payload.username : p.userId === payload.userId
        );

        if (!player) {
          socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'You are not in this game' });
          return;
        }

        if (game.status !== 'RUNNING') {
          socket.emit('error', { code: 'GAME_NOT_RUNNING', message: 'Game is not running' });
          return;
        }

        if (game.players[game.currentTurn].id !== player.id) {
          socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn' });
          return;
        }

        // Check if player can buy property
        const gameState = this.convertToGameState(game);
        if (!this.gameEngine.canBuyProperty(player.id, tileId, gameState)) {
          socket.emit('error', { code: 'CANNOT_BUY_PROPERTY', message: 'Cannot buy this property' });
          return;
        }

        // Buy property using game engine
        const patches = this.gameEngine.buyProperty(player.id, tileId, gameState);

        // Apply patches to database
        await this.applyPatches(gameId, patches);

        // Broadcast to room
        const roomName = `game:${gameId}`;
        this.io.to(roomName).emit('property_bought', {
          playerId: player.id,
          playerName: player.name,
          tileId,
          patches,
        });

        logger.info({
          gameId,
          playerId: player.id,
          tileId
        }, 'Property bought');

      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Failed to buy property');
        socket.emit('error', {
          code: 'BUY_PROPERTY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to buy property'
        });
      }
    });

    socket.on('end_turn', async (data: any) => {
      try {
        const { gameId, token } = this.validateEndTurn(data);
        const payload = AuthService.verifyToken(token);

        const game = await this.gameRepository.findById(gameId);
        if (!game) {
          socket.emit('error', { code: 'GAME_NOT_FOUND', message: 'Game not found' });
          return;
        }

        const player = game.players.find(p =>
          payload.isGuest ? p.name === payload.username : p.userId === payload.userId
        );

        if (!player) {
          socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'You are not in this game' });
          return;
        }

        if (game.status !== 'RUNNING') {
          socket.emit('error', { code: 'GAME_NOT_RUNNING', message: 'Game is not running' });
          return;
        }

        if (game.players[game.currentTurn].id !== player.id) {
          socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn' });
          return;
        }

        // End turn using game engine
        const gameState = this.convertToGameState(game);
        const patches = this.gameEngine.endTurn(player.id, gameState);

        // Apply patches to database
        await this.applyPatches(gameId, patches);

        // Broadcast to room
        const roomName = `game:${gameId}`;
        this.io.to(roomName).emit('turn_ended', {
          playerId: player.id,
          playerName: player.name,
          patches,
        });

        logger.info({
          gameId,
          playerId: player.id
        }, 'Turn ended');

      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Failed to end turn');
        socket.emit('error', {
          code: 'END_TURN_ERROR',
          message: error instanceof Error ? error.message : 'Failed to end turn'
        });
      }
    });

    socket.on('chat', async (data: any) => {
      try {
        const { gameId, message, token } = this.validateChat(data);
        const payload = AuthService.verifyToken(token);

        const game = await this.gameRepository.findById(gameId);
        if (!game) {
          socket.emit('error', { code: 'GAME_NOT_FOUND', message: 'Game not found' });
          return;
        }

        const player = game.players.find(p =>
          payload.isGuest ? p.name === payload.username : p.userId === payload.userId
        );

        if (!player) {
          socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'You are not in this game' });
          return;
        }

        // Broadcast chat message to room
        const roomName = `game:${gameId}`;
        this.io.to(roomName).emit('chat', {
          playerId: player.id,
          playerName: player.name,
          message,
          timestamp: new Date().toISOString(),
        });

        logger.info({
          gameId,
          playerId: player.id,
          message
        }, 'Chat message sent');

      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Failed to send chat message');
        socket.emit('error', {
          code: 'CHAT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send chat message'
        });
      }
    });

    socket.on('disconnect', async () => {
      try {
        const playerId = this.connectedPlayers.get(socket.id);
        if (playerId) {
          // Update player connection status
          await this.gameRepository.updatePlayer(playerId, { isConnected: false });

          // Notify other players
          const game = await this.gameRepository.findById(
            (await this.gameRepository.findById(playerId))?.id || ''
          );

          if (game) {
            const roomName = `game:${game.id}`;
            socket.to(roomName).emit('player_disconnected', {
              playerId,
              playerName: game.players.find(p => p.id === playerId)?.name,
            });
          }

          this.connectedPlayers.delete(socket.id);
        }

        logger.info({ socketId: socket.id }, 'Socket disconnected');
      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Error handling disconnect');
      }
    });
  }

  private validateJoinRoom(data: any) {
    const schema = z.object({
      gameId: z.string().min(1),
      token: z.string().min(1),
    });
    return schema.parse(data);
  }

  private validateRollDice(data: any) {
    const schema = z.object({
      gameId: z.string().min(1),
      token: z.string().min(1),
    });
    return schema.parse(data);
  }

  private validateBuyProperty(data: any) {
    const schema = z.object({
      gameId: z.string().min(1),
      tileId: z.string().min(1),
      token: z.string().min(1),
    });
    return schema.parse(data);
  }

  private validateEndTurn(data: any) {
    const schema = z.object({
      gameId: z.string().min(1),
      token: z.string().min(1),
    });
    return schema.parse(data);
  }

  private validateChat(data: any) {
    const schema = z.object({
      gameId: z.string().min(1),
      message: z.string().min(1).max(500),
      token: z.string().min(1),
    });
    return schema.parse(data);
  }

  private convertToGameState(game: any) {
    return {
      id: game.id,
      status: game.status,
      currentTurn: game.currentTurn,
      players: game.players.map((p: any) => ({
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
      properties: game.properties.map((p: any) => ({
        id: p.id,
        tileId: p.tileId,
        ownerId: p.ownerId,
        mortgaged: p.mortgaged,
        houses: p.houses,
        hotel: p.hotel,
      })),
      settings: game.settings,
      version: game.version,
      freeParkingPot: 0,
      chanceDeck: [],
      chestDeck: [],
      chanceDiscard: [],
      chestDiscard: [],
    };
  }

  private async applyPatches(gameId: string, patches: any[]): Promise<void> {
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
