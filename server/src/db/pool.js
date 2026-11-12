import pg from 'pg';
import { config } from '../config.js';

// One shared pool for the whole server. Opening a connection is slow,
// so we keep a few open and lend them out instead of opening one per request.
const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10, // never more than 10 connections from this server
});

// If an idle connection breaks (for example PostgreSQL restarts), the pool
// emits an 'error' event. Without a listener Node would crash the whole server.
pool.on('error', (err) => {
  // Log only the message: the full error object can contain the connection string.
  console.error('Unexpected database pool error:', err.message);
});

export default pool;