import { BoardTile, Card } from './types';
import boardData from './data/board.json';

export class Board {
  private static instance: Board;
  private tiles: BoardTile[];
  private chanceCards: Card[];
  private chestCards: Card[];

  private constructor() {
    this.tiles = boardData.tiles as BoardTile[];
    this.chanceCards = [...boardData.chanceCards] as Card[];
    this.chestCards = [...boardData.chestCards] as Card[];
  }

  static getInstance(): Board {
    if (!Board.instance) {
      Board.instance = new Board();
    }
    return Board.instance;
  }

  getTile(index: number): BoardTile | undefined {
    return this.tiles[index];
  }

  getAllTiles(): BoardTile[] {
    return [...this.tiles];
  }

  getTilesByColor(color: string): BoardTile[] {
    return this.tiles.filter(tile => tile.color === color);
  }

  getTilesByType(type: string): BoardTile[] {
    return this.tiles.filter(tile => tile.type === type);
  }

  getRailroadTiles(): BoardTile[] {
    return this.tiles.filter(tile => tile.type === 'RAILROAD');
  }

  getUtilityTiles(): BoardTile[] {
    return this.tiles.filter(tile => tile.type === 'UTILITY');
  }

  getChanceCards(): Card[] {
    return [...this.chanceCards];
  }

  getChestCards(): Card[] {
    return [...this.chestCards];
  }

  shuffleDeck(deck: 'chance' | 'chest'): void {
    if (deck === 'chance') {
      this.chanceCards = this.shuffleArray([...this.chanceCards]);
    } else {
      this.chestCards = this.shuffleArray([...this.chestCards]);
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getNearestTile(currentPosition: number, type: 'railroad' | 'utility'): number {
    const tiles = type === 'railroad' ? this.getRailroadTiles() : this.getUtilityTiles();

    let nearest = tiles[0];
    let minDistance = this.getDistance(currentPosition, nearest.index);

    for (const tile of tiles) {
      const distance = this.getDistance(currentPosition, tile.index);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = tile;
      }
    }

    return nearest.index;
  }

  private getDistance(from: number, to: number): number {
    if (to > from) {
      return to - from;
    } else {
      return (40 - from) + to;
    }
  }

  getNextPosition(currentPosition: number, spaces: number): number {
    return (currentPosition + spaces) % 40;
  }

  getDistanceToGo(position: number): number {
    return position === 0 ? 0 : 40 - position;
  }

  isGoTile(position: number): boolean {
    return position === 0;
  }

  isJailTile(position: number): boolean {
    return position === 10;
  }

  isGoToJailTile(position: number): boolean {
    return position === 30;
  }

  isChanceTile(position: number): boolean {
    const tile = this.getTile(position);
    return tile?.type === 'CHANCE';
  }

  isChestTile(position: number): boolean {
    const tile = this.getTile(position);
    return tile?.type === 'CHEST';
  }

  isTaxTile(position: number): boolean {
    const tile = this.getTile(position);
    return tile?.type === 'TAX';
  }

  isPropertyTile(position: number): boolean {
    const tile = this.getTile(position);
    return tile?.type === 'PROPERTY';
  }

  isRailroadTile(position: number): boolean {
    const tile = this.getTile(position);
    return tile?.type === 'RAILROAD';
  }

  isUtilityTile(position: number): boolean {
    const tile = this.getTile(position);
    return tile?.type === 'UTILITY';
  }

  getTaxAmount(position: number): number {
    const tile = this.getTile(position);
    if (tile?.name === 'Income Tax') {
      return 200; // Standard Monopoly income tax
    } else if (tile?.name === 'Luxury Tax') {
      return 100; // Standard Monopoly luxury tax
    }
    return 0;
  }
}
