# Production Setup Guide

## 1. Email Login (Resend) Setup

### Current Issue
Email login requires proper Resend configuration in production.

### Steps to Fix

#### A. Verify Domain in Resend
1. Go to https://resend.com/domains
2. Add your domain: `aiornah.xyz`
3. Add the DNS records they provide (SPF, DKIM, DMARC)
4. Wait for verification (can take a few minutes to hours)

#### B. Set Environment Variables in Vercel
1. Go to your Vercel project settings → Environment Variables
2. Ensure these are set for **Production**:
   ```
   RESEND_API_KEY=re_ho38tJrA_87W1zaw2oJCawQFww3JNYNtN
   RESEND_FROM_EMAIL=noreply@aiornah.xyz
   ```

#### C. Test Email Sending
Once domain is verified, test with:
```bash
curl -X POST https://aiornah.xyz/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### Common Issues
- **Domain not verified**: Emails won't send until DNS records are verified
- **Sandbox mode**: Resend free tier only sends to verified email addresses
- **Rate limiting**: Check Resend dashboard for rate limit errors

---

## 2. Stripe Production Setup

### Current Status
✅ Test mode configured locally
❌ Production mode not yet configured

### Steps to Set Up Production Stripe

#### A. Create Production Products in Stripe

1. **Log into Stripe Dashboard** (https://dashboard.stripe.com)
2. **Switch to Live Mode** (toggle in top right)
3. **Create Products**:

   **Product 1: 5 Credits Pack**
   - Name: `5 Credits`
   - Description: `5 AI detection checks`
   - Pricing: One-time payment, $2.99 USD
   - Copy the Price ID (starts with `price_`)

   **Product 2: 15 Credits Pack**
   - Name: `15 Credits`
   - Description: `15 AI detection checks`
   - Pricing: One-time payment, $6.99 USD
   - Copy the Price ID

   **Product 3: 50 Credits Pack**
   - Name: `50 Credits`
   - Description: `50 AI detection checks`
   - Pricing: One-time payment, $14.99 USD
   - Copy the Price ID

#### B. Get Production API Keys

1. Go to https://dashboard.stripe.com/apikeys (in **Live Mode**)
2. Copy:
   - **Secret key** (starts with `sk_live_`)
   - **Publishable key** (starts with `pk_live_`)

#### C. Set Up Production Webhook

1. Go to https://dashboard.stripe.com/webhooks (in **Live Mode**)
2. Click "Add endpoint"
3. Endpoint URL: `https://aiornah.xyz/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

#### D. Update Vercel Environment Variables

Set these in Vercel (Production environment):

```bash
# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Production Price IDs
STRIPE_PRICE_SMALL=price_xxxxx  # 5 credits - $2.99
STRIPE_PRICE_MEDIUM=price_xxxxx # 15 credits - $6.99
STRIPE_PRICE_LARGE=price_xxxxx  # 50 credits - $14.99
```

#### E. Test Production Payments

1. Use Stripe's test card in test mode first: `4242 4242 4242 4242`
2. Once verified, switch to production and test with a real card (you can refund immediately)
3. Verify:
   - Checkout session creates successfully
   - Payment processes
   - Webhook fires and credits are added
   - User sees success page with correct credit count

### Important Notes

⚠️ **Never commit production keys to git**
⚠️ **Keep test and production environments separate**
⚠️ **Test refund process before launch**

---

## 3. Deployment Checklist

Before going live with production Stripe:

- [ ] Resend domain verified and emails sending
- [ ] Stripe products created in Live mode
- [ ] Stripe webhook endpoint configured
- [ ] All production environment variables set in Vercel
- [ ] Test purchase with real card (then refund)
- [ ] Test webhook delivery in Stripe dashboard
- [ ] Test email login flow end-to-end
- [ ] Verify credit deduction works correctly
- [ ] Test refund process
- [ ] Monitor Stripe dashboard for first real transactions

---

## 4. Monitoring

### Stripe Dashboard
- Monitor transactions: https://dashboard.stripe.com/payments
- Check webhook logs: https://dashboard.stripe.com/webhooks
- View customer issues: https://dashboard.stripe.com/disputes

### Resend Dashboard
- Email delivery status: https://resend.com/emails
- Domain health: https://resend.com/domains

### Vercel Logs
- Function logs: https://vercel.com/[your-project]/logs
- Check for errors in webhook processing

---

## 5. Troubleshooting

### Email Not Sending
```bash
# Check Vercel logs for send-code API route
# Look for Resend API errors
# Verify domain DNS records
```

### Webhook Not Firing
```bash
# Check Stripe webhook logs
# Verify webhook URL is correct (https, not http)
# Check Vercel function logs for errors
# Verify webhook secret matches
```

### Credits Not Added After Payment
```bash
# Check Stripe webhook logs - did it fire?
# Check Vercel function logs - did webhook process?
# Check Supabase - was customer record updated?
```
