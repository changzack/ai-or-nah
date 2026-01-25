# External API Integrations

This directory contains integrations with external APIs used by AI or Nah.

## Apify Instagram Profile Scraper

**Purpose:** Scrape Instagram profiles to get user data and recent posts.

**Status:** ✅ Working with real API

**Actor:** `apify/instagram-profile-scraper`
**Docs:** https://apify.com/apify/instagram-profile-scraper

### Configuration

Add to `.env.local`:
```env
APIFY_API_TOKEN=your_apify_token_here
```

### Getting an API Token

1. Sign up at https://apify.com
2. Go to Settings > Integrations > API tokens
3. Create a new token or copy your existing token
4. Free tier includes ~$5 credit/month (~250-500 profiles)

### Usage

```typescript
import { scrapeInstagramProfileWithRetry } from "@/lib/integrations/apify";

const profile = await scrapeInstagramProfileWithRetry("username");

if (!profile) {
  // Handle error: account not found, private, or scraping failed
}

// Access profile data
console.log(profile.followerCount);
console.log(profile.posts); // Array of image posts
```

### Cost Estimates

- Free tier: ~$5/month credit
- Cost per profile: ~$0.01-0.02
- Free tier capacity: ~250-500 profiles/month

See [TESTING_APIFY.md](../../TESTING_APIFY.md) for detailed testing guide.

---

## Hive Moderation API

**Purpose:** Detect AI-generated images using computer vision.

**Status:** ⚠️ Mock mode (authentication issue with real API)

**Endpoint:** `https://api.thehive.ai/api/v2/task/sync`
**Docs:** https://docs.thehive.ai/

### Configuration

Add to `.env.local`:
```env
HIVE_API_KEY_ID=your_key_id_here
HIVE_SECRET_KEY=your_secret_key_here
```

**Note:** Real API currently has authentication issues. Mock mode works perfectly for development.

### Usage

```typescript
import { analyzeImages, calculateAverageAIProbability } from "@/lib/integrations/hive";

const results = await analyzeImages([
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
]);

// Calculate average AI probability
const avgScore = calculateAverageAIProbability(results);
// Returns 0-1 (0 = real, 1 = AI-generated)

// Convert to percentage
const percentage = Math.round(avgScore * 100);
```

### Response Shape

```typescript
{
  imageUrl: string;
  aiProbability: number; // 0-1 (0 = real, 1 = AI)
  success: boolean;
  error?: string;
}
```

### Cost Estimates (When Real API Works)

- Cost per image: ~$0.001-0.002
- 9 images per analysis: ~$0.01-0.02 per check
- Free tier: Check with Hive for current offerings

See [TESTING_HIVE.md](../../TESTING_HIVE.md) for detailed testing guide.

---

## Mock Mode

Both integrations support mock mode for development:

**Apify Mock:**
- Returns fake Instagram profiles
- Test usernames: `testuser`, `privateuser`, `noposts`
- Activates when `APIFY_API_TOKEN` is not set

**Hive Mock:**
- Returns consistent AI scores based on URL hash
- Scores range from 40-95%
- Activates when `HIVE_API_KEY_ID` and `HIVE_SECRET_KEY` are not set

**Enable mock mode:**
1. Remove or comment out API keys in `.env.local`
2. Restart dev server
3. APIs will automatically use mock data

---

## Testing

### Test Endpoints

**Test Apify:**
```bash
curl "http://localhost:3000/api/test-apify?username=testuser"
```

**Test Hive:**
```bash
curl -X POST http://localhost:3000/api/test-hive \
  -H "Content-Type: application/json" \
  -d '{"imageUrls":["https://picsum.photos/400"]}'
```

### Testing Guides

- [TESTING_APIFY.md](../../TESTING_APIFY.md) - Comprehensive Apify testing guide
- [TESTING_HIVE.md](../../TESTING_HIVE.md) - Comprehensive Hive testing guide

---

## Error Handling

Both integrations fail gracefully:
- Return `null` (Apify) or empty/error results (Hive)
- Log errors to console for debugging
- Support retry logic where appropriate
- Switch to mock mode if credentials missing

---

## Rate Limits

- **Apify:** Free tier has monthly credit limit
- **Hive:** Unknown (API not working yet)

Monitor usage:
- Apify: https://console.apify.com/billing
- Hive: TBD when API is working

---

## Monitoring & Logging

Both integrations log to console:

**Success logs:**
```
[Apify] Successfully scraped: username (9 posts)
[Hive] Completed: 9/9 images analyzed successfully
```

**Error logs:**
```
[Apify] Error scraping profile username: error
[Hive] API error (403): error message
```

In production, consider sending logs to:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for metrics

---

## Next Steps

1. ✅ Apify integration complete
2. ⚠️ Resolve Hive API authentication
3. 🔄 Build analysis orchestration (Step 5)
4. 💾 Implement result caching (Step 6)
5. 🛡️ Add rate limiting (Step 7)

---

## Support

- **Apify:** https://docs.apify.com
- **Hive:** https://docs.thehive.ai
- **Project Issues:** GitHub issues
