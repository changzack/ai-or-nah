# Stripe Test → Production Migration Guide

## Current Setup (Test Mode)
✅ Test mode working locally with:
- Secret Key: `sk_test_51SuY5EEPQiohye3M...`
- Price IDs configured for 3 packs ($2.99, $6.99, $14.99)
- Webhook working locally

## Migration Steps

### Step 1: Create Production Products in Stripe

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Toggle to "Live" mode** (top right corner)
3. **Create Products**:

   Navigate to: Products → Add Product

   **Product 1: 5 Credits Pack**
   ```
   Name: 5 Credits
   Description: 5 AI detection checks for Instagram profiles
   Pricing Model: One-time
   Price: $2.99 USD
   ```
   → Copy the Price ID (e.g., `price_1ABC...`)

   **Product 2: 15 Credits Pack**
   ```
   Name: 15 Credits
   Description: 15 AI detection checks for Instagram profiles
   Pricing Model: One-time
   Price: $6.99 USD
   ```
   → Copy the Price ID

   **Product 3: 50 Credits Pack**
   ```
   Name: 50 Credits
   Description: 50 AI detection checks for Instagram profiles
   Pricing Model: One-time
   Price: $14.99 USD
   ```
   → Copy the Price ID

### Step 2: Get Production API Keys

1. **Still in Live mode**, go to: https://dashboard.stripe.com/apikeys
2. Copy these keys:
   - **Secret key** (starts with `sk_live_`) - click "Reveal test key"
   - **Publishable key** (starts with `pk_live_`)

⚠️ **Never commit these to git or share them!**

### Step 3: Set Up Production Webhook

1. **In Live mode**, go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Configure:
   ```
   Endpoint URL: https://aiornah.xyz/api/webhooks/stripe
   Description: AI or Nah production webhook

   Events to send:
   ☑ checkout.session.completed
   ☑ payment_intent.succeeded
   ☑ payment_intent.payment_failed
   ```
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 4: Update Vercel Environment Variables

Go to: Vercel → ai-or-nah → Settings → Environment Variables

**Set these for Production environment:**

```bash
# Stripe Production
STRIPE_SECRET_KEY=sk_live_[your_live_secret_key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[your_live_publishable_key]
STRIPE_WEBHOOK_SECRET=whsec_[your_production_webhook_secret]

# Stripe Production Price IDs
STRIPE_PRICE_SMALL=price_[5_credits_price_id]
STRIPE_PRICE_MEDIUM=price_[15_credits_price_id]
STRIPE_PRICE_LARGE=price_[50_credits_price_id]

# Site URL (CRITICAL - fixes CSRF error)
NEXT_PUBLIC_SITE_URL=https://aiornah.xyz
```

⚠️ **Important Notes:**
- Use `https://` (not `http://`)
- NO trailing slash
- Set these ONLY for "Production" environment
- Keep test keys in "Development" and "Preview" environments

### Step 5: Redeploy

After setting environment variables:
1. Go to Vercel → Deployments
2. Click "Redeploy" on the latest deployment
   OR
3. Push a new commit (env vars are already loaded)

### Step 6: Test Production Payments

**Testing Checklist:**

1. **Test Checkout Flow**
   - Go to https://aiornah.xyz
   - Use up your free checks
   - Click "Get More Credits"
   - Select a package

2. **Complete Test Purchase**
   - Use a REAL credit card (you can refund immediately)
   - Or use test card in test mode first: `4242 4242 4242 4242`
   - Complete payment

3. **Verify Success**
   - [ ] Redirected to success page
   - [ ] Credits shown correctly
   - [ ] Credits added to account
   - [ ] Can perform new checks

4. **Check Stripe Dashboard**
   - [ ] Payment appears in dashboard
   - [ ] Webhook shows "succeeded"
   - [ ] Customer record created

5. **Test Webhook Delivery**
   - Go to: Webhooks → Your endpoint
   - Check "Recent deliveries"
   - Verify all webhooks succeeded (200 response)

6. **Issue Test Refund**
   - In Stripe dashboard, find the payment
   - Click "Refund"
   - Verify refund processes correctly

### Step 7: Monitor First Real Transactions

**Set up monitoring:**

1. **Stripe Dashboard**
   - Bookmark: https://dashboard.stripe.com/payments
   - Check daily for first week

2. **Webhook Health**
   - Monitor: https://dashboard.stripe.com/webhooks
   - Set up alerts for webhook failures

3. **Vercel Logs**
   - Check function logs for errors
   - Filter for: `/api/webhooks/stripe`

## Rollback Plan

If something goes wrong:

1. **Switch back to test mode in Vercel:**
   - Update environment variables back to test keys
   - Redeploy

2. **Debug with Stripe Logs:**
   - Check webhook delivery logs
   - Check payment logs
   - Enable "Test mode" to safely debug

## Common Issues

### Issue: "Invalid request origin"
**Cause:** `NEXT_PUBLIC_SITE_URL` not set correctly
**Fix:** Set to `https://aiornah.xyz` (no trailing slash)

### Issue: Webhook not firing
**Cause:** Webhook URL incorrect or signing secret mismatch
**Fix:**
- Verify URL is `https://aiornah.xyz/api/webhooks/stripe`
- Verify signing secret matches Vercel env var
- Check Stripe webhook logs for delivery attempts

### Issue: Credits not added after payment
**Cause:** Webhook processed but database update failed
**Fix:**
- Check Vercel function logs
- Verify Supabase connection
- Check webhook processing code

### Issue: Payment succeeds but user sees error
**Cause:** Session verification failing
**Fix:**
- Check `/api/auth/stripe-session` logs
- Verify session ID being passed correctly

## Pre-Launch Checklist

Before announcing to users:

- [ ] All 3 credit packages work
- [ ] Webhook consistently fires and processes
- [ ] Credits are added correctly
- [ ] Email login works (CSRF fixed)
- [ ] Refund process tested
- [ ] Stripe dashboard monitored
- [ ] Test purchase → use credits → verify deduction
- [ ] Error handling tested (declined cards, etc.)
- [ ] Mobile checkout flow tested

## Support Resources

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs/payments/checkout
- Webhook Testing: https://dashboard.stripe.com/webhooks
- Stripe Support: https://support.stripe.com

---

## Quick Reference

**Current Test Keys:**
```
STRIPE_SECRET_KEY=sk_test_51SuY5EEPQiohye3M...
STRIPE_PRICE_SMALL=price_1SuY7aEPQiohye3M4xMFSpaw
STRIPE_PRICE_MEDIUM=price_1SuY8QEPQiohye3M55eT2FBk
STRIPE_PRICE_LARGE=price_1SuY8lEPQiohye3MGzhhWNYU
```

**Production Keys (to be filled in):**
```
STRIPE_SECRET_KEY=sk_live_________________
STRIPE_PRICE_SMALL=price_________________
STRIPE_PRICE_MEDIUM=price_________________
STRIPE_PRICE_LARGE=price_________________
STRIPE_WEBHOOK_SECRET=whsec_________________
```
