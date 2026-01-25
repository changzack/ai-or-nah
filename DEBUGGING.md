# Debugging Guide

## Testing Specific Accounts

### Debug Scraping Endpoint
Test any Instagram account to see raw Apify response:

```bash
# Test an account
curl "http://localhost:3000/api/debug-scrape?username=ACCOUNT_NAME"

# Example
curl "http://localhost:3000/api/debug-scrape?username=instagram"
```

This endpoint shows:
- Raw Apify response structure
- Whether account is marked as private
- Number of posts returned
- Profile metadata

### Common Issues

**1. Account Appears Private but Isn't**
- Check if Apify is actually returning `private: true`
- Some accounts have privacy settings that block scraping even if public
- Instagram may have changed their page structure

**2. No Data Returned**
- Instagram may be rate limiting
- Account name might be misspelled
- Account might have been deleted/suspended

**3. No Posts Returned**
- Account might have only video posts (we filter for images)
- Account might have carousel posts without direct image URLs
- Check `latestPostsCount` in debug response

### Checking Logs

When testing via the main analyze endpoint, check your terminal for:

```
[Apify] Raw response keys for USERNAME: [...]
[Apify] Profile data - id: X, private: Y, username: Z
```

If you see "Profile is private" error, the log will show:
```
[Apify] Profile metadata: {
  id: "...",
  username: "...",
  private: true,
  postsCount: X,
  followersCount: Y
}
```

### Testing Flow

1. **Test with debug endpoint first:**
   ```bash
   curl "http://localhost:3000/api/debug-scrape?username=ACCOUNT"
   ```

2. **Check the response:**
   - Is `private` set to `true`?
   - Is `latestPostsCount` greater than 0?
   - Are there any error messages?

3. **If debug works but main analyze fails:**
   - Check the terminal logs for the full error
   - Look for transformation errors (post filtering, image extraction)

4. **If both fail:**
   - Instagram might be blocking the IP
   - Apify actor might need different settings
   - Account might have unusual privacy settings

## Known Limitations

### Instagram Rate Limiting
Instagram may block or rate limit scraping:
- **Symptoms**: Accounts appear private when they're not
- **Solution**: Wait 15-30 minutes, try different accounts
- **Prevention**: Apify handles proxies/rotation automatically

### Account Privacy Settings
Some accounts have settings that block scraping:
- Creator accounts with privacy restrictions
- Accounts in certain countries
- Accounts with age restrictions

### Post Type Filtering
We only analyze image posts:
- Video-only accounts will fail ("insufficient posts")
- Carousel posts without direct images are skipped
- Stories/Reels are not included

## Testing Specific Scenarios

### Test a Public Account
```bash
# Should return success with posts
curl "http://localhost:3000/api/debug-scrape?username=instagram"
```

### Test Your Account Status
Replace with the account you're testing:
```bash
curl "http://localhost:3000/api/debug-scrape?username=YOUR_TEST_ACCOUNT"
```

Check the response:
- `private: false` = Actually public, scraping should work
- `private: true` = Instagram is reporting it as private (could be real or blocking)
- `latestPostsCount: 0` = No posts returned (might be videos only)

### Test Post Filtering
If you get "insufficient posts" error but debug shows posts:
1. Check if posts are videos vs images
2. Look at `firstPost.type` in debug response
3. We need `type: "Image"` or `type: "Sidecar"` with images

## Possible Root Causes

### 1. Instagram Blocking (Most Likely if Multiple Public Accounts Fail)
**Symptoms:**
- Previously working accounts now fail
- Multiple known-public accounts return "private"
- Debug endpoint shows `private: true` for public accounts

**Solutions:**
- Wait 30-60 minutes
- Test from different network
- Check Apify dashboard for actor status
- Verify Apify proxy settings are enabled

### 2. Apify Actor Issues
**Symptoms:**
- No data returned at all
- Errors mentioning actor run failures
- Timeouts

**Solutions:**
- Check Apify dashboard: https://console.apify.com
- Verify API token is valid
- Check actor run logs in Apify console

### 3. Code Bug in Post Filtering
**Symptoms:**
- Debug shows posts but analyze fails
- "Insufficient posts" error when posts exist
- Works for some accounts but not others

**Solutions:**
- Check post types in debug response
- Verify image URLs are present
- Look for transformation errors in logs

## Apify Dashboard

Check your Apify usage and runs:
1. Go to https://console.apify.com
2. Navigate to "Storage" → "Datasets"
3. Find recent runs to see raw data
4. Check "Runs" to see success/failure rates

## Next Steps

If you're seeing failures:
1. **Share specific account names** that are failing (I'll test them)
2. **Run debug endpoint** on failing accounts and share output
3. **Check Apify console** for actor run logs
4. **Try waiting 30 minutes** if it's rate limiting
