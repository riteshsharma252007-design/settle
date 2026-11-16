export async function insertRefreshToken(db, { userId, tokenHash, expiresAt }) {
  const result = await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, tokenHash, expiresAt],
  );
  return result.rows[0].id;
}

export async function findRefreshTokenByHash(db, tokenHash) {
  const result = await db.query(
    `SELECT id, user_id, expires_at, revoked_at
     FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return result.rows[0] ?? null;
}

// Cancels one token, and records which token replaced it (the rotation chain).
// "AND revoked_at IS NULL" makes this safe against two requests using the same
// token at once: only one of them changes a row, and it learns that by the return value.
export async function revokeRefreshToken(db, id, replacedBy = null) {
  const result = await db.query(
    `UPDATE refresh_tokens
     SET revoked_at = now(), replaced_by = $2
     WHERE id = $1 AND revoked_at IS NULL`,
    [id, replacedBy],
  );
  return result.rowCount === 1;
}

// Used by logout: cancel by hash, no need to know the id.
export async function revokeRefreshTokenByHash(db, tokenHash) {
  await db.query(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash],
  );
}

// Used when a revoked token is presented again: someone may have stolen it.
export async function revokeAllRefreshTokensForUser(db, userId) {
  await db.query(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId],
  );
}