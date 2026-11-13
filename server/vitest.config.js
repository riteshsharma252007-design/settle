import path from 'node:path';
import { defineConfig } from 'vitest/config';

// The project root is one folder above server/.
const root = path.resolve(import.meta.dirname, '..');

// Order matters: a variable that is already set is NOT overwritten, so the
// test file goes first. That way DATABASE_URL points at settle_test, and
// everything else (secrets and so on) still comes from the normal .env.
process.loadEnvFile(path.join(root, '.env.test'));
process.loadEnvFile(path.join(root, '.env'));

export default defineConfig({
  test: {
    // Runs before each test file: guard, then migrate the test database.
    setupFiles: ['./tests/setup.js'],
    // Test files share one database, so they must run one after another.
    fileParallelism: false,
  },
});