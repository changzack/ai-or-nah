# Testing Apify Integration

This guide explains how to test the Instagram scraping integration with and without an Apify API key.

## Quick Start

### Testing Without API Key (Mock Mode)

The integration automatically uses mock data when no API key is configured.

**Available test usernames:**
- `testuser` - Returns 9 posts with full data
- `privateuser` - Returns private account (isPrivate: true)
- `noposts` - Returns account with no posts
- Any other username - Returns null (not found)

**Test via API endpoint:**
```bash
# Start dev server
npm run dev

# Test the mock integration
curl "http://localhost:3000/api/test-apify?username=testuser"

# Test private account
curl "http://localhost:3000/api/test-apify?username=privateuser"

# Test not found
curl "http://localhost:3000/api/test-apify?username=randomuser123"
```

**Expected responses:**

Success (testuser):
```json
{
  "success": true,
  "username": "testuser",
  "followerCount": 1250,
  "postCount": 45,
  "imagePosts": 9,
  "isPrivate": false,
  "duration": "1000ms",
  "profile": { ... }
}
```

Private account (privateuser):
```json
{
  "error": "Scraping failed",
  "message": "Could not scrape profile. Account may be private, not found, or Apify service is down.",
  "username": "privateuser",
  "duration": "1000ms"
}
```

### Testing With Real Apify API

**1. Get Apify API Token:**
   - Sign up at https://apify.com (free tier available)
   - Go to Settings > Integrations > API tokens
   - Copy your token

**2. Add to `.env.local`:**
   ```env
   APIFY_API_TOKEN=your_actual_token_here
   ```

**3. Restart dev server:**
   ```bash
   # Kill existing server (Ctrl+C)
   npm run dev
   ```

**4. Test with real Instagram account:**
   ```bash
   # Test with a known public account
   curl "http://localhost:3000/api/test-apify?username=instagram"

   # Or test programmatically
   node -e "
   fetch('http://localhost:3000/api/test-apify?username=instagram')
     .then(r => r.json())
     .then(console.log)
   "
   ```

## Integration Details

### What Gets Scraped

For each Instagram profile:
- ✅ Username
- ✅ Full name
- ✅ Bio
- ✅ Follower count
- ✅ Following count
- ✅ Post count
- ✅ Private status
- ✅ Last ~12 posts (filtered to 9 image posts)

For each post:
- ✅ Post ID
- ✅ Image URL (high quality)
- ✅ Caption
- ✅ Timestamp
- ✅ Likes count
- ✅ Comments count

### What Gets Filtered

The integration automatically:
- Filters out video posts (only images)
- Filters out posts without images
- Limits to 9 posts maximum
- Handles carousel posts (takes first image)

### Error Handling

The integration handles:
- **Account not found** → Returns `null`
- **Private account** → Returns `null`
- **Scraping failure** → Retries once after 5 seconds
- **No posts** → Returns profile with empty `posts` array
- **API errors** → Returns `null` after retry

### Performance

**Expected timing:**
- Mock mode: ~1 second
- Real Apify: ~30-60 seconds per profile
- Includes automatic retry if first attempt fails

## Debugging

### Enable verbose logging

The integration logs to console:
```
[Apify] Starting scrape for: username
[Apify] Scraping profile: username
[Apify] Successfully scraped: username (9 posts)
```

Or in case of errors:
```
[Apify] No data returned for username: username
[Apify] Profile not found: username
[Apify] Profile is private: username
[Apify] Error scraping profile username: [error details]
[Apify] Failed after retry for username: username
```

### Common issues

**"Apify API token not configured"**
- Solution: Add `APIFY_API_TOKEN` to `.env.local` and restart server

**"Could not scrape profile" (with real API key)**
- Account may be private
- Account may not exist
- Instagram may be rate limiting
- Check Apify dashboard for run logs: https://console.apify.com

**"No data returned for username"**
- Username doesn't exist on Instagram
- Apify actor returned empty dataset
- Check actor run logs in Apify console

**Scraping is slow (>2 minutes)**
- Normal for Apify (Instagram anti-bot measures)
- Average: 30-60 seconds per profile
- Check Apify run status in console

## Cost Monitoring

**Free tier limits:**
- ~$5/month free credit
- ~250-500 profiles per month
- Monitor usage: https://console.apify.com/billing

**Cost per scrape:**
- ~$0.01-0.02 per profile
- Retries count as separate runs
- Failed scrapes still consume credits

## Next Steps

Once Apify integration is working:
1. Integrate with Hive API (Step 4)
2. Build analysis orchestration (Step 5)
3. Implement caching to reduce API costs
4. Add rate limiting to prevent abuse

## API Reference

### scrapeInstagramProfile(username)

Scrapes a single Instagram profile.

```typescript
import { scrapeInstagramProfile } from "@/lib/integrations/apify";

const profile = await scrapeInstagramProfile("username");
// Returns InstagramProfile | null
```

### scrapeInstagramProfileWithRetry(username)

Scrapes with automatic retry on failure (recommended).

```typescript
import { scrapeInstagramProfileWithRetry } from "@/lib/integrations/apify";

const profile = await scrapeInstagramProfileWithRetry("username");
// Returns InstagramProfile | null
// Retries once after 5 seconds if first attempt fails
```

### checkApifyConfig()

Check if Apify API token is configured.

```typescript
import { checkApifyConfig } from "@/lib/integrations/apify";

if (!checkApifyConfig()) {
  console.log("Using mock data");
}
```

## Troubleshooting

### Test endpoint not responding
```bash
# Check if dev server is running
curl http://localhost:3000

# Check for TypeScript errors
npm run build
```

### Mock data not working
- Make sure API token is NOT set in `.env.local`
- Restart dev server
- Check console for "[Apify Mock]" logs

### Real API not working
- Verify token is correct in `.env.local`
- Check Apify account status: https://console.apify.com
- Verify account has credits remaining
- Test with known public account: "instagram"

## Support

- Apify Documentation: https://docs.apify.com
- Instagram Scraper Actor: https://apify.com/apify/instagram-profile-scraper
- Issues: Check project GitHub issues
