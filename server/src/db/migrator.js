import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Where this file lives, so we can find the migrations folder next to it.
const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(here, 'migrations');

export async function runMigrations(pool) {
  // A transaction must stay on ONE connection, so we borrow one for the whole job.
  const client = await pool.connect();
  try {
    // The checklist table. IF NOT EXISTS makes this safe to run every time.
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Every .sql file in the folder, in name order (001 before 002).
    const files = (await readdir(migrationsDir))
      .filter((name) => name.endsWith('.sql'))
      .sort();

    // Which ones have already been ticked off?
    const appliedResult = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(appliedResult.rows.map((row) => row.filename));

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = await readFile(path.join(migrationsDir, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
        count += 1;
      } catch (err) {
        // Undo everything this file did, then stop: never run later files after a failure.
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }

    if (count === 0) console.log('No new migrations to apply.');
  } finally {
    // Always hand the connection back, even if something above threw.
    client.release();
  }
}