// Test setup file
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/monopoly_test';
  process.env.JWT_SECRET = 'test_secret';
});

afterAll(() => {
  // Cleanup after all tests
});
