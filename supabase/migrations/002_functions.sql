-- Additional database functions for AI or Nah

-- Function to increment rate limit check count
CREATE OR REPLACE FUNCTION increment_rate_limit(ip TEXT, date DATE)
RETURNS void AS $$
BEGIN
  UPDATE ip_rate_limits
  SET
    check_count = check_count + 1,
    last_check_at = NOW()
  WHERE ip_address = ip AND reset_date = date;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count (for future use)
CREATE OR REPLACE FUNCTION increment_view_count(result_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE results
  SET view_count = view_count + 1
  WHERE id = result_uuid;
END;
$$ LANGUAGE plpgsql;
