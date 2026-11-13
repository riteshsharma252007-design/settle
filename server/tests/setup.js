import { afterAll, beforeAll } from 'vitest';
import { config } from '../src/config.js';
import pool from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrator.js';

// Seatbelt: refuse to run against anything that is not a test database.
const databaseName = new URL(config.databaseUrl).pathname.slice(1);
if (!databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to run tests: database "${databaseName}" does not end in _test.`,
  );
}

// Bring the test database up to date (a fresh one gets 001 and 002 applied).
beforeAll(async () => {
  await runMigrations(pool);
});

// Close the connections so the test run can exit.
afterAll(async () => {
  await pool.end();
});