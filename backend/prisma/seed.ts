import { PrismaClient } from '@prisma/client';
import { Board } from '../src/core/board';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  });

  console.log('✅ Created users:', { user1: user1.username, user2: user2.username });

  // Create sample game
  const game = await prisma.game.create({
    data: {
      code: 'DEMO01',
      status: 'LOBBY',
      currentTurn: 0,
      settings: {
        startingCash: 1500,
        houseLimit: 32,
        hotelLimit: 12,
        freeParkingRule: 'taxes',
        auctionOnNoBuy: true,
        jailFine: 50,
        mortgageInterest: 0.1,
      },
      players: {
        create: [
          {
            userId: user1.id,
            name: 'Alice',
            cash: 1500,
            position: 0,
            order: 0,
            color: '#FF6B6B',
          },
          {
            userId: user2.id,
            name: 'Bob',
            cash: 1500,
            position: 0,
            order: 1,
            color: '#4ECDC4',
          },
        ],
      },
    },
  });

  console.log('✅ Created game:', { id: game.id, code: game.code });

  // Initialize board tiles
  const board = Board.getInstance();
  const tiles = board.getAllTiles();

  console.log('🎯 Creating board tiles...');

  for (const tile of tiles) {
    await prisma.tile.create({
      data: {
        gameId: game.id,
        index: tile.index,
        type: tile.type as any,
        name: tile.name,
        color: tile.color,
        price: tile.price,
        baseRent: tile.baseRent,
        groupKey: tile.groupKey,
        railroadGroup: tile.railroadGroup,
        utilityGroup: tile.utilityGroup,
      },
    });
  }

  console.log('✅ Created board tiles:', tiles.length);

  // Initialize properties for purchasable tiles
  const purchasableTiles = tiles.filter(tile =>
    ['PROPERTY', 'RAILROAD', 'UTILITY'].includes(tile.type)
  );

  console.log('🏠 Creating properties...');

  for (const tile of purchasableTiles) {
    await prisma.property.create({
      data: {
        gameId: game.id,
        tileId: tile.index.toString(),
        ownerId: null,
        mortgaged: false,
        houses: 0,
        hotel: false,
      },
    });
  }

  console.log('✅ Created properties:', purchasableTiles.length);

  // Add some sample game logs
  await prisma.gameLog.create({
    data: {
      gameId: game.id,
      actorId: null,
      type: 'game_created',
      payload: {
        message: 'Demo game created for testing',
        players: ['Alice', 'Bob'],
      },
    },
  });

  await prisma.gameLog.create({
    data: {
      gameId: game.id,
      actorId: user1.id,
      type: 'player_joined',
      payload: {
        playerName: 'Alice',
        color: '#FF6B6B',
      },
    },
  });

  await prisma.gameLog.create({
    data: {
      gameId: game.id,
      actorId: user2.id,
      type: 'player_joined',
      payload: {
        playerName: 'Bob',
        color: '#4ECDC4',
      },
    },
  });

  console.log('✅ Created game logs');

  // Create a sample trade
  const players = await prisma.player.findMany({
    where: { gameId: game.id },
    orderBy: { order: 'asc' },
  });

  if (players.length >= 2) {
    const trade = await prisma.trade.create({
      data: {
        gameId: game.id,
        fromId: players[0].id,
        toId: players[1].id,
        status: 'PENDING',
        cashFrom: 100,
        cashTo: 50,
        fromPropertyIds: [],
        toPropertyIds: [],
      },
    });

    console.log('✅ Created sample trade:', { id: trade.id });
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log(`   Users: 2 (${user1.username}, ${user2.username})`);
  console.log(`   Game: ${game.code} (${game.id})`);
  console.log(`   Tiles: ${tiles.length}`);
  console.log(`   Properties: ${purchasableTiles.length}`);
  console.log(`   Players: ${players.length}`);
  console.log('');
  console.log('🚀 You can now start the server and test the API!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
