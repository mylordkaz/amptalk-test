import { beforeAll, afterAll, vi } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Don't mock console - we want to see errors during development
// beforeAll(() => {
//   vi.spyOn(console, 'log').mockImplementation(() => {});
//   vi.spyOn(console, 'error').mockImplementation(() => {});
// });

afterAll(() => {
  vi.restoreAllMocks();
});
