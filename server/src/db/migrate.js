import pool from './pool.js';
import { runMigrations } from './migrator.js';

try {
  await runMigrations(pool);

}catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}finally {
  await pool.end();
}