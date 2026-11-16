// Registration creates the profile row empty; onboarding fills it in step by step.
export async function insertEmptyProfile(db, userId) {
  await db.query('INSERT INTO profiles (user_id) VALUES ($1)', [userId]);
}

// What the app needs to decide where to send a logged-in user.
export async function findOnboardingState(db, userId) {
  const result = await db.query(
    `SELECT onboarding_step, profile_completed_at IS NOT NULL AS profile_complete
     FROM profiles WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}