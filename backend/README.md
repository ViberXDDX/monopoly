# Monopoly Backend

A production-grade backend for a Monopoly-like board game built with Node.js, TypeScript, Fastify, Socket.IO, PostgreSQL, and Prisma.

## Features

- **Real-time multiplayer** with Socket.IO
- **JWT authentication** with guest mode support
- **Comprehensive game rules engine** with pure TypeScript
- **PostgreSQL database** with Prisma ORM
- **Rate limiting** and security middleware
- **OpenAPI documentation** with Swagger UI
- **Docker support** with docker-compose
- **Comprehensive testing** with Vitest
- **Production-ready** logging and error handling

## Tech Stack

- **Runtime**: Node.js LTS + TypeScript
- **Framework**: Fastify with async/await
- **Real-time**: Socket.IO with namespaces/rooms
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod schemas
- **Auth**: JWT with guest mode
- **Testing**: Vitest + supertest
- **Container**: Docker + docker-compose

## Quick Start

### Using Docker (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd monopoly-backend
   cp env.example .env
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations and seed**:
   ```bash
   docker-compose exec api npm run db:migrate
   docker-compose exec api npm run db:seed
   ```

4. **Access the API**:
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/docs
   - Health Check: http://localhost:3000/health

### Manual Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Setup database**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Create Guest User
```bash
curl -X POST http://localhost:3000/api/v1/auth/guest
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "guest_1234567890_abc123",
    "username": "Guest_xyz789",
    "isGuest": true
  }
}
```

#### Verify Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Games

#### Create Game
```bash
curl -X POST http://localhost:3000/api/v1/games \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "color": "#FF6B6B"
  }'
```

Response:
```json
{
  "game": {
    "id": "clx1234567890",
    "code": "ABC123",
    "status": "LOBBY",
    "currentTurn": 0,
    "settings": { ... },
    "version": 1
  },
  "joinCode": "ABC123"
}
```

#### Join Game
```bash
curl -X POST http://localhost:3000/api/v1/games/GAME_ID/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "color": "#4ECDC4"
  }'
```

#### Start Game
```bash
curl -X POST http://localhost:3000/api/v1/games/GAME_ID/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Game State
```bash
curl -X GET http://localhost:3000/api/v1/games/GAME_ID/state \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Trades

#### Create Trade
```bash
curl -X POST http://localhost:3000/api/v1/games/GAME_ID/trade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toPlayerId": "player2_id",
    "cashFrom": 100,
    "cashTo": 50,
    "fromPropertyIds": ["prop1", "prop2"],
    "toPropertyIds": ["prop3"]
  }'
```

#### Respond to Trade
```bash
curl -X POST http://localhost:3000/api/v1/trades/TRADE_ID/respond \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept"
  }'
```

## Socket.IO Events

### Client → Server

#### Join Room
```javascript
socket.emit('join_room', {
  gameId: 'game_id',
  token: 'jwt_token'
});
```

#### Roll Dice
```javascript
socket.emit('roll_dice', {
  gameId: 'game_id',
  token: 'jwt_token'
});
```

#### Buy Property
```javascript
socket.emit('buy_property', {
  gameId: 'game_id',
  tileId: '1',
  token: 'jwt_token'
});
```

#### End Turn
```javascript
socket.emit('end_turn', {
  gameId: 'game_id',
  token: 'jwt_token'
});
```

#### Send Chat
```javascript
socket.emit('chat', {
  gameId: 'game_id',
  message: 'Hello everyone!',
  token: 'jwt_token'
});
```

### Server → Client

#### Dice Rolled
```javascript
socket.on('dice_rolled', (data) => {
  console.log(`${data.playerName} rolled ${data.dice.total}`);
  // Apply patches to game state
});
```

#### Property Bought
```javascript
socket.on('property_bought', (data) => {
  console.log(`${data.playerName} bought property`);
  // Apply patches to game state
});
```

#### Turn Ended
```javascript
socket.on('turn_ended', (data) => {
  console.log(`Turn ended, next: ${data.nextPlayer}`);
  // Apply patches to game state
});
```

#### Chat Message
```javascript
socket.on('chat', (data) => {
  console.log(`${data.playerName}: ${data.message}`);
});
```

#### Error
```javascript
socket.on('error', (data) => {
  console.error(`Socket error: ${data.message}`);
});
```

## Game Rules

The backend implements a comprehensive Monopoly game engine with:

### Core Mechanics
- **Dice rolling** with doubles handling
- **Movement** around 40-tile board
- **Property purchasing** and ownership
- **Rent calculation** with color sets, houses, hotels
- **Building** houses and hotels with even-building rule
- **Mortgaging** and unmortgaging with interest
- **Jail system** with fine, cards, and doubles
- **Chance and Community Chest** cards
- **Auctions** for unsold properties
- **Trading** between players
- **Bankruptcy** handling

### Tile Types
- **GO** - Collect $200
- **Property** - Purchasable with rent
- **Railroad** - Rent based on ownership count
- **Utility** - Rent based on dice roll
- **Tax** - Income Tax ($200) and Luxury Tax ($100)
- **Chance** - Random card effects
- **Community Chest** - Random card effects
- **Jail** - Visiting jail
- **Go to Jail** - Sent to jail
- **Free Parking** - Collect pot (if enabled)

### Rent Calculation
- **Base rent** for unimproved properties
- **Double rent** for complete color sets
- **House rent** with multipliers (2x, 3x, 4x, 5x)
- **Hotel rent** (typically 5x base rent)
- **Railroad rent** (25 × number owned)
- **Utility rent** (4× or 10× dice roll)

## Development

### Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start           # Start production server

# Database
npm run db:migrate  # Run migrations
npm run db:seed     # Seed database
npm run db:generate # Generate Prisma client
npm run db:studio   # Open Prisma Studio

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code with Prettier

# Docker
npm run docker:up   # Start Docker services
npm run docker:down # Stop Docker services
```

### Project Structure

```
src/
├── core/           # Pure game logic
│   ├── data/       # Board and card data
│   ├── engine.ts   # Game rules engine
│   ├── board.ts    # Board utilities
│   ├── dice.ts     # Dice utilities
│   └── types.ts    # TypeScript types
├── db/             # Database layer
│   ├── client.ts   # Prisma client
│   └── repositories/ # Data access
├── features/       # Feature modules
│   ├── auth/       # Authentication
│   ├── games/      # Game management
│   └── trades/     # Trading system
├── adapters/       # External integrations
│   └── socket/     # Socket.IO handlers
├── utils/          # Utilities
│   ├── auth.ts     # JWT utilities
│   ├── env.ts      # Environment config
│   ├── logger.ts   # Logging
│   ├── errors.ts   # Error handling
│   └── validation.ts # Zod schemas
└── server.ts       # Main server file
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/monopoly"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
GUEST_TOKEN_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=300000

# Socket.IO
SOCKET_HEARTBEAT_INTERVAL=25000
SOCKET_HEARTBEAT_TIMEOUT=60000

# Game Settings
DEFAULT_STARTING_CASH=1500
DEFAULT_HOUSE_LIMIT=32
DEFAULT_HOTEL_LIMIT=12
```

## Testing

The project includes comprehensive tests for:

- **Game engine** rules and logic
- **Board** utilities and tile management
- **Dice** rolling and validation
- **API endpoints** with supertest
- **Socket.IO** event handling

Run tests:
```bash
npm test
```

## Production Deployment

### Docker

1. **Build and deploy**:
   ```bash
   docker-compose up -d
   ```

2. **Environment setup**:
   - Update `.env` with production values
   - Set strong `JWT_SECRET`
   - Configure database URL
   - Set `NODE_ENV=production`

### Manual Deployment

1. **Build application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

### Health Monitoring

- **Health check**: `GET /health`
- **Logs**: Structured JSON logs with Pino
- **Metrics**: Request timing and error rates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the test files for usage examples
