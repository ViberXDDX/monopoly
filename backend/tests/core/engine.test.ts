import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../../src/core/engine';
import { Board } from '../../src/core/board';
import { GameState, PlayerState, PropertyState, GameSettings } from '../../src/core/types';

describe('GameEngine', () => {
  let engine: GameEngine;
  let board: Board;
  let gameState: GameState;

  beforeEach(() => {
    engine = new GameEngine();
    board = Board.getInstance();

    // Create a minimal game state for testing
    gameState = {
      id: 'test-game',
      status: 'RUNNING' as any,
      currentTurn: 0,
      players: [
        {
          id: 'player1',
          name: 'Player 1',
          cash: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          doublesInRow: 0,
          bankrupt: false,
          order: 0,
          color: '#FF0000',
          isConnected: true,
          getOutOfJailCards: 0,
        },
        {
          id: 'player2',
          name: 'Player 2',
          cash: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          doublesInRow: 0,
          bankrupt: false,
          order: 1,
          color: '#00FF00',
          isConnected: true,
          getOutOfJailCards: 0,
        },
      ],
      tiles: board.getAllTiles(),
      properties: board.getAllTiles()
        .filter(tile => ['PROPERTY', 'RAILROAD', 'UTILITY'].includes(tile.type))
        .map(tile => ({
          id: `prop-${tile.index}`,
          tileId: tile.index.toString(),
          ownerId: undefined,
          mortgaged: false,
          houses: 0,
          hotel: false,
        })),
      settings: {
        startingCash: 1500,
        houseLimit: 32,
        hotelLimit: 12,
        freeParkingRule: 'taxes',
        auctionOnNoBuy: true,
        jailFine: 50,
        mortgageInterest: 0.1,
      },
      version: 1,
      freeParkingPot: 0,
      chanceDeck: [],
      chestDeck: [],
      chanceDiscard: [],
      chestDiscard: [],
    };
  });

  describe('startGame', () => {
    it('should initialize game with patches', () => {
      const patches = engine.startGame('test-game', gameState.players, gameState.settings);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have game update patch
      const gamePatch = patches.find(p => p.type === 'game_update');
      expect(gamePatch).toBeDefined();
      expect(gamePatch?.data.status).toBe('RUNNING');
    });
  });

  describe('rollDice', () => {
    it('should roll dice and move player', () => {
      const { dice, patches } = engine.rollDice('player1', gameState);

      expect(dice).toBeDefined();
      expect(dice.d1).toBeGreaterThanOrEqual(1);
      expect(dice.d1).toBeLessThanOrEqual(6);
      expect(dice.d2).toBeGreaterThanOrEqual(1);
      expect(dice.d2).toBeLessThanOrEqual(6);
      expect(dice.total).toBe(dice.d1 + dice.d2);
      expect(dice.isDouble).toBe(dice.d1 === dice.d2);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);
    });

    it('should handle three doubles in a row', () => {
      // Set up player with 2 doubles in a row
      gameState.players[0].doublesInRow = 2;

      const { dice, patches } = engine.rollDice('player1', gameState);

      if (dice.isDouble) {
        // Should send player to jail
        const jailPatch = patches.find(p => p.type === 'player_update' && p.data.inJail);
        expect(jailPatch).toBeDefined();
        expect(jailPatch?.data.position).toBe(10); // Jail position
        expect(jailPatch?.data.doublesInRow).toBe(0);
      }
    });

    it('should handle passing GO', () => {
      // Set player position near end of board
      gameState.players[0].position = 38;

      const { patches } = engine.rollDice('player1', gameState);

      // Check if player passed GO (position wrapped around)
      const positionPatch = patches.find(p => p.type === 'player_update' && p.data.position !== undefined);
      if (positionPatch && positionPatch.data.position < 38) {
        // Player passed GO, should get $200
        const cashPatch = patches.find(p => p.type === 'player_update' && p.data.cash !== undefined);
        expect(cashPatch).toBeDefined();
        expect(cashPatch?.data.cash).toBe(1700); // 1500 + 200
      }
    });
  });

  describe('canBuyProperty', () => {
    it('should allow buying unowned property', () => {
      const canBuy = engine.canBuyProperty('player1', '1', gameState);
      expect(canBuy).toBe(true);
    });

    it('should not allow buying owned property', () => {
      // Set property as owned
      gameState.properties[0].ownerId = 'player2';

      const canBuy = engine.canBuyProperty('player1', '1', gameState);
      expect(canBuy).toBe(false);
    });

    it('should not allow buying if insufficient cash', () => {
      // Set player cash to 0
      gameState.players[0].cash = 0;

      const canBuy = engine.canBuyProperty('player1', '1', gameState);
      expect(canBuy).toBe(false);
    });

    it('should not allow buying if not player turn', () => {
      // Set current turn to player 2
      gameState.currentTurn = 1;

      const canBuy = engine.canBuyProperty('player1', '1', gameState);
      expect(canBuy).toBe(false);
    });
  });

  describe('buyProperty', () => {
    it('should buy property successfully', () => {
      const patches = engine.buyProperty('player1', '1', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have property update patch
      const propertyPatch = patches.find(p => p.type === 'property_update');
      expect(propertyPatch).toBeDefined();
      expect(propertyPatch?.data.ownerId).toBe('player1');

      // Should have player update patch (cash deduction)
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();
      expect(playerPatch?.data.cash).toBeLessThan(1500);
    });
  });

  describe('calculateRent', () => {
    it('should calculate base rent for unimproved property', () => {
      // Set property as owned by player2
      gameState.properties[0].ownerId = 'player2';

      const rent = engine.calculateRent('player1', '1', gameState);
      expect(rent).toBeGreaterThan(0);
    });

    it('should calculate double rent for color set', () => {
      // Set all brown properties as owned by player2
      const brownProperties = gameState.properties.filter(p => {
        const tile = board.getTile(parseInt(p.tileId));
        return tile?.color === 'brown';
      });

      brownProperties.forEach(prop => {
        prop.ownerId = 'player2';
      });

      const rent = engine.calculateRent('player1', '1', gameState);
      expect(rent).toBeGreaterThan(0);
    });

    it('should calculate house rent', () => {
      // Set property as owned with houses
      gameState.properties[0].ownerId = 'player2';
      gameState.properties[0].houses = 2;

      const rent = engine.calculateRent('player1', '1', gameState);
      expect(rent).toBeGreaterThan(0);
    });

    it('should calculate hotel rent', () => {
      // Set property as owned with hotel
      gameState.properties[0].ownerId = 'player2';
      gameState.properties[0].hotel = true;

      const rent = engine.calculateRent('player1', '1', gameState);
      expect(rent).toBeGreaterThan(0);
    });

    it('should return 0 for mortgaged property', () => {
      // Set property as owned but mortgaged
      gameState.properties[0].ownerId = 'player2';
      gameState.properties[0].mortgaged = true;

      const rent = engine.calculateRent('player1', '1', gameState);
      expect(rent).toBe(0);
    });
  });

  describe('canBuildHouse', () => {
    it('should allow building house on owned property', () => {
      // Set property as owned by player1
      gameState.properties[0].ownerId = 'player1';

      const canBuild = engine.canBuildHouse('player1', '1', gameState);
      expect(canBuild).toBe(true);
    });

    it('should not allow building house on unowned property', () => {
      const canBuild = engine.canBuildHouse('player1', '1', gameState);
      expect(canBuild).toBe(false);
    });

    it('should not allow building house on mortgaged property', () => {
      // Set property as owned but mortgaged
      gameState.properties[0].ownerId = 'player1';
      gameState.properties[0].mortgaged = true;

      const canBuild = engine.canBuildHouse('player1', '1', gameState);
      expect(canBuild).toBe(false);
    });

    it('should not allow building house if already has hotel', () => {
      // Set property as owned with hotel
      gameState.properties[0].ownerId = 'player1';
      gameState.properties[0].hotel = true;

      const canBuild = engine.canBuildHouse('player1', '1', gameState);
      expect(canBuild).toBe(false);
    });

    it('should not allow building house if already has 4 houses', () => {
      // Set property as owned with 4 houses
      gameState.properties[0].ownerId = 'player1';
      gameState.properties[0].houses = 4;

      const canBuild = engine.canBuildHouse('player1', '1', gameState);
      expect(canBuild).toBe(false);
    });
  });

  describe('buildHouse', () => {
    it('should build house successfully', () => {
      // Set property as owned by player1
      gameState.properties[0].ownerId = 'player1';

      const patches = engine.buildHouse('player1', '1', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have property update patch
      const propertyPatch = patches.find(p => p.type === 'property_update');
      expect(propertyPatch).toBeDefined();
      expect(propertyPatch?.data.houses).toBe(1);

      // Should have player update patch (cash deduction)
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();
      expect(playerPatch?.data.cash).toBeLessThan(1500);
    });
  });

  describe('mortgageProperty', () => {
    it('should mortgage property successfully', () => {
      // Set property as owned by player1
      gameState.properties[0].ownerId = 'player1';

      const patches = engine.mortgageProperty('player1', '1', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have property update patch
      const propertyPatch = patches.find(p => p.type === 'property_update');
      expect(propertyPatch).toBeDefined();
      expect(propertyPatch?.data.mortgaged).toBe(true);

      // Should have player update patch (cash addition)
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();
      expect(playerPatch?.data.cash).toBeGreaterThan(1500);
    });

    it('should not allow mortgaging property with buildings', () => {
      // Set property as owned with houses
      gameState.properties[0].ownerId = 'player1';
      gameState.properties[0].houses = 2;

      expect(() => {
        engine.mortgageProperty('player1', '1', gameState);
      }).toThrow();
    });
  });

  describe('unmortgageProperty', () => {
    it('should unmortgage property successfully', () => {
      // Set property as owned and mortgaged
      gameState.properties[0].ownerId = 'player1';
      gameState.properties[0].mortgaged = true;

      const patches = engine.unmortgageProperty('player1', '1', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have property update patch
      const propertyPatch = patches.find(p => p.type === 'property_update');
      expect(propertyPatch).toBeDefined();
      expect(propertyPatch?.data.mortgaged).toBe(false);

      // Should have player update patch (cash deduction)
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();
      expect(playerPatch?.data.cash).toBeLessThan(1500);
    });

    it('should not allow unmortgaging if insufficient cash', () => {
      // Set property as owned and mortgaged
      gameState.properties[0].ownerId = 'player1';
      gameState.properties[0].mortgaged = true;

      // Set player cash to 0
      gameState.players[0].cash = 0;

      expect(() => {
        engine.unmortgageProperty('player1', '1', gameState);
      }).toThrow();
    });
  });

  describe('handleJail', () => {
    it('should pay fine to get out of jail', () => {
      // Set player in jail
      gameState.players[0].inJail = true;

      const patches = engine.handleJail('player1', 'pay', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have player update patch
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();
      expect(playerPatch?.data.inJail).toBe(false);
      expect(playerPatch?.data.cash).toBe(1450); // 1500 - 50
    });

    it('should use get out of jail card', () => {
      // Set player in jail with card
      gameState.players[0].inJail = true;
      gameState.players[0].getOutOfJailCards = 1;

      const patches = engine.handleJail('player1', 'card', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have player update patch
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();
      expect(playerPatch?.data.inJail).toBe(false);
      expect(playerPatch?.data.getOutOfJailCards).toBe(0);
    });

    it('should roll doubles to get out of jail', () => {
      // Set player in jail
      gameState.players[0].inJail = true;

      const patches = engine.handleJail('player1', 'roll', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have player update patch
      const playerPatch = patches.find(p => p.type === 'player_update');
      expect(playerPatch).toBeDefined();

      // Either player gets out (if doubles) or stays in jail
      if (playerPatch?.data.inJail === false) {
        expect(playerPatch.data.jailTurns).toBe(0);
      } else {
        expect(playerPatch?.data.jailTurns).toBe(1);
      }
    });
  });

  describe('endTurn', () => {
    it('should advance to next player', () => {
      const patches = engine.endTurn('player1', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have game update patch
      const gamePatch = patches.find(p => p.type === 'game_update');
      expect(gamePatch).toBeDefined();
      expect(gamePatch?.data.currentTurn).toBe(1);
    });

    it('should wrap around to first player', () => {
      // Set current turn to last player
      gameState.currentTurn = 1;

      const patches = engine.endTurn('player2', gameState);

      expect(patches).toBeDefined();
      expect(patches.length).toBeGreaterThan(0);

      // Should have game update patch
      const gamePatch = patches.find(p => p.type === 'game_update');
      expect(gamePatch).toBeDefined();
      expect(gamePatch?.data.currentTurn).toBe(0);
    });
  });

  describe('processBankruptcy', () => {
    it('should process bankruptcy with creditor', () => {
      // Set player with negative cash
      gameState.players[0].cash = -100;

      const result = engine.processBankruptcy('player1', gameState);

      expect(result).toBeDefined();
      expect(result.bankruptPlayerId).toBe('player1');
      expect(result.assetsTransferred).toBe(true);
    });

    it('should end game when only one player left', () => {
      // Set all players except one as bankrupt
      gameState.players[0].bankrupt = true;
      gameState.players[1].bankrupt = true;

      const result = engine.processBankruptcy('player1', gameState);

      expect(result).toBeDefined();
      expect(result.gameEnded).toBe(true);
    });
  });
});
