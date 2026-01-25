# Vercel Deployment Setup

## Environment Variables Configuration

Your local deployment works because you have `.env.local` configured. Vercel needs these same environment variables configured in its dashboard.

### Required Environment Variables

Go to your Vercel project dashboard:
1. Navigate to: **Settings** → **Environment Variables**
2. Add the following variables:

#### Essential API Keys

```bash
# Apify (Instagram Scraping)
APIFY_API_TOKEN=your_apify_token_here

# Sightengine (AI Detection)
SIGHTENGINE_API_USER=your_sightengine_user_id
SIGHTENGINE_API_SECRET=your_sightengine_secret

# Supabase (Database & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Optional Configuration

```bash
# AI Detection Provider (default: sightengine)
AI_DETECTION_PROVIDER=sightengine

# Cost Optimization (default: false = analyze only 1 image)
ANALYZE_ALL_IMAGES=false

# Site URL (Vercel will auto-set this, but you can override)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### How to Add Variables in Vercel

#### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project (ai-or-nah)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. For each variable:
   - Enter **Key** (e.g., `APIFY_API_TOKEN`)
   - Enter **Value** (copy from your `.env.local` file)
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add APIFY_API_TOKEN production
vercel env add SIGHTENGINE_API_USER production
vercel env add SIGHTENGINE_API_SECRET production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### After Adding Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **•••** menu on latest deployment
   - Click **Redeploy**
   - OR: Push a new commit to trigger auto-deploy

2. **Verify** the deployment:
   ```bash
   # Test the debug endpoint on your Vercel URL
   curl "https://your-app.vercel.app/api/debug-scrape?username=instagram"
   ```

### Environment Variable Checklist

Before marking as complete, verify all variables are set:

- [ ] `APIFY_API_TOKEN` - ✅ Essential for Instagram scraping
- [ ] `SIGHTENGINE_API_USER` - ✅ Essential for AI detection
- [ ] `SIGHTENGINE_API_SECRET` - ✅ Essential for AI detection
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - ✅ Essential for caching
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ Essential for caching
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - ✅ Essential for admin operations
- [ ] `AI_DETECTION_PROVIDER` - ⚠️ Optional (defaults to sightengine)
- [ ] `ANALYZE_ALL_IMAGES` - ⚠️ Optional (defaults to false)
- [ ] `NEXT_PUBLIC_SITE_URL` - ⚠️ Optional (Vercel auto-sets)

### Testing After Configuration

1. **Test Instagram scraping:**
   ```bash
   curl "https://your-app.vercel.app/api/test-apify"
   ```
   Should return: `"Apify is configured and working!"`

2. **Test AI detection:**
   ```bash
   curl "https://your-app.vercel.app/api/test-ai-detection"
   ```
   Should return success with test results

3. **Test full analysis:**
   Visit: `https://your-app.vercel.app`
   Enter username: `soycatalinacruz`
   Should successfully analyze the account

### Common Issues

#### Issue: "Couldn't analyze account"
**Cause:** Missing API tokens (Apify, Sightengine, or Supabase)
**Solution:** Verify all required env vars are set and redeploy

#### Issue: "API key not configured"
**Cause:** Environment variable name typo or not applied to production
**Solution:** Double-check spelling and ensure "Production" environment is selected

#### Issue: Changes not taking effect
**Cause:** Environment variables require a redeploy to apply
**Solution:** Trigger a new deployment after adding variables

### Security Notes

- ✅ Environment variables are encrypted by Vercel
- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Service role keys have admin access - keep secure
- ⚠️ If keys are leaked, regenerate them immediately:
  - Apify: https://console.apify.com/account/integrations
  - Sightengine: Contact support
  - Supabase: Project Settings → API → Reset keys

### Vercel Auto-Configuration

Vercel automatically sets these (no action needed):
- `VERCEL=1`
- `VERCEL_ENV` (production/preview/development)
- `VERCEL_URL` (deployment URL)
- `VERCEL_GIT_COMMIT_SHA`

### Preview Deployments

If you want preview deployments (for PRs) to work:
- Add all env vars to **Preview** environment too
- OR: Use the same values for Production + Preview + Development

## Quick Setup Script

Copy-paste this into your terminal after logging into Vercel CLI:

```bash
# Set all production environment variables at once
# Copy values from your local .env.local file

vercel env add APIFY_API_TOKEN production
# Paste your Apify API token

vercel env add SIGHTENGINE_API_USER production
# Paste your Sightengine user ID

vercel env add SIGHTENGINE_API_SECRET production
# Paste your Sightengine secret

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your Supabase project URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your Supabase anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your Supabase service role key

# Trigger redeploy
vercel --prod
```

## Verification

After setup, you should see:
- ✅ Green deployment status in Vercel dashboard
- ✅ Test accounts working on your deployed URL
- ✅ No "API key not configured" errors in logs

Check deployment logs:
1. Go to **Deployments** tab
2. Click on latest deployment
3. Check **Build Logs** and **Function Logs** for errors
