# Quick Fixes & Common Issues

## Instagram Images Not Loading

**Error:**
```
Invalid src prop on next/image, hostname "scontent-*.cdninstagram.com"
is not configured under images in your next.config.js
```

**Fix:** Already applied in `next.config.ts`

The configuration now includes:
```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.cdninstagram.com",  // Allows all Instagram CDN domains
    },
    {
      protocol: "https",
      hostname: "picsum.photos",  // For test images
    },
  ],
}
```

This allows Next.js Image component to load images from:
- All Instagram CDN subdomains (scontent-*.cdninstagram.com)
- Picsum (for development/testing)

**Note:** After updating next.config.ts, always restart the dev server for changes to take effect.

## Other Common Issues

### API Returns 404

**Cause:** Account not found, private, or scraping failed

**Solution:**
- Try a different public account
- Check Apify logs in console
- Verify account exists on Instagram

### Analysis Takes Too Long (>2 minutes)

**Cause:** Apify scraping is slow or timing out

**Solution:**
- Normal for first request (30-60 seconds)
- Check Apify dashboard for run status
- Ensure APIFY_API_TOKEN is valid

### Mock Data Instead of Real Results

**Cause:** API credentials not set or commented out

**Solution:**
- Check `.env.local` has uncommented credentials
- Restart dev server after updating env vars
- Look for `[Mock]` in console logs

## Testing Different Accounts

**Known working accounts:**
- `instagram` - Official Instagram account (698M followers)
- `yuna.lee` - Real user account
- Any other public Instagram username

**Mock test accounts (when no Apify token):**
- `testuser` - Returns 9 posts
- `privateuser` - Returns private account error
- `noposts` - Returns no posts error

## Development Tips

1. **Always restart server after changing:**
   - `.env.local`
   - `next.config.ts`
   - Any environment variables

2. **Check console logs for:**
   - `[Apify]` - Scraping status
   - `[Hive]` - Image analysis status
   - `[Analyze]` - Overall workflow status

3. **Test endpoints directly:**
   - `GET /api/test-apify?username=instagram`
   - `POST /api/test-hive` (with body)
   - `POST /api/analyze` (with body)
