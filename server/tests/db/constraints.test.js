import { beforeEach, describe, expect, it } from 'vitest';
import pool from '../../src/db/pool.js';

// Fills in every field a "complete" profile needs. $1 = user id, $2 = photo url.
const COMPLETE_PROFILE_SQL = `
  UPDATE profiles SET
    gender = 'woman', city = 'Bengaluru',
    budget_min = 10000, budget_max = 20000,
    move_in_date = '2027-01-01',
    bedtime_minutes = 1380, wake_minutes = 420,
    cleanliness = 3, guest_frequency = 'sometimes',
    smokes = false, ok_with_smokers = true,
    has_pets = false, ok_with_pets = true,
    date_of_birth = '2000-01-01',
    photo_url = $2,
    profile_completed_at = now()
  WHERE user_id = $1
`;

// A user plus the barely-filled profile row that registration will create later.
async function createUserWithEmptyProfile() {
  const user = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ('test@example.com', 'not-a-real-hash') RETURNING id`,
  );
  const id = user.rows[0].id;
  await pool.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [
    id,
    'Test Person',
  ]);
  return id;
}

describe('database safety nets', () => {
  // Start every test from empty tables. Localities stay, because they
  // are seed data, not test data.
  beforeEach(async () => {
    await pool.query('TRUNCATE users CASCADE');
  });

  it('rejects a budget where max is below min', async () => {
    const id = await createUserWithEmptyProfile();

    await expect(
      pool.query('UPDATE profiles SET budget_min = 20000, budget_max = 10000 WHERE user_id = $1', [id]),
    ).rejects.toThrow(/profiles_check/);

    // Control: a range where min and max touch is allowed.
    await pool.query('UPDATE profiles SET budget_min = 10000, budget_max = 10000 WHERE user_id = $1', [id]);
  });

  it('rejects cleanliness 7', async () => {
    const id = await createUserWithEmptyProfile();

    await expect(
      pool.query('UPDATE profiles SET cleanliness = 7 WHERE user_id = $1', [id]),
    ).rejects.toThrow(/profiles_cleanliness_check/);

    // Control: 5 is the highest valid level.
    await pool.query('UPDATE profiles SET cleanliness = 5 WHERE user_id = $1', [id]);
  });

  it('rejects a complete profile that has no photo', async () => {
    const id = await createUserWithEmptyProfile();

    await expect(pool.query(COMPLETE_PROFILE_SQL, [id, null])).rejects.toThrow(
      /profile_complete_requires_fields/,
    );

    // Control: the very same update succeeds once a photo is present.
    await pool.query(COMPLETE_PROFILE_SQL, [id, 'https://example.com/photo.jpg']);
  });
});