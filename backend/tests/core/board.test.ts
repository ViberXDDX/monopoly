import { describe, it, expect } from 'vitest';
import { Board } from '../../src/core/board';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = Board.getInstance();
  });

  describe('getTile', () => {
    it('should return tile by index', () => {
      const tile = board.getTile(0);
      expect(tile).toBeDefined();
      expect(tile?.name).toBe('GO');
      expect(tile?.type).toBe('GO');
    });

    it('should return undefined for invalid index', () => {
      const tile = board.getTile(40);
      expect(tile).toBeUndefined();
    });
  });

  describe('getAllTiles', () => {
    it('should return all 40 tiles', () => {
      const tiles = board.getAllTiles();
      expect(tiles).toHaveLength(40);
    });
  });

  describe('getTilesByColor', () => {
    it('should return tiles of specific color', () => {
      const brownTiles = board.getTilesByColor('brown');
      expect(brownTiles).toHaveLength(2);
      expect(brownTiles.every(tile => tile.color === 'brown')).toBe(true);
    });

    it('should return empty array for non-existent color', () => {
      const tiles = board.getTilesByColor('nonexistent');
      expect(tiles).toHaveLength(0);
    });
  });

  describe('getTilesByType', () => {
    it('should return tiles of specific type', () => {
      const propertyTiles = board.getTilesByType('PROPERTY');
      expect(propertyTiles.length).toBeGreaterThan(0);
      expect(propertyTiles.every(tile => tile.type === 'PROPERTY')).toBe(true);
    });
  });

  describe('getRailroadTiles', () => {
    it('should return all railroad tiles', () => {
      const railroads = board.getRailroadTiles();
      expect(railroads).toHaveLength(4);
      expect(railroads.every(tile => tile.type === 'RAILROAD')).toBe(true);
    });
  });

  describe('getUtilityTiles', () => {
    it('should return all utility tiles', () => {
      const utilities = board.getUtilityTiles();
      expect(utilities).toHaveLength(2);
      expect(utilities.every(tile => tile.type === 'UTILITY')).toBe(true);
    });
  });

  describe('getNextPosition', () => {
    it('should calculate next position correctly', () => {
      expect(board.getNextPosition(0, 5)).toBe(5);
      expect(board.getNextPosition(38, 5)).toBe(3); // Wrap around
      expect(board.getNextPosition(39, 1)).toBe(0); // Wrap around to GO
    });
  });

  describe('getDistanceToGo', () => {
    it('should calculate distance to GO correctly', () => {
      expect(board.getDistanceToGo(0)).toBe(0);
      expect(board.getDistanceToGo(10)).toBe(30);
      expect(board.getDistanceToGo(39)).toBe(1);
    });
  });

  describe('tile type checks', () => {
    it('should identify GO tile', () => {
      expect(board.isGoTile(0)).toBe(true);
      expect(board.isGoTile(1)).toBe(false);
    });

    it('should identify jail tile', () => {
      expect(board.isJailTile(10)).toBe(true);
      expect(board.isJailTile(0)).toBe(false);
    });

    it('should identify go to jail tile', () => {
      expect(board.isGoToJailTile(30)).toBe(true);
      expect(board.isGoToJailTile(0)).toBe(false);
    });

    it('should identify chance tile', () => {
      expect(board.isChanceTile(7)).toBe(true);
      expect(board.isChanceTile(0)).toBe(false);
    });

    it('should identify chest tile', () => {
      expect(board.isChestTile(2)).toBe(true);
      expect(board.isChestTile(0)).toBe(false);
    });

    it('should identify tax tile', () => {
      expect(board.isTaxTile(4)).toBe(true);
      expect(board.isTaxTile(0)).toBe(false);
    });

    it('should identify property tile', () => {
      expect(board.isPropertyTile(1)).toBe(true);
      expect(board.isPropertyTile(0)).toBe(false);
    });

    it('should identify railroad tile', () => {
      expect(board.isRailroadTile(5)).toBe(true);
      expect(board.isRailroadTile(0)).toBe(false);
    });

    it('should identify utility tile', () => {
      expect(board.isUtilityTile(12)).toBe(true);
      expect(board.isUtilityTile(0)).toBe(false);
    });
  });

  describe('getTaxAmount', () => {
    it('should return correct tax amounts', () => {
      expect(board.getTaxAmount(4)).toBe(200); // Income Tax
      expect(board.getTaxAmount(38)).toBe(100); // Luxury Tax
      expect(board.getTaxAmount(0)).toBe(0); // Not a tax tile
    });
  });

  describe('getNearestTile', () => {
    it('should find nearest railroad', () => {
      const nearest = board.getNearestTile(0, 'railroad');
      expect(nearest).toBe(5); // Reading Railroad
    });

    it('should find nearest utility', () => {
      const nearest = board.getNearestTile(0, 'utility');
      expect(nearest).toBe(12); // Electric Company
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle chance deck', () => {
      const originalDeck = board.getChanceCards();
      board.shuffleDeck('chance');
      const shuffledDeck = board.getChanceCards();

      // Decks should have same length
      expect(shuffledDeck).toHaveLength(originalDeck.length);

      // Decks should contain same cards (order may differ)
      expect(shuffledDeck.every(card =>
        originalDeck.some(originalCard => originalCard.id === card.id)
      )).toBe(true);
    });

    it('should shuffle chest deck', () => {
      const originalDeck = board.getChestCards();
      board.shuffleDeck('chest');
      const shuffledDeck = board.getChestCards();

      // Decks should have same length
      expect(shuffledDeck).toHaveLength(originalDeck.length);

      // Decks should contain same cards (order may differ)
      expect(shuffledDeck.every(card =>
        originalDeck.some(originalCard => originalCard.id === card.id)
      )).toBe(true);
    });
  });
});
