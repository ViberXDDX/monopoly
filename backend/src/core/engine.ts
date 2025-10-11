import {
  GameState,
  PlayerState,
  PropertyState,
  GamePatch,
  DiceRoll,
  MoveResult,
  TileEffect,
  BankruptcyResult,
  TradeProposal,
  GameSettings,
  TileType,
  GameStatus
} from './types';
import { Board } from './board';
import { Dice } from './dice';
import { Card } from './types';

export class GameEngine {
  private board: Board;

  constructor() {
    this.board = Board.getInstance();
  }

  startGame(gameId: string, players: PlayerState[], settings: GameSettings): GamePatch[] {
    const patches: GamePatch[] = [];

    // Initialize board tiles for this game
    const tiles = this.board.getAllTiles();
    patches.push({
      type: 'game_update',
      data: {
        tiles,
        status: GameStatus.RUNNING,
        currentTurn: 0,
        settings,
        freeParkingPot: 0,
        chanceDeck: this.board.getChanceCards(),
        chestDeck: this.board.getChestCards(),
        chanceDiscard: [],
        chestDiscard: []
      }
    });

    // Initialize properties for each tile
    tiles.forEach(tile => {
      if (tile.type === TileType.PROPERTY || tile.type === TileType.RAILROAD || tile.type === TileType.UTILITY) {
        patches.push({
          type: 'property_update',
          data: {
            tileId: tile.index.toString(),
            ownerId: null,
            mortgaged: false,
            houses: 0,
            hotel: false
          }
        });
      }
    });

    // Shuffle card decks
    this.board.shuffleDeck('chance');
    this.board.shuffleDeck('chest');

    // Add game start log
    patches.push({
      type: 'log_add',
      data: {
        type: 'game_start',
        actorId: null,
        payload: { players: players.map(p => p.name) }
      }
    });

    return patches;
  }

  rollDice(playerId: string, state: GameState): { dice: DiceRoll; patches: GamePatch[] } {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.bankrupt) {
      throw new Error('Invalid player or player is bankrupt');
    }

    if (state.status !== GameStatus.RUNNING) {
      throw new Error('Game is not running');
    }

    if (state.players[state.currentTurn].id !== playerId) {
      throw new Error('Not your turn');
    }

    const dice = Dice.roll();
    const patches: GamePatch[] = [];

    // Update player's doubles count
    if (dice.isDouble) {
      patches.push({
        type: 'player_update',
        playerId,
        data: { doublesInRow: player.doublesInRow + 1 }
      });
    } else {
      patches.push({
        type: 'player_update',
        playerId,
        data: { doublesInRow: 0 }
      });
    }

    // Check for three doubles in a row
    if (dice.isDouble && player.doublesInRow >= 2) {
      patches.push({
        type: 'player_update',
        playerId,
        data: {
          inJail: true,
          jailTurns: 0,
          position: 10,
          doublesInRow: 0
        }
      });

      patches.push({
        type: 'log_add',
        data: {
          type: 'go_to_jail',
          actorId: playerId,
          payload: { reason: 'three_doubles' }
        }
      });

      // End turn
      patches.push(...this.endTurn(playerId, state));

      return { dice, patches };
    }

    // Move player if not in jail
    if (!player.inJail) {
      const moveResult = this.movePlayer(playerId, dice.total, state);
      patches.push({
        type: 'player_update',
        playerId,
        data: { position: moveResult.newPosition }
      });

      // Handle passing or landing on GO
      if (moveResult.passedGo) {
        patches.push({
          type: 'player_update',
          playerId,
          data: { cash: player.cash + 200 }
        });
        patches.push({
          type: 'log_add',
          data: {
            type: 'pass_go',
            actorId: playerId,
            payload: { amount: 200 }
          }
        });
      }

      if (moveResult.landedOnGo) {
        patches.push({
          type: 'player_update',
          playerId,
          data: { cash: player.cash + 200 }
        });
        patches.push({
          type: 'log_add',
          data: {
            type: 'land_on_go',
            actorId: playerId,
            payload: { amount: 200 }
          }
        });
      }

      // Apply tile effect
      const tileEffect = this.applyTileEffect(playerId, moveResult.newPosition, state);
      patches.push(...this.handleTileEffect(playerId, tileEffect, state));
    } else {
      // Player is in jail, handle jail logic
      patches.push(...this.handleJail(playerId, 'roll', state));
    }

    // End turn if not a double
    if (!dice.isDouble) {
      patches.push(...this.endTurn(playerId, state));
    }

    return { dice, patches };
  }

  movePlayer(playerId: string, spaces: number, state: GameState): MoveResult {
    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const oldPosition = player.position;
    const newPosition = this.board.getNextPosition(oldPosition, spaces);

    const passedGo = oldPosition > newPosition && newPosition !== 0;
    const landedOnGo = newPosition === 0;

    return {
      newPosition,
      passedGo,
      landedOnGo
    };
  }

  applyTileEffect(playerId: string, tileIndex: number, state: GameState): TileEffect {
    const tile = this.board.getTile(tileIndex);
    if (!tile) {
      throw new Error('Invalid tile');
    }

    switch (tile.type) {
      case TileType.GO:
        return { type: 'go', amount: 200 };

      case TileType.PROPERTY:
      case TileType.RAILROAD:
      case TileType.UTILITY:
        return { type: 'rent' };

      case TileType.TAX:
        return { type: 'tax', amount: this.board.getTaxAmount(tileIndex) };

      case TileType.CHANCE:
        return { type: 'card', cardId: 'chance' };

      case TileType.CHEST:
        return { type: 'card', cardId: 'chest' };

      case TileType.JAIL:
        return { type: 'jail' };

      case TileType.GO_TO_JAIL:
        return { type: 'go_to_jail' };

      case TileType.FREE_PARKING:
        return { type: 'free_parking' };

      default:
        return { type: 'rent' };
    }
  }

  private handleTileEffect(playerId: string, effect: TileEffect, state: GameState): GamePatch[] {
    const patches: GamePatch[] = [];
    const player = state.players.find(p => p.id === playerId);

    if (!player) return patches;

    switch (effect.type) {
      case 'go':
        patches.push({
          type: 'player_update',
          playerId,
          data: { cash: player.cash + (effect.amount || 0) }
        });
        break;

      case 'tax':
        const taxAmount = effect.amount || 0;
        patches.push({
          type: 'player_update',
          playerId,
          data: { cash: player.cash - taxAmount }
        });
        patches.push({
          type: 'game_update',
          data: { freeParkingPot: state.freeParkingPot + taxAmount }
        });
        break;

      case 'go_to_jail':
        patches.push({
          type: 'player_update',
          playerId,
          data: {
            inJail: true,
            jailTurns: 0,
            position: 10
          }
        });
        patches.push({
          type: 'log_add',
          data: {
            type: 'go_to_jail',
            actorId: playerId,
            payload: { reason: 'go_to_jail_tile' }
          }
        });
        break;

      case 'free_parking':
        if (state.freeParkingPot > 0) {
          patches.push({
            type: 'player_update',
            playerId,
            data: { cash: player.cash + state.freeParkingPot }
          });
          patches.push({
            type: 'game_update',
            data: { freeParkingPot: 0 }
          });
        }
        break;

      case 'card':
        const cardResult = this.drawCard(playerId, effect.cardId as 'chance' | 'chest', state);
        patches.push(...cardResult.patches);
        break;
    }

    return patches;
  }

  canBuyProperty(playerId: string, tileId: string, state: GameState): boolean {
    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property) {
      return false;
    }

    // Can't buy if already owned
    if (property.ownerId) {
      return false;
    }

    // Can't buy if player doesn't have enough cash
    if (player.cash < (tile.price || 0)) {
      return false;
    }

    // Can only buy on your turn
    if (state.players[state.currentTurn].id !== playerId) {
      return false;
    }

    return true;
  }

  buyProperty(playerId: string, tileId: string, state: GameState): GamePatch[] {
    if (!this.canBuyProperty(playerId, tileId, state)) {
      throw new Error('Cannot buy property');
    }

    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property) {
      throw new Error('Invalid buy property request');
    }

    const price = tile.price || 0;
    const patches: GamePatch[] = [];

    // Update property ownership
    patches.push({
      type: 'property_update',
      propertyId: property.id,
      data: { ownerId: playerId }
    });

    // Deduct cash from player
    patches.push({
      type: 'player_update',
      playerId,
      data: { cash: player.cash - price }
    });

    // Add log entry
    patches.push({
      type: 'log_add',
      data: {
        type: 'buy_property',
        actorId: playerId,
        payload: { tileId, tileName: tile.name, price }
      }
    });

    return patches;
  }

  startAuction(tileId: string, state: GameState): GamePatch[] {
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!tile || !property || property.ownerId) {
      throw new Error('Cannot auction property');
    }

    const patches: GamePatch[] = [];

    // Start auction
    patches.push({
      type: 'auction_start',
      data: {
        tileId,
        currentBid: 0,
        endsAt: Date.now() + 30000, // 30 seconds
        bidders: []
      }
    });

    patches.push({
      type: 'log_add',
      data: {
        type: 'auction_start',
        actorId: null,
        payload: { tileId, tileName: tile.name }
      }
    });

    return patches;
  }

  bidOnAuction(playerId: string, amount: number, state: GameState): GamePatch[] {
    if (!state.activeAuction) {
      throw new Error('No active auction');
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player || player.cash < amount) {
      throw new Error('Insufficient funds');
    }

    if (amount <= state.activeAuction.currentBid) {
      throw new Error('Bid must be higher than current bid');
    }

    const patches: GamePatch[] = [];

    // Update auction
    patches.push({
      type: 'auction_start',
      data: {
        ...state.activeAuction,
        currentBid: amount,
        currentBidder: playerId,
        bidders: [...state.activeAuction.bidders, playerId]
      }
    });

    patches.push({
      type: 'log_add',
      data: {
        type: 'auction_bid',
        actorId: playerId,
        payload: { amount }
      }
    });

    return patches;
  }

  endAuction(state: GameState): GamePatch[] {
    if (!state.activeAuction) {
      return [];
    }

    const patches: GamePatch[] = [];

    if (state.activeAuction.currentBidder) {
      const winner = state.players.find(p => p.id === state.activeAuction.currentBidder);
      const tile = this.board.getTile(parseInt(state.activeAuction.tileId));
      const property = state.properties.find(p => p.tileId === state.activeAuction.tileId);

      if (winner && tile && property) {
        // Transfer ownership
        patches.push({
          type: 'property_update',
          propertyId: property.id,
          data: { ownerId: winner.id }
        });

        // Deduct cash from winner
        patches.push({
          type: 'player_update',
          playerId: winner.id,
          data: { cash: winner.cash - state.activeAuction.currentBid }
        });

        patches.push({
          type: 'log_add',
          data: {
            type: 'auction_won',
            actorId: winner.id,
            payload: {
              tileId: state.activeAuction.tileId,
              tileName: tile.name,
              amount: state.activeAuction.currentBid
            }
          }
        });
      }
    } else {
      patches.push({
        type: 'log_add',
        data: {
          type: 'auction_cancelled',
          actorId: null,
          payload: { tileId: state.activeAuction.tileId }
        }
      });
    }

    // End auction
    patches.push({
      type: 'auction_end',
      data: {}
    });

    return patches;
  }

  canBuildHouse(playerId: string, tileId: string, state: GameState): boolean {
    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property || property.ownerId !== playerId) {
      return false;
    }

    // Can't build if mortgaged
    if (property.mortgaged) {
      return false;
    }

    // Can't build if already has hotel
    if (property.hotel) {
      return false;
    }

    // Can't build if already has 4 houses
    if (property.houses >= 4) {
      return false;
    }

    // Check if player owns all properties in the color group
    const colorGroup = this.board.getTilesByColor(tile.color || '');
    const ownedProperties = colorGroup.filter(t => {
      const prop = state.properties.find(p => p.tileId === t.index.toString());
      return prop?.ownerId === playerId && !prop.mortgaged;
    });

    if (ownedProperties.length !== colorGroup.length) {
      return false;
    }

    // Check even building rule
    const housesInGroup = colorGroup.map(t => {
      const prop = state.properties.find(p => p.tileId === t.index.toString());
      return prop?.houses || 0;
    });

    const minHouses = Math.min(...housesInGroup);
    const maxHouses = Math.max(...housesInGroup);

    if (maxHouses - minHouses > 1) {
      return false;
    }

    return true;
  }

  buildHouse(playerId: string, tileId: string, state: GameState): GamePatch[] {
    if (!this.canBuildHouse(playerId, tileId, state)) {
      throw new Error('Cannot build house');
    }

    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property) {
      throw new Error('Invalid build house request');
    }

    const houseCost = this.getHouseCost(tile);
    const patches: GamePatch[] = [];

    // Update property
    patches.push({
      type: 'property_update',
      propertyId: property.id,
      data: { houses: property.houses + 1 }
    });

    // Deduct cash from player
    patches.push({
      type: 'player_update',
      playerId,
      data: { cash: player.cash - houseCost }
    });

    // Add log entry
    patches.push({
      type: 'log_add',
      data: {
        type: 'build_house',
        actorId: playerId,
        payload: { tileId, tileName: tile.name, cost: houseCost }
      }
    });

    return patches;
  }

  canBuildHotel(playerId: string, tileId: string, state: GameState): boolean {
    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property || property.ownerId !== playerId) {
      return false;
    }

    // Can't build if mortgaged
    if (property.mortgaged) {
      return false;
    }

    // Can't build if already has hotel
    if (property.hotel) {
      return false;
    }

    // Must have exactly 4 houses
    if (property.houses !== 4) {
      return false;
    }

    // Check if player owns all properties in the color group
    const colorGroup = this.board.getTilesByColor(tile.color || '');
    const ownedProperties = colorGroup.filter(t => {
      const prop = state.properties.find(p => p.tileId === t.index.toString());
      return prop?.ownerId === playerId && !prop.mortgaged;
    });

    if (ownedProperties.length !== colorGroup.length) {
      return false;
    }

    return true;
  }

  buildHotel(playerId: string, tileId: string, state: GameState): GamePatch[] {
    if (!this.canBuildHotel(playerId, tileId, state)) {
      throw new Error('Cannot build hotel');
    }

    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property) {
      throw new Error('Invalid build hotel request');
    }

    const hotelCost = this.getHotelCost(tile);
    const patches: GamePatch[] = [];

    // Update property
    patches.push({
      type: 'property_update',
      propertyId: property.id,
      data: { houses: 0, hotel: true }
    });

    // Deduct cash from player
    patches.push({
      type: 'player_update',
      playerId,
      data: { cash: player.cash - hotelCost }
    });

    // Add log entry
    patches.push({
      type: 'log_add',
      data: {
        type: 'build_hotel',
        actorId: playerId,
        payload: { tileId, tileName: tile.name, cost: hotelCost }
      }
    });

    return patches;
  }

  mortgageProperty(playerId: string, tileId: string, state: GameState): GamePatch[] {
    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property || property.ownerId !== playerId) {
      throw new Error('Cannot mortgage property');
    }

    if (property.mortgaged) {
      throw new Error('Property already mortgaged');
    }

    if (property.houses > 0 || property.hotel) {
      throw new Error('Cannot mortgage property with buildings');
    }

    const mortgageValue = Math.floor((tile.price || 0) / 2);
    const patches: GamePatch[] = [];

    // Update property
    patches.push({
      type: 'property_update',
      propertyId: property.id,
      data: { mortgaged: true }
    });

    // Add cash to player
    patches.push({
      type: 'player_update',
      playerId,
      data: { cash: player.cash + mortgageValue }
    });

    // Add log entry
    patches.push({
      type: 'log_add',
      data: {
        type: 'mortgage_property',
        actorId: playerId,
        payload: { tileId, tileName: tile.name, amount: mortgageValue }
      }
    });

    return patches;
  }

  unmortgageProperty(playerId: string, tileId: string, state: GameState): GamePatch[] {
    const player = state.players.find(p => p.id === playerId);
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);

    if (!player || !tile || !property || property.ownerId !== playerId) {
      throw new Error('Cannot unmortgage property');
    }

    if (!property.mortgaged) {
      throw new Error('Property not mortgaged');
    }

    const unmortgageCost = Math.floor((tile.price || 0) * 0.55); // 50% + 10% interest
    const patches: GamePatch[] = [];

    if (player.cash < unmortgageCost) {
      throw new Error('Insufficient funds to unmortgage');
    }

    // Update property
    patches.push({
      type: 'property_update',
      propertyId: property.id,
      data: { mortgaged: false }
    });

    // Deduct cash from player
    patches.push({
      type: 'player_update',
      playerId,
      data: { cash: player.cash - unmortgageCost }
    });

    // Add log entry
    patches.push({
      type: 'log_add',
      data: {
        type: 'unmortgage_property',
        actorId: playerId,
        payload: { tileId, tileName: tile.name, cost: unmortgageCost }
      }
    });

    return patches;
  }

  handleJail(playerId: string, action: 'pay' | 'card' | 'roll', state: GameState): GamePatch[] {
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.inJail) {
      throw new Error('Player not in jail');
    }

    const patches: GamePatch[] = [];

    switch (action) {
      case 'pay':
        if (player.cash >= 50) {
          patches.push({
            type: 'player_update',
            playerId,
            data: {
              inJail: false,
              jailTurns: 0,
              cash: player.cash - 50
            }
          });
          patches.push({
            type: 'log_add',
            data: {
              type: 'jail_fine_paid',
              actorId: playerId,
              payload: { amount: 50 }
            }
          });
        } else {
          throw new Error('Insufficient funds to pay jail fine');
        }
        break;

      case 'card':
        if (player.getOutOfJailCards > 0) {
          patches.push({
            type: 'player_update',
            playerId,
            data: {
              inJail: false,
              jailTurns: 0,
              getOutOfJailCards: player.getOutOfJailCards - 1
            }
          });
          patches.push({
            type: 'log_add',
            data: {
              type: 'jail_card_used',
              actorId: playerId,
              payload: {}
            }
          });
        } else {
          throw new Error('No get out of jail cards');
        }
        break;

      case 'roll':
        const dice = Dice.roll();
        if (dice.isDouble) {
          patches.push({
            type: 'player_update',
            playerId,
            data: {
              inJail: false,
              jailTurns: 0
            }
          });
          patches.push({
            type: 'log_add',
            data: {
              type: 'jail_doubles',
              actorId: playerId,
              payload: { dice: dice.total }
            }
          });
        } else {
          patches.push({
            type: 'player_update',
            playerId,
            data: { jailTurns: player.jailTurns + 1 }
          });

          if (player.jailTurns >= 2) {
            // Must pay fine after 3 turns
            if (player.cash >= 50) {
              patches.push({
                type: 'player_update',
                playerId,
                data: {
                  inJail: false,
                  jailTurns: 0,
                  cash: player.cash - 50
                }
              });
              patches.push({
                type: 'log_add',
                data: {
                  type: 'jail_forced_fine',
                  actorId: playerId,
                  payload: { amount: 50 }
                }
              });
            } else {
              // Player is bankrupt
              const bankruptcyResult = this.processBankruptcy(playerId, state);
              patches.push(...this.handleBankruptcy(bankruptcyResult, state));
            }
          }
        }
        break;
    }

    return patches;
  }

  processBankruptcy(playerId: string, state: GameState): BankruptcyResult {
    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Calculate total debt
    const totalDebt = this.calculateTotalDebt(player, state);

    // Check if any player can cover the debt
    const potentialCreditors = state.players
      .filter(p => p.id !== playerId && !p.bankrupt && p.cash >= totalDebt)
      .sort((a, b) => b.cash - a.cash);

    if (potentialCreditors.length > 0) {
      return {
        bankruptPlayerId: playerId,
        creditorId: potentialCreditors[0].id,
        assetsTransferred: true,
        gameEnded: false
      };
    }

    // No creditor found, transfer assets to bank
    return {
      bankruptPlayerId: playerId,
      creditorId: undefined,
      assetsTransferred: true,
      gameEnded: state.players.filter(p => !p.bankrupt).length <= 1
    };
  }

  private calculateTotalDebt(player: PlayerState, state: GameState): number {
    // This is a simplified calculation
    // In a real game, you'd need to calculate rent owed, mortgage payments, etc.
    return Math.max(0, -player.cash);
  }

  private handleBankruptcy(result: BankruptcyResult, state: GameState): GamePatch[] {
    const patches: GamePatch[] = [];

    // Mark player as bankrupt
    patches.push({
      type: 'player_update',
      playerId: result.bankruptPlayerId,
      data: { bankrupt: true }
    });

    // Transfer assets to creditor or bank
    if (result.creditorId) {
      patches.push({
        type: 'log_add',
        data: {
          type: 'bankruptcy_transfer',
          actorId: result.bankruptPlayerId,
          payload: { creditorId: result.creditorId }
        }
      });
    } else {
      patches.push({
        type: 'log_add',
        data: {
          type: 'bankruptcy_bank',
          actorId: result.bankruptPlayerId,
          payload: {}
        }
      });
    }

    // Check if game should end
    if (result.gameEnded) {
      patches.push({
        type: 'game_update',
        data: { status: GameStatus.FINISHED }
      });
    }

    return patches;
  }

  endTurn(playerId: string, state: GameState): GamePatch[] {
    const patches: GamePatch[] = [];
    const currentPlayerIndex = state.currentTurn;
    const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;

    patches.push({
      type: 'game_update',
      data: { currentTurn: nextPlayerIndex }
    });

    patches.push({
      type: 'log_add',
      data: {
        type: 'turn_end',
        actorId: playerId,
        payload: { nextPlayer: state.players[nextPlayerIndex].name }
      }
    });

    return patches;
  }

  drawCard(playerId: string, deck: 'chance' | 'chest', state: GameState): { card: Card; patches: GamePatch[] } {
    const patches: GamePatch[] = [];
    let card: Card;

    if (deck === 'chance') {
      if (state.chanceDeck.length === 0) {
        // Reshuffle discard pile
        patches.push({
          type: 'game_update',
          data: {
            chanceDeck: [...state.chanceDiscard],
            chanceDiscard: []
          }
        });
        card = state.chanceDiscard[0];
      } else {
        card = state.chanceDeck[0];
        patches.push({
          type: 'game_update',
          data: {
            chanceDeck: state.chanceDeck.slice(1),
            chanceDiscard: [...state.chanceDiscard, card]
          }
        });
      }
    } else {
      if (state.chestDeck.length === 0) {
        // Reshuffle discard pile
        patches.push({
          type: 'game_update',
          data: {
            chestDeck: [...state.chestDiscard],
            chestDiscard: []
          }
        });
        card = state.chestDiscard[0];
      } else {
        card = state.chestDeck[0];
        patches.push({
          type: 'game_update',
          data: {
            chestDeck: state.chestDeck.slice(1),
            chestDiscard: [...state.chestDiscard, card]
          }
        });
      }
    }

    // Apply card effect
    patches.push(...this.applyCardEffect(playerId, card, state));

    return { card, patches };
  }

  private applyCardEffect(playerId: string, card: Card, state: GameState): GamePatch[] {
    const patches: GamePatch[] = [];
    const player = state.players.find(p => p.id === playerId);

    if (!player) return patches;

    switch (card.type) {
      case 'advance':
        if (card.target !== undefined) {
          const newPosition = card.target;
          patches.push({
            type: 'player_update',
            playerId,
            data: { position: newPosition }
          });

          // Check if passed GO
          if (player.position > newPosition && newPosition !== 0) {
            patches.push({
              type: 'player_update',
              playerId,
              data: { cash: player.cash + 200 }
            });
          }
        }
        break;

      case 'advance_nearest':
        if (card.target === 'railroad') {
          const nearestRailroad = this.board.getNearestTile(player.position, 'railroad');
          patches.push({
            type: 'player_update',
            playerId,
            data: { position: nearestRailroad }
          });
        } else if (card.target === 'utility') {
          const nearestUtility = this.board.getNearestTile(player.position, 'utility');
          patches.push({
            type: 'player_update',
            playerId,
            data: { position: nearestUtility }
          });
        }
        break;

      case 'pay':
        if (card.amount) {
          patches.push({
            type: 'player_update',
            playerId,
            data: { cash: player.cash + card.amount }
          });
        }
        break;

      case 'get_out_of_jail':
        patches.push({
          type: 'player_update',
          playerId,
          data: { getOutOfJailCards: player.getOutOfJailCards + 1 }
        });
        break;

      case 'go_to_jail':
        patches.push({
          type: 'player_update',
          playerId,
          data: {
            inJail: true,
            jailTurns: 0,
            position: 10
          }
        });
        break;

      case 'move':
        if (card.spaces) {
          const moveResult = this.movePlayer(playerId, card.spaces, state);
          patches.push({
            type: 'player_update',
            playerId,
            data: { position: moveResult.newPosition }
          });
        }
        break;

      case 'repairs':
        // Calculate repair costs based on owned properties
        const ownedProperties = state.properties.filter(p => p.ownerId === playerId);
        let totalCost = 0;

        ownedProperties.forEach(prop => {
          if (prop.hotel) {
            totalCost += card.hotelCost || 0;
          } else {
            totalCost += (prop.houses * (card.houseCost || 0));
          }
        });

        patches.push({
          type: 'player_update',
          playerId,
          data: { cash: player.cash - totalCost }
        });
        break;

      case 'pay_all':
        // Pay all other players
        const otherPlayers = state.players.filter(p => p.id !== playerId && !p.bankrupt);
        const totalPayment = otherPlayers.length * (card.amount || 0);

        patches.push({
          type: 'player_update',
          playerId,
          data: { cash: player.cash - totalPayment }
        });

        otherPlayers.forEach(otherPlayer => {
          patches.push({
            type: 'player_update',
            playerId: otherPlayer.id,
            data: { cash: otherPlayer.cash + (card.amount || 0) }
          });
        });
        break;
    }

    // Add log entry
    patches.push({
      type: 'log_add',
      data: {
        type: 'card_drawn',
        actorId: playerId,
        payload: { cardId: card.id, description: card.description }
      }
    });

    return patches;
  }

  private getHouseCost(tile: any): number {
    // Standard Monopoly house costs based on property value
    const price = tile.price || 0;
    if (price <= 100) return 50;
    if (price <= 140) return 50;
    if (price <= 180) return 100;
    if (price <= 220) return 100;
    if (price <= 260) return 150;
    if (price <= 300) return 150;
    if (price <= 350) return 200;
    return 200;
  }

  private getHotelCost(tile: any): number {
    // Hotel cost is same as house cost
    return this.getHouseCost(tile);
  }

  calculateRent(playerId: string, tileId: string, state: GameState): number {
    const tile = this.board.getTile(parseInt(tileId));
    const property = state.properties.find(p => p.tileId === tileId);
    const owner = state.players.find(p => p.id === property?.ownerId);

    if (!tile || !property || !owner) {
      return 0;
    }

    // Can't collect rent if mortgaged
    if (property.mortgaged) {
      return 0;
    }

    switch (tile.type) {
      case TileType.PROPERTY:
        return this.calculatePropertyRent(tile, property, state);

      case TileType.RAILROAD:
        return this.calculateRailroadRent(owner, state);

      case TileType.UTILITY:
        return this.calculateUtilityRent(owner, state);

      default:
        return 0;
    }
  }

  private calculatePropertyRent(tile: any, property: PropertyState, state: GameState): number {
    if (property.hotel) {
      return (tile.baseRent || 0) * 5; // Hotel rent is typically 5x base rent
    }

    if (property.houses > 0) {
      // House rent calculation
      const baseRent = tile.baseRent || 0;
      const houseMultiplier = property.houses === 1 ? 2 :
                             property.houses === 2 ? 3 :
                             property.houses === 3 ? 4 : 5;
      return baseRent * houseMultiplier;
    }

    // Check if player owns all properties in color group
    const colorGroup = this.board.getTilesByColor(tile.color || '');
    const ownedProperties = colorGroup.filter(t => {
      const prop = state.properties.find(p => p.tileId === t.index.toString());
      return prop?.ownerId === property.ownerId;
    });

    if (ownedProperties.length === colorGroup.length) {
      return (tile.baseRent || 0) * 2; // Double rent for color set
    }

    return tile.baseRent || 0;
  }

  private calculateRailroadRent(owner: PlayerState, state: GameState): number {
    const ownedRailroads = state.properties.filter(p =>
      p.ownerId === owner.id &&
      this.board.getTile(parseInt(p.tileId))?.type === TileType.RAILROAD
    );

    const baseRent = 25;
    return baseRent * ownedRailroads.length;
  }

  private calculateUtilityRent(owner: PlayerState, state: GameState): number {
    const ownedUtilities = state.properties.filter(p =>
      p.ownerId === owner.id &&
      this.board.getTile(parseInt(p.tileId))?.type === TileType.UTILITY
    );

    if (ownedUtilities.length === 1) {
      return 4; // 4x dice roll
    } else if (ownedUtilities.length === 2) {
      return 10; // 10x dice roll
    }

    return 0;
  }
}
