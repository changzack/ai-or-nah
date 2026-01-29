-- Migration: User Checks Tracking
-- Purpose: Track which users (anonymous or authenticated) have checked which usernames
-- This enables same-user cache policy: same user checking same username = free

-- Create user_checks table
CREATE TABLE IF NOT EXISTS user_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Device fingerprint for anonymous users
  device_fingerprint TEXT,

  -- Customer ID for authenticated users
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Instagram username that was checked
  username TEXT NOT NULL,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints: Either fingerprint+username OR customer+username must be unique
  -- This prevents duplicate tracking for the same user+username combination
  CONSTRAINT unique_device_check UNIQUE NULLS NOT DISTINCT (device_fingerprint, username),
  CONSTRAINT unique_customer_check UNIQUE NULLS NOT DISTINCT (customer_id, username),

  -- Ensure at least one identifier is present
  CONSTRAINT check_has_identifier CHECK (
    device_fingerprint IS NOT NULL OR customer_id IS NOT NULL
  )
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_checks_fingerprint ON user_checks(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_checks_customer ON user_checks(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_checks_username ON user_checks(username);
CREATE INDEX IF NOT EXISTS idx_user_checks_created_at ON user_checks(created_at);

-- Comments for documentation
COMMENT ON TABLE user_checks IS 'Tracks which users have checked which Instagram usernames for same-user cache policy';
COMMENT ON COLUMN user_checks.device_fingerprint IS 'Device fingerprint for anonymous users (FingerprintJS)';
COMMENT ON COLUMN user_checks.customer_id IS 'Customer ID for authenticated users';
COMMENT ON COLUMN user_checks.username IS 'Instagram username that was checked';
COMMENT ON COLUMN user_checks.created_at IS 'When the check was performed';

-- Function to migrate anonymous checks to customer account
-- Called when a user authenticates, to link their previous checks to their account
CREATE OR REPLACE FUNCTION migrate_user_checks(
  p_fingerprint TEXT,
  p_customer_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update all checks with this fingerprint to associate with customer
  -- For checks where customer already has that username, delete the fingerprint version
  DELETE FROM user_checks
  WHERE device_fingerprint = p_fingerprint
  AND username IN (
    SELECT username FROM user_checks WHERE customer_id = p_customer_id
  );

  -- Update remaining fingerprint checks to customer_id
  UPDATE user_checks
  SET customer_id = p_customer_id,
      device_fingerprint = NULL
  WHERE device_fingerprint = p_fingerprint;
END;
$$;

COMMENT ON FUNCTION migrate_user_checks IS 'Migrate anonymous user checks to authenticated customer account';
