-- Settle: migration 002, pilot city localities (Bengaluru).
-- Cities and localities are data, so they live in the database, not in code.

INSERT INTO localities (city, name) VALUES
  ('Bengaluru', 'Koramangala'),
  ('Bengaluru', 'HSR Layout'),
  ('Bengaluru', 'Indiranagar'),
  ('Bengaluru', 'Bellandur'),
  ('Bengaluru', 'BTM Layout'),
  ('Bengaluru', 'Domlur'),
  ('Bengaluru', 'Sarjapur Road'),
  ('Bengaluru', 'Whitefield'),
  ('Bengaluru', 'Marathahalli'),
  ('Bengaluru', 'Jayanagar'),
  ('Bengaluru', 'JP Nagar'),
  ('Bengaluru', 'Electronic City'),
  ('Bengaluru', 'Old Airport Road'),
  ('Bengaluru', 'Defence Colony')
ON CONFLICT (city, name) DO NOTHING;