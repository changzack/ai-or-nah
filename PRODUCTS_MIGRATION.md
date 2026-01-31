# Products Migration Guide

## What Changed

Product configuration has been moved from environment variables to Supabase database for better portability and management.

### Before (Environment Variables)
```bash
STRIPE_PRICE_SMALL=price_xxxxx
STRIPE_PRICE_MEDIUM=price_xxxxx
STRIPE_PRICE_LARGE=price_xxxxx
```

### After (Supabase Database)
```sql
-- Products table stores all configuration
SELECT * FROM products;
```

## Benefits

✅ **Portable** - Works on any hosting platform (Vercel, AWS, etc.)
✅ **Dynamic** - Update prices without redeploying
✅ **Scalable** - Add new product tiers easily
✅ **Environment-aware** - One table handles both test and production
✅ **Auditable** - Track changes with updated_at timestamps

---

## Running the Migration

### 1. Apply the Migration to Supabase

Run the migration file in your Supabase SQL editor:

**File:** `supabase/migrations/004_create_products_table.sql`

Or use Supabase CLI:
```bash
supabase db push
```

This will:
- Create the `products` table
- Seed with your existing test price IDs
- Set up RLS policies

### 2. Verify Migration

Check that products were created:
```sql
SELECT * FROM products;
```

You should see:
- `small`: 5 credits, $2.99
- `medium`: 15 credits, $6.99
- `large`: 50 credits, $14.99

### 3. Remove Old Environment Variables (Optional)

You can now remove these from `.env.local` and Vercel (they're ignored now):
- ~~`STRIPE_PRICE_SMALL`~~
- ~~`STRIPE_PRICE_MEDIUM`~~
- ~~`STRIPE_PRICE_LARGE`~~

**Keep these** (still needed):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Adding Production Price IDs

Once you create products in Stripe Live mode:

### Option A: Via SQL

```sql
UPDATE products
SET stripe_price_id_live = 'price_LIVE_ID_HERE'
WHERE id = 'small';

UPDATE products
SET stripe_price_id_live = 'price_LIVE_ID_HERE'
WHERE id = 'medium';

UPDATE products
SET stripe_price_id_live = 'price_LIVE_ID_HERE'
WHERE id = 'large';
```

### Option B: Via Supabase Dashboard

1. Go to Supabase → Table Editor → `products`
2. Edit each row
3. Add the `stripe_price_id_live` value
4. Save

---

## How Environment Detection Works

The system automatically selects the correct price ID:

```typescript
// Automatically uses production IDs when:
// - NODE_ENV === "production"
// - NEXT_PUBLIC_SITE_URL includes "aiornah.xyz"

const priceId = isProduction
  ? product.stripe_price_id_live   // Production
  : product.stripe_price_id_test;  // Test/Development
```

**Test Environment:**
- Uses `stripe_price_id_test`
- localhost, Vercel preview deployments

**Production Environment:**
- Uses `stripe_price_id_live`
- www.aiornah.xyz, aiornah.xyz

---

## Adding New Products

Want to add a new tier (e.g., "XL" - 100 credits)?

```sql
INSERT INTO products (
  id,
  name,
  credits,
  price_cents,
  stripe_price_id_test,
  stripe_price_id_live,
  display_order
) VALUES (
  'xl',
  '100 Credits',
  100,
  2499,  -- $24.99
  'price_TEST_ID',
  'price_LIVE_ID',
  4
);
```

The product will automatically appear in:
- Paywall component
- Checkout flow
- All pricing displays

No code changes needed! 🎉

---

## Updating Prices

To change pricing (requires creating new Stripe Price):

```sql
-- Update price
UPDATE products
SET price_cents = 399,  -- New price: $3.99
    stripe_price_id_test = 'price_NEW_TEST_ID',
    stripe_price_id_live = 'price_NEW_LIVE_ID'
WHERE id = 'small';
```

**Note:** Stripe doesn't let you modify existing prices - you must create a new Price object and update the ID here.

---

## Troubleshooting

### Issue: "No price ID found for product"

**Cause:** Missing price ID for current environment

**Fix:**
```sql
-- Check which IDs are set
SELECT id, stripe_price_id_test, stripe_price_id_live FROM products;

-- Add missing ID
UPDATE products
SET stripe_price_id_live = 'price_xxxxx'  -- or stripe_price_id_test
WHERE id = 'PRODUCT_ID';
```

### Issue: Products not showing in Paywall

**Cause:** Product marked as inactive

**Fix:**
```sql
UPDATE products SET active = true WHERE id = 'PRODUCT_ID';
```

### Issue: Wrong price showing

**Cause:** Database out of sync with Stripe

**Fix:**
1. Check actual price in Stripe dashboard
2. Update database to match:
```sql
UPDATE products
SET price_cents = CORRECT_PRICE_IN_CENTS
WHERE id = 'PRODUCT_ID';
```

---

## API Reference

### GET /api/products

Returns all active products in client-safe format:

```json
{
  "status": "success",
  "products": [
    {
      "id": "small",
      "name": "5 Credits",
      "credits": 5,
      "price": 2.99,
      "pricePerCheck": "0.60"
    }
  ]
}
```

### Database Schema

```sql
products (
  id TEXT PRIMARY KEY,              -- 'small', 'medium', 'large'
  name TEXT NOT NULL,               -- Display name
  credits INTEGER NOT NULL,         -- Number of credits
  price_cents INTEGER NOT NULL,     -- Price in cents
  stripe_price_id_test TEXT,        -- Test mode Stripe Price ID
  stripe_price_id_live TEXT,        -- Production Stripe Price ID
  active BOOLEAN DEFAULT true,      -- Show/hide product
  display_order INTEGER DEFAULT 0,  -- Sort order
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## Migration Checklist

- [ ] Applied migration to Supabase
- [ ] Verified test products exist
- [ ] Created production Stripe products
- [ ] Added production price IDs to database
- [ ] Tested checkout in test environment
- [ ] Tested checkout in production environment
- [ ] Removed old env vars (optional)
