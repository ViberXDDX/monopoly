import { envsafe, str, num, bool } from 'env-safe';

export const env = envsafe({
  DATABASE_URL: str({
    desc: 'PostgreSQL database URL',
    example: 'postgresql://postgres:postgres@localhost:5432/monopoly',
  }),
  JWT_SECRET: str({
    desc: 'JWT secret for token signing',
    example: 'dev_secret_change_in_production',
  }),
  JWT_EXPIRES_IN: str({
    desc: 'JWT token expiration time',
    default: '7d',
    example: '7d',
  }),
  GUEST_TOKEN_EXPIRES_IN: str({
    desc: 'Guest token expiration time',
    default: '24h',
    example: '24h',
  }),
  PORT: num({
    desc: 'Server port',
    default: 3000,
    example: 3000,
  }),
  NODE_ENV: str({
    desc: 'Node environment',
    default: 'development',
    choices: ['development', 'production', 'test'],
  }),
  RATE_LIMIT_MAX: num({
    desc: 'Rate limit max requests',
    default: 100,
    example: 100,
  }),
  RATE_LIMIT_TIME_WINDOW: num({
    desc: 'Rate limit time window in milliseconds',
    default: 300000, // 5 minutes
    example: 300000,
  }),
  SOCKET_HEARTBEAT_INTERVAL: num({
    desc: 'Socket.IO heartbeat interval in milliseconds',
    default: 25000,
    example: 25000,
  }),
  SOCKET_HEARTBEAT_TIMEOUT: num({
    desc: 'Socket.IO heartbeat timeout in milliseconds',
    default: 60000,
    example: 60000,
  }),
  DEFAULT_STARTING_CASH: num({
    desc: 'Default starting cash for players',
    default: 1500,
    example: 1500,
  }),
  DEFAULT_HOUSE_LIMIT: num({
    desc: 'Default house limit per game',
    default: 32,
    example: 32,
  }),
  DEFAULT_HOTEL_LIMIT: num({
    desc: 'Default hotel limit per game',
    default: 12,
    example: 12,
  }),
});
