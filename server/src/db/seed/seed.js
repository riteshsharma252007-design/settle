import bcrypt from 'bcryptjs';
import { config } from '../../config.js';
import pool from '../pool.js';
import { BLOCKED_PAIR, MATCHED_PAIR, PEOPLE, SEED_EMAIL_DOMAIN } from './people.js';

// One shared password for every fake person, so you can log in as any of them.
const DEV_PASSWORD = 'DevPassword123';

// "Rhea Sengupta" becomes "rhea.sengupta@seed.settle.test".
function emailFor(name) {
  return `${name.toLowerCase().replaceAll(' ', '.')}@${SEED_EMAIL_DOMAIN}`;
}

// A small square with the person's initials. Never a photo of a real person.
function avatarFor(name) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
    '<rect width="400" height="400" fill="#0B6B5D"/>' +
    '<text x="200" y="200" font-family="Arial, sans-serif" font-size="150" ' +
    'fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">' +
    `${initials}</text></svg>`;
  // encodeURIComponent makes characters like < > # safe to put inside a URL.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Today plus N days, as the 'YYYY-MM-DD' text the database expects.
function isoDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

// Birth date for a given age. June 15 keeps everyone safely 18 or older.
function birthDateFor(age) {
  return `${new Date().getFullYear() - age}-06-15`;
}

async function seed() {
  // Seatbelt: fake people must never reach a real database.
  if (config.nodeEnv === 'production') {
    throw new Error('Refusing to seed: NODE_ENV is production.');
  }

  // bcrypt is slow on purpose, so hash once and reuse it for all 40 people.
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove people from earlier runs, so this script can be run again.
    await client.query('DELETE FROM users WHERE email LIKE $1', [`%@${SEED_EMAIL_DOMAIN}`]);

    // Look up locality ids once: name -> id.
    const localityRows = await client.query('SELECT id, name FROM localities WHERE city = $1', [
      'Bengaluru',
    ]);
    const localityIdByName = new Map(localityRows.rows.map((row) => [row.name, row.id]));

    // Remember each person's new id, so we can link people together later.
    const userIdByName = new Map();

    for (const person of PEOPLE) {
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [emailFor(person.name), passwordHash],
      );
      const userId = userResult.rows[0].id;
      userIdByName.set(person.name, userId);

      await client.query(
        `INSERT INTO profiles (
           user_id, full_name, gender, flatmate_gender_pref, city,
           budget_min, budget_max, move_in_date,
           bedtime_minutes, wake_minutes, cleanliness, guest_frequency,
           smokes, ok_with_smokers, has_pets, ok_with_pets,
           date_of_birth, occupation, workplace, bio, tags,
           photo_url, onboarding_step, profile_completed_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
           $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
           $22, 5, now()
         )`,
        [
          userId,
          person.name,
          person.gender,
          person.genderPref,
          person.city,
          person.budgetMin,
          person.budgetMax,
          isoDate(person.moveInDays),
          person.bedtime,
          person.wake,
          person.cleanliness,
          person.guests,
          person.smokes,
          person.okWithSmokers,
          person.hasPets,
          person.okWithPets,
          birthDateFor(person.age),
          person.occupation,
          person.workplace,
          person.bio,
          person.tags,
          avatarFor(person.name),
        ],
      );

      for (const localityName of person.localities) {
        const localityId = localityIdByName.get(localityName);
        if (!localityId) {
          throw new Error(`Unknown locality "${localityName}" for ${person.name}`);
        }
        await client.query(
          'INSERT INTO profile_localities (user_id, locality_id) VALUES ($1, $2)',
          [userId, localityId],
        );
      }
    }

    // A blocked pair: one person has blocked the other.
    await client.query('INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2)', [
      userIdByName.get(BLOCKED_PAIR.blocker),
      userIdByName.get(BLOCKED_PAIR.blocked),
    ]);

    // A matched pair: both liked each other, so a match and a chat exist.
    const [firstId, secondId] = MATCHED_PAIR.map((name) => userIdByName.get(name));
    await client.query(
      `INSERT INTO swipes (swiper_id, target_id, action)
       VALUES ($1, $2, 'like'), ($2, $1, 'like')`,
      [firstId, secondId],
    );
    const matchResult = await client.query(
      `INSERT INTO matches (user_a_id, user_b_id)
       VALUES (LEAST($1::uuid, $2::uuid), GREATEST($1::uuid, $2::uuid))
       RETURNING id`,
      [firstId, secondId],
    );
    const matchId = matchResult.rows[0].id;

    const conversation = [
      [firstId, 'Hey! Saw you are also looking around Koramangala.'],
      [secondId, 'Hi! Yes, hoping to move in next month. You?'],
      [firstId, 'Same here. Want to chat more this weekend?'],
    ];
    for (const [senderId, body] of conversation) {
      await client.query(
        `INSERT INTO messages (match_id, sender_id, client_id, body)
         VALUES ($1, $2, gen_random_uuid(), $3)`,
        [matchId, senderId, body],
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${PEOPLE.length} people.`);
    console.log(`Example login: ${emailFor('Rhea Sengupta')} / ${DEV_PASSWORD}`);
  } catch (err) {
    // Undo everything, so a half-finished seed never stays in the database.
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

try {
  await seed();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}