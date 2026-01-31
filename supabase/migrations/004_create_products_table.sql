-- Create products table for managing Stripe product configuration
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_price_id_test TEXT,
  stripe_price_id_live TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access (needed for checkout)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (active = true);

-- Only authenticated users can manage products (for future admin panel)
CREATE POLICY "Only authenticated users can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert initial products with test price IDs
INSERT INTO products (id, name, credits, price_cents, stripe_price_id_test, display_order) VALUES
  ('small', '5 Credits', 5, 299, 'price_1SuY7aEPQiohye3M4xMFSpaw', 1),
  ('medium', '15 Credits', 15, 699, 'price_1SuY8QEPQiohye3M55eT2FBk', 2),
  ('large', '50 Credits', 50, 1499, 'price_1SuY8lEPQiohye3MGzhhWNYU', 3)
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comment
COMMENT ON TABLE products IS 'Stores product configuration including Stripe price IDs for test and production environments';
