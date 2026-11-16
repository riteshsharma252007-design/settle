// Every function takes "db" first: the shared pool, or one connection that is
// inside a transaction. Both have .query(), so the same function works for both.

export async function insertUser(db, { email, passwordHash }) {
  const result = await db.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, role, status`,
    [email, passwordHash],
  );
  return result.rows[0];
}

// Compared case-insensitively, the same way the unique index works.
export async function findUserByEmail(db, email) {
  const result = await db.query(
    `SELECT id, email, password_hash, role, status
     FROM users WHERE lower(email) = lower($1)`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(db, id) {
  const result = await db.query(
    'SELECT id, email, role, status FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}