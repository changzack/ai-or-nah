-- AI or Nah - Initial Schema
-- Results cache, image storage references, and rate limiting

-- Results table: cached analysis per username
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  ai_likelihood_score INTEGER NOT NULL CHECK (ai_likelihood_score >= 0 AND ai_likelihood_score <= 100),
  verdict TEXT NOT NULL CHECK (verdict IN ('real', 'unclear', 'likely_fake', 'almost_definitely_fake')),
  image_analysis_score REAL NOT NULL,
  images_analyzed_count INTEGER NOT NULL,
  profile_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  consistency_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  bottom_line TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Result images: references to stored image files
CREATE TABLE IF NOT EXISTS result_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- Public Supabase storage URL
  storage_path TEXT NOT NULL, -- Path in storage bucket
  position INTEGER NOT NULL, -- Order in grid (0-indexed)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rate limits: track fresh checks per IP per day
CREATE TABLE IF NOT EXISTS ip_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  check_count INTEGER NOT NULL DEFAULT 0,
  reset_date DATE NOT NULL, -- PST date for daily reset
  last_check_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ip_address, reset_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_results_username ON results(username);
CREATE INDEX IF NOT EXISTS idx_results_last_accessed ON results(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_result_images_result_id ON result_images(result_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_date ON ip_rate_limits(ip_address, reset_date);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER results_updated_at
  BEFORE UPDATE ON results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rate_limits_updated_at
  BEFORE UPDATE ON ip_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
