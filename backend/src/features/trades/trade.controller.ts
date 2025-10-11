import { FastifyRequest, FastifyReply } from 'fastify';
import { GameRepository } from '../../db/repositories/game.repository';
import { AuthService } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { AppError, NotFoundError, ConflictError } from '../../utils/errors';

export class TradeController {
  private static gameRepository = new GameRepository();

  static async createTrade(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };
      const { toPlayerId, cashFrom, cashTo, fromPropertyIds, toPropertyIds } = request.body as {
        toPlayerId: string;
        cashFrom: number;
        cashTo: number;
        fromPropertyIds: string[];
        toPropertyIds: string[];
      };

      const game = await this.gameRepository.findById(id);
      if (!game) {
        throw new NotFoundError('Game');
      }

      if (game.status !== 'RUNNING') {
        throw new ConflictError('Game is not running');
      }

      // Find the requesting player
      const fromPlayer = game.players.find(p =>
        payload.isGuest ? p.name === payload.username : p.userId === payload.userId
      );

      if (!fromPlayer) {
        throw new AppError('You are not in this game', 403);
      }

      // Find the target player
      const toPlayer = game.players.find(p => p.id === toPlayerId);
      if (!toPlayer) {
        throw new NotFoundError('Player');
      }

      if (fromPlayer.id === toPlayer.id) {
        throw new ConflictError('Cannot trade with yourself');
      }

      // Validate trade properties
      const fromProperties = game.properties.filter(p =>
        fromPropertyIds.includes(p.id) && p.ownerId === fromPlayer.id
      );

      const toProperties = game.properties.filter(p =>
        toPropertyIds.includes(p.id) && p.ownerId === toPlayer.id
      );

      if (fromProperties.length !== fromPropertyIds.length) {
        throw new ConflictError('You do not own all specified properties');
      }

      if (toProperties.length !== toPropertyIds.length) {
        throw new ConflictError('Target player does not own all specified properties');
      }

      // Check if player has enough cash
      if (fromPlayer.cash < cashFrom) {
        throw new ConflictError('Insufficient cash for trade');
      }

      if (toPlayer.cash < cashTo) {
        throw new ConflictError('Target player has insufficient cash for trade');
      }

      // Create trade
      const trade = await this.gameRepository.createTrade({
        gameId: game.id,
        fromId: fromPlayer.id,
        toId: toPlayer.id,
        cashFrom,
        cashTo,
        fromPropertyIds,
        toPropertyIds,
      });

      logger.info({
        gameId: game.id,
        tradeId: trade.id,
        fromPlayer: fromPlayer.name,
        toPlayer: toPlayer.name
      }, 'Trade created');

      return reply.status(201).send({
        trade: {
          id: trade.id,
          fromId: trade.fromId,
          toId: trade.toId,
          status: trade.status,
          cashFrom: trade.cashFrom,
          cashTo: trade.cashTo,
          fromPropertyIds: trade.fromPropertyIds,
          toPropertyIds: trade.toPropertyIds,
          createdAt: trade.createdAt,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to create trade');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create trade', 500);
    }
  }

  static async respondToTrade(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AppError('Authentication required', 401);
      }

      const payload = AuthService.verifyToken(token);
      const { id } = request.params as { id: string };
      const { action } = request.body as { action: 'accept' | 'reject' };

      const trade = await this.gameRepository.findTradeById(id);
      if (!trade) {
        throw new NotFoundError('Trade');
      }

      const game = await this.gameRepository.findById(trade.gameId);
      if (!game) {
        throw new NotFoundError('Game');
      }

      if (game.status !== 'RUNNING') {
        throw new ConflictError('Game is not running');
      }

      // Find the responding player
      const respondingPlayer = game.players.find(p =>
        payload.isGuest ? p.name === payload.username : p.userId === payload.userId
      );

      if (!respondingPlayer) {
        throw new AppError('You are not in this game', 403);
      }

      if (respondingPlayer.id !== trade.toId) {
        throw new AppError('You are not the target of this trade', 403);
      }

      if (trade.status !== 'PENDING') {
        throw new ConflictError('Trade has already been responded to');
      }

      // Update trade status
      const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
      await this.gameRepository.updateTrade(trade.id, { status: newStatus });

      if (action === 'accept') {
        // Execute the trade
        await this.executeTrade(trade, game);
      }

      logger.info({
        tradeId: trade.id,
        action,
        fromPlayer: game.players.find(p => p.id === trade.fromId)?.name,
        toPlayer: game.players.find(p => p.id === trade.toId)?.name
      }, 'Trade responded');

      return reply.status(200).send({
        message: `Trade ${action}ed successfully`,
        trade: {
          id: trade.id,
          status: newStatus,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to respond to trade');
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to respond to trade', 500);
    }
  }

  private static async executeTrade(trade: any, game: any): Promise<void> {
    const fromPlayer = game.players.find((p: any) => p.id === trade.fromId);
    const toPlayer = game.players.find((p: any) => p.id === trade.toId);

    if (!fromPlayer || !toPlayer) {
      throw new AppError('Players not found');
    }

    // Transfer cash
    await this.gameRepository.updatePlayers([
      { id: fromPlayer.id, data: { cash: fromPlayer.cash - trade.cashFrom } },
      { id: toPlayer.id, data: { cash: toPlayer.cash + trade.cashFrom } },
    ]);

    if (trade.cashTo > 0) {
      await this.gameRepository.updatePlayers([
        { id: fromPlayer.id, data: { cash: fromPlayer.cash - trade.cashFrom + trade.cashTo } },
        { id: toPlayer.id, data: { cash: toPlayer.cash + trade.cashFrom - trade.cashTo } },
      ]);
    }

    // Transfer properties
    if (trade.fromPropertyIds.length > 0) {
      const fromPropertyUpdates = trade.fromPropertyIds.map((propertyId: string) => ({
        id: propertyId,
        data: { ownerId: toPlayer.id },
      }));
      await this.gameRepository.updateProperties(fromPropertyUpdates);
    }

    if (trade.toPropertyIds.length > 0) {
      const toPropertyUpdates = trade.toPropertyIds.map((propertyId: string) => ({
        id: propertyId,
        data: { ownerId: fromPlayer.id },
      }));
      await this.gameRepository.updateProperties(toPropertyUpdates);
    }

    // Add log entry
    await this.gameRepository.addLog(game.id, {
      actorId: toPlayer.id,
      type: 'trade_accepted',
      payload: {
        fromPlayer: fromPlayer.name,
        toPlayer: toPlayer.name,
        cashFrom: trade.cashFrom,
        cashTo: trade.cashTo,
        fromPropertyIds: trade.fromPropertyIds,
        toPropertyIds: trade.toPropertyIds,
      },
    });
  }
}
