-- Settle: migration 001, initial schema.
-- Run by server/src/db/migrate.js inside one transaction.

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