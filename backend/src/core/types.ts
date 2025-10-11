export interface BoardTile {
  index: number;
  type: TileType;
  name: string;
  color?: string;
  price?: number;
  baseRent?: number;
  groupKey?: string;
  railroadGroup?: string;
  utilityGroup?: string;
}

export interface Card {
  id: string;
  type: string;
  description: string;
  target?: number;
  amount?: number;
  spaces?: number;
  houseCost?: number;
  hotelCost?: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  currentTurn: number;
  players: PlayerState[];
  tiles: BoardTile[];
  properties: PropertyState[];
  settings: GameSettings;
  version: number;
  freeParkingPot: number;
  chanceDeck: Card[];
  chestDeck: Card[];
  chanceDiscard: Card[];
  chestDiscard: Card[];
  activeAuction?: AuctionState;
}

export interface PlayerState {
  id: string;
  userId?: string;
  name: string;
  cash: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  doublesInRow: number;
  bankrupt: boolean;
  order: number;
  color: string;
  isConnected: boolean;
  getOutOfJailCards: number;
}

export interface PropertyState {
  id: string;
  tileId: string;
  ownerId?: string;
  mortgaged: boolean;
  houses: number;
  hotel: boolean;
}

export interface AuctionState {
  tileId: string;
  currentBid: number;
  currentBidder?: string;
  endsAt: number;
  bidders: string[];
}

export interface GameSettings {
  startingCash: number;
  houseLimit: number;
  hotelLimit: number;
  freeParkingRule: 'none' | 'taxes' | 'fines';
  auctionOnNoBuy: boolean;
  jailFine: number;
  mortgageInterest: number;
}

export interface DiceRoll {
  d1: number;
  d2: number;
  total: number;
  isDouble: boolean;
}

export interface MoveResult {
  newPosition: number;
  passedGo: boolean;
  landedOnGo: boolean;
}

export interface TileEffect {
  type: 'rent' | 'tax' | 'card' | 'jail' | 'go_to_jail' | 'free_parking' | 'go';
  amount?: number;
  cardId?: string;
  description?: string;
}

export interface GamePatch {
  type: 'player_update' | 'property_update' | 'game_update' | 'log_add' | 'auction_start' | 'auction_end';
  playerId?: string;
  propertyId?: string;
  data: any;
}

export interface TradeProposal {
  fromId: string;
  toId: string;
  cashFrom: number;
  cashTo: number;
  fromPropertyIds: string[];
  toPropertyIds: string[];
}

export interface BankruptcyResult {
  bankruptPlayerId: string;
  creditorId?: string;
  assetsTransferred: boolean;
  gameEnded: boolean;
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export enum TileType {
  GO = 'GO',
  PROPERTY = 'PROPERTY',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY',
  TAX = 'TAX',
  CHANCE = 'CHANCE',
  CHEST = 'CHEST',
  JAIL = 'JAIL',
  GO_TO_JAIL = 'GO_TO_JAIL',
  FREE_PARKING = 'FREE_PARKING'
}

export enum TradeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface GameEngine {
  startGame(gameId: string, players: PlayerState[], settings: GameSettings): GamePatch[];
  rollDice(playerId: string, state: GameState): { dice: DiceRoll; patches: GamePatch[] };
  movePlayer(playerId: string, spaces: number, state: GameState): MoveResult;
  applyTileEffect(playerId: string, tileIndex: number, state: GameState): TileEffect;
  canBuyProperty(playerId: string, tileId: string, state: GameState): boolean;
  buyProperty(playerId: string, tileId: string, state: GameState): GamePatch[];
  startAuction(tileId: string, state: GameState): GamePatch[];
  bidOnAuction(playerId: string, amount: number, state: GameState): GamePatch[];
  endAuction(state: GameState): GamePatch[];
  canBuildHouse(playerId: string, tileId: string, state: GameState): boolean;
  buildHouse(playerId: string, tileId: string, state: GameState): GamePatch[];
  canBuildHotel(playerId: string, tileId: string, state: GameState): boolean;
  buildHotel(playerId: string, tileId: string, state: GameState): GamePatch[];
  mortgageProperty(playerId: string, tileId: string, state: GameState): GamePatch[];
  unmortgageProperty(playerId: string, tileId: string, state: GameState): GamePatch[];
  handleJail(playerId: string, action: 'pay' | 'card' | 'roll', state: GameState): GamePatch[];
  processBankruptcy(playerId: string, state: GameState): BankruptcyResult;
  endTurn(playerId: string, state: GameState): GamePatch[];
  drawCard(playerId: string, deck: 'chance' | 'chest', state: GameState): { card: Card; patches: GamePatch[] };
}
