# Settle: Backend Schema Document

Version 1.0 · 10 Nov 2026 · PostgreSQL 16 or newer · Companion to the PRD, TRD, App Flow, UI/UX Specification and Implementation Plan. This document is the single source of truth for tables, constraints and key queries. Where it refines something said earlier in the conversation (for example time of day stored as minutes), this document wins.

## 1. Conventions

- Plain SQL migrations in server/src/db/migrations, numbered 001, 002 and so on, run in order by a small script that records applied files in a table named schema\_migrations. Never edit an applied migration; add a new one.
- Table and column names are snake\_case. Primary keys are UUIDs made by gen\_random\_uuid() (built in), except messages, which use a BIGINT identity for cheap ordering.
- Every timestamp is TIMESTAMPTZ. Every table that can change has created\_at, and updated\_at where edits happen (kept current by a trigger).
- Foreign keys always state what happens on delete. Deleting a user must remove all their personal data (see section 6).
- Enums are PostgreSQL enum types. Money is whole rupees in INTEGER. Times of day are minutes after midnight in SMALLINT (0 to 1439), which makes the midnight wrap-around maths simple.
- The API converts between database snake\_case and API camelCase, and between 'HH:MM' strings and minutes.

## 2. Entities and relationships

- users 1 to 1 profiles (profile is created empty at registration).
- users 1 to many refresh\_tokens.
- profiles many to many localities through profile\_localities.
- users to users through swipes (who liked or passed whom; one row per pair and direction).
- users to users through matches (one row per mutual like; user\_a\_id is always the smaller UUID).
- matches 1 to many messages.
- users to users through blocks.
- reports point at the reporter, the reported user and optionally a match.

## 3. Migration 001: initial schema

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE gender_type AS ENUM ('woman', 'man', 'non_binary', 'prefer_not_to_say');
CREATE TYPE gender_pref_type AS ENUM ('anyone', 'women_only', 'men_only');
CREATE TYPE guest_freq_type AS ENUM ('rarely', 'sometimes', 'often');
CREATE TYPE diet_type AS ENUM ('vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'flexible');
CREATE TYPE work_mode_type AS ENUM ('work_from_home', 'hybrid', 'office', 'studying');
CREATE TYPE verification_status_type AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE swipe_action AS ENUM ('like', 'pass');
CREATE TYPE match_status AS ENUM ('active', 'closed');
CREATE TYPE report_reason AS ENUM ('fake_profile', 'harassment', 'scam', 'inappropriate_content', 'unsafe_behaviour', 'other');
CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');

CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'user',
  status        user_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_uq ON users (lower(email));
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  replaced_by UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE localities (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (city, name)
);

CREATE TABLE profiles (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 80),
  gender               gender_type,
  flatmate_gender_pref gender_pref_type NOT NULL DEFAULT 'anyone',
  city                 TEXT,
  budget_min           INTEGER CHECK (budget_min >= 0),
  budget_max           INTEGER,
  move_in_date         DATE,
  bedtime_minutes      SMALLINT CHECK (bedtime_minutes BETWEEN 0 AND 1439),
  wake_minutes         SMALLINT CHECK (wake_minutes BETWEEN 0 AND 1439),
  cleanliness          SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
  guest_frequency      guest_freq_type,
  smokes               BOOLEAN,
  ok_with_smokers      BOOLEAN,
  has_pets             BOOLEAN,
  ok_with_pets         BOOLEAN,
  diet                 diet_type,
  work_mode            work_mode_type,
  date_of_birth        DATE,
  occupation           TEXT CHECK (char_length(occupation) <= 80),
  workplace            TEXT CHECK (char_length(workplace) <= 80),
  bio                  TEXT CHECK (char_length(bio) <= 200),
  tags                 TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(tags) <= 6),
  photo_url            TEXT,
  photo_public_id      TEXT,
  verification_status  verification_status_type NOT NULL DEFAULT 'unverified',
  onboarding_step      SMALLINT NOT NULL DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 5),
  profile_completed_at TIMESTAMPTZ,
  is_discoverable      BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min),
  CONSTRAINT profile_complete_requires_fields CHECK (
    profile_completed_at IS NULL OR (
      gender IS NOT NULL AND city IS NOT NULL
      AND budget_min IS NOT NULL AND budget_max IS NOT NULL
      AND move_in_date IS NOT NULL
      AND bedtime_minutes IS NOT NULL AND wake_minutes IS NOT NULL
      AND cleanliness IS NOT NULL AND guest_frequency IS NOT NULL
      AND smokes IS NOT NULL AND ok_with_smokers IS NOT NULL
      AND has_pets IS NOT NULL AND ok_with_pets IS NOT NULL
      AND date_of_birth IS NOT NULL AND photo_url IS NOT NULL
    )
  )
);
CREATE INDEX profiles_discover_idx ON profiles (city, budget_min, budget_max)
  WHERE profile_completed_at IS NOT NULL AND is_discoverable;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE profile_localities (
  user_id     UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  locality_id UUID NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, locality_id)
);
CREATE INDEX profile_localities_locality_idx ON profile_localities (locality_id);

CREATE TABLE swipes (
  swiper_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action     swipe_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (swiper_id, target_id),
  CHECK (swiper_id <> target_id)
);
CREATE INDEX swipes_target_idx ON swipes (target_id, action);

CREATE TABLE matches (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     match_status NOT NULL DEFAULT 'active',
  closed_at  TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a_id < user_b_id),
  UNIQUE (user_a_id, user_b_id)
);
CREATE INDEX matches_user_b_idx ON matches (user_b_id);

CREATE TABLE messages (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id  UUID,
  body       TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, client_id)
);
CREATE INDEX messages_match_idx ON messages (match_id, id DESC);
CREATE INDEX messages_unread_idx ON messages (match_id) WHERE read_at IS NULL;

CREATE TABLE blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX blocks_blocked_idx ON blocks (blocked_id);

CREATE TABLE reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  match_id         UUID REFERENCES matches(id) ON DELETE SET NULL,
  reason           report_reason NOT NULL,
  details          TEXT CHECK (char_length(details) <= 500),
  status           report_status NOT NULL DEFAULT 'open',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reports_status_idx ON reports (status, created_at);
```

Notes for the agent:

- Profile columns are nullable only because onboarding fills them step by step. The constraint profile\_complete\_requires\_fields guarantees that a profile marked complete has every required field.
- The pair (user\_a\_id, user\_b\_id) in matches is always ordered so that user\_a\_id is the smaller UUID. Insert with LEAST and GREATEST (section 5).
- diet and work\_mode are display-only on the profile (UI spec, screen 5). Never use them in matching or filtering.
- occupation holds the job title; workplace holds the company and is shown to other users only after a match.

## 4. Seed data

- Localities for the pilot city (Bengaluru): Koramangala, HSR Layout, Indiranagar, Bellandur, BTM Layout, Domlur, Sarjapur Road, Whitefield, Marathahalli, Jayanagar, JP Nagar, Electronic City, Old Airport Road, Defence Colony. Run as a migration so every environment has them.
- Development seed script (never run in production): about 40 fake profiles with a common development password, placeholder avatars (generated initials, never photos of real people), and these edge cases: bedtimes just before and just after midnight; budgets that touch at exactly one rupee; a smoker who accepts smokers and a non-smoker who does not; a pet owner and a person who is not okay with pets; users with women-only and men-only preferences; a non-binary user; a user with a single locality; a blocked pair; one pair that already matched. Include the three sample people from the UI spec (Rhea Sengupta, Kabir Sharma, Ananya Deshmukh).

## 5. Key queries

### Discover candidates (hard filters H1 to H10 from the TRD)

```sql
WITH me AS (SELECT * FROM profiles WHERE user_id = $1)
SELECT p.*
FROM profiles p
JOIN users u ON u.id = p.user_id
CROSS JOIN me
WHERE p.user_id <> me.user_id
  AND u.status = 'active'
  AND p.profile_completed_at IS NOT NULL
  AND p.is_discoverable
  AND p.city = me.city
  AND p.budget_min <= me.budget_max AND me.budget_min <= p.budget_max
  AND (NOT me.smokes OR p.ok_with_smokers)
  AND (NOT p.smokes OR me.ok_with_smokers)
  AND (NOT me.has_pets OR p.ok_with_pets)
  AND (NOT p.has_pets OR me.ok_with_pets)
  AND (me.flatmate_gender_pref = 'anyone'
       OR (me.flatmate_gender_pref = 'women_only' AND p.gender = 'woman')
       OR (me.flatmate_gender_pref = 'men_only' AND p.gender = 'man'))
  AND (p.flatmate_gender_pref = 'anyone'
       OR (p.flatmate_gender_pref = 'women_only' AND me.gender = 'woman')
       OR (p.flatmate_gender_pref = 'men_only' AND me.gender = 'man'))
  AND EXISTS (
    SELECT 1 FROM profile_localities a
    JOIN profile_localities b ON b.locality_id = a.locality_id
    WHERE a.user_id = me.user_id AND b.user_id = p.user_id)
  AND NOT EXISTS (
    SELECT 1 FROM swipes s WHERE s.swiper_id = me.user_id AND s.target_id = p.user_id)
  AND NOT EXISTS (
    SELECT 1 FROM blocks b
    WHERE (b.blocker_id = me.user_id AND b.blocked_id = p.user_id)
       OR (b.blocker_id = p.user_id AND b.blocked_id = me.user_id))
LIMIT 200;
```

The service then loads each candidate's locality ids, computes the score in JavaScript (TRD section 8), drops scores under 50, sorts and returns 10.

### Like with mutual-match detection (one transaction)

```sql
BEGIN;
-- Serialise the two people so simultaneous likes cannot both miss each other.
SELECT pg_advisory_xact_lock(
  hashtextextended(LEAST($1::uuid, $2::uuid)::text || GREATEST($1::uuid, $2::uuid)::text, 0));

INSERT INTO swipes (swiper_id, target_id, action) VALUES ($1, $2, 'like')
  ON CONFLICT (swiper_id, target_id) DO NOTHING;   -- 0 rows inserted: already swiped, return success

SELECT 1 FROM swipes WHERE swiper_id = $2 AND target_id = $1 AND action = 'like';
-- If a row exists:
INSERT INTO matches (user_a_id, user_b_id)
  VALUES (LEAST($1::uuid, $2::uuid), GREATEST($1::uuid, $2::uuid))
  ON CONFLICT (user_a_id, user_b_id) DO NOTHING
  RETURNING id;
COMMIT;
```

Parameters: $1 = the person who liked, $2 = the person liked. A pass is a plain insert into swipes with action pass and no lock.

### Matches list with last message and unread count

```sql
SELECT m.id, m.created_at,
       CASE WHEN m.user_a_id = $1 THEN m.user_b_id ELSE m.user_a_id END AS other_id,
       last.body AS last_body, last.created_at AS last_at,
       COALESCE(unread.cnt, 0) AS unread_count
FROM matches m
LEFT JOIN LATERAL (
  SELECT body, created_at FROM messages WHERE match_id = m.id ORDER BY id DESC LIMIT 1) last ON true
LEFT JOIN LATERAL (
  SELECT count(*) AS cnt FROM messages
  WHERE match_id = m.id AND sender_id <> $1 AND read_at IS NULL) unread ON true
WHERE (m.user_a_id = $1 OR m.user_b_id = $1) AND m.status = 'active'
ORDER BY COALESCE(last.created_at, m.created_at) DESC;
```

### Chat history (newest first, pages of 30)

```sql
SELECT id, sender_id, body, read_at, created_at
FROM messages
WHERE match_id = $1 AND ($2::bigint IS NULL OR id < $2)
ORDER BY id DESC
LIMIT $3;
```

### Mark read

```sql
UPDATE messages SET read_at = now()
WHERE match_id = $1 AND sender_id <> $2 AND read_at IS NULL;
```

### Block (one transaction)

```sql
INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;
UPDATE matches SET status = 'closed', closed_at = now()
WHERE user_a_id = LEAST($1::uuid, $2::uuid) AND user_b_id = GREATEST($1::uuid, $2::uuid)
  AND status = 'active';
```

### Delete account

`DELETE FROM users WHERE id = $1;` removes the profile, locality links, swipes, matches, messages, blocks and refresh tokens through cascades. The server also deletes the photo from Cloudinary. Reports about or by the user stay with the user columns set to null.

## 6. Data lifecycle and privacy

| Data                                                                             | Rule                                                                                                                          |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Password                                                                         | Only the bcrypt hash is stored; never logged or returned                                                                      |
| Refresh tokens                                                                   | Only the SHA-256 hash is stored; expired and revoked rows are deleted by a daily clean-up                                     |
| Government IDs                                                                   | Not collected in the MVP; no column exists for them                                                                           |
| Messages                                                                         | Kept until either account is deleted or the match is removed by deletion                                                      |
| Reports                                                                          | Kept after account deletion with user references set to null; set a retention period (suggested 12 months) after legal advice |
| Private dealbreakers (ok\_with\_smokers, ok\_with\_pets, flatmate\_gender\_pref) | Never returned by any endpoint that serves another user's profile                                                             |
| Date of birth                                                                    | Returned to other users only as an age number                                                                                 |
| Workplace                                                                        | Returned to the other user only when an active match exists                                                                   |

## 7. Field validation reference (enforced by zod in the API and, where listed, by the database)

| Field                    | Rule                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| email                    | Valid format, up to 254 characters, unique ignoring case (database)                                                       |
| password                 | 8 to 72 characters                                                                                                        |
| full\_name               | 2 to 80 characters (database)                                                                                             |
| budget\_min, budget\_max | Whole rupees from 3,000 to 100,000; max at least min (database for the second rule); the UI slider shows 3,000 to 30,000+ |
| localities               | 1 to 10, all in the user's city                                                                                           |
| move\_in\_date           | Today or later, within 12 months                                                                                          |
| bedtime, wake time       | Valid HH:MM, stored as minutes 0 to 1439 (database)                                                                       |
| cleanliness              | 1 to 5 (database)                                                                                                         |
| date\_of\_birth          | Age 18 or older on the day of saving                                                                                      |
| bio                      | Up to 200 characters (database)                                                                                           |
| tags                     | Up to 6, each up to 24 characters (count in database)                                                                     |
| photo                    | JPEG, PNG or WebP, up to 5 MB                                                                                             |
| message body             | 1 to 2000 characters (database)                                                                                           |
| report details           | Up to 500 characters (database)                                                                                           |

## 8. After the MVP (reference only; do not create these tables now)

```sql
-- Release 2: ID verification
CREATE TABLE verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,
  provider_ref TEXT,
  status      verification_status_type NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
-- Store the provider's reference and result only; do not store the ID images.

-- Release 2: Ready to decide checklist
CREATE TABLE match_checklist (
  match_id     UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item         TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ,
  PRIMARY KEY (match_id, user_id, item)
);
```

Release 3 adds flat listings and payments in their own migrations after legal and finance review.
