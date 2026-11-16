-- Settle: migration 003, a profile may exist before the person types their name.
-- Registration creates an empty profile; onboarding step 1 fills in the name.

ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;

-- A constraint cannot be edited, so remove it and add the new version.
ALTER TABLE profiles DROP CONSTRAINT profile_complete_requires_fields;

ALTER TABLE profiles ADD CONSTRAINT profile_complete_requires_fields CHECK (
  profile_completed_at IS NULL OR (
    full_name IS NOT NULL AND gender IS NOT NULL AND city IS NOT NULL
    AND budget_min IS NOT NULL AND budget_max IS NOT NULL
    AND move_in_date IS NOT NULL
    AND bedtime_minutes IS NOT NULL AND wake_minutes IS NOT NULL
    AND cleanliness IS NOT NULL AND guest_frequency IS NOT NULL
    AND smokes IS NOT NULL AND ok_with_smokers IS NOT NULL
    AND has_pets IS NOT NULL AND ok_with_pets IS NOT NULL
    AND date_of_birth IS NOT NULL AND photo_url IS NOT NULL
  )
);