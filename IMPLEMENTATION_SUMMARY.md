# Profile Analysis Detection Rules - Implementation Summary

## Overview
Successfully implemented expanded profile analysis detection rules to identify AI/fake profiles on Instagram using data from the Apify integration.

## Changes Made

### 1. Type Definitions (`lib/types.ts`)

#### Updated `InstagramProfile` type:
- Added `verified: boolean` - Instagram verification status

#### Updated `InstagramPost` type:
- Added `hashtags: string[]` - List of hashtags per post
- Added `mentions: string[]` - List of @mentions per post

### 2. Apify Integration (`lib/integrations/apify.ts`)

#### Updated `transformApifyProfile()`:
- Now passes through `verified` field from Apify response
- Added `hashtags` and `mentions` to each post transformation

#### Updated `ApifyPost` interface:
- Already had `hashtags?: string[]` and `mentions?: string[]` fields
- Now properly mapped to our `InstagramPost` type

### 3. Profile Signal Analysis (`lib/scoring/profile-signals.ts`)

#### New Detection Rules Added:

**1. Verified Account Check (Green Flag)**
```typescript
analyzeVerifiedStatus(profile)
```
- Condition: `verified === true`
- Message: "Verified account. Instagram has confirmed this identity."
- Type: Positive signal

**2. Username Pattern Analysis (Red Flags)**
```typescript
analyzeUsername(username)
```
Three patterns detected:
- Random number suffix: `/[a-z]+\d{4,}$/i` (e.g., emma_2847362)
  - Message: "Username has suspicious random number suffix."
- Bot-generated pattern: `/^[a-z]{2,3}\d+[a-z]*\d*$/i` (e.g., sx234ok)
  - Message: "Username follows bot-generated pattern."
- Excessive underscores: 3 or more underscores
  - Message: "Username has multiple underscores. Common in fake accounts."

**3. Missing Full Name Check (Red Flag)**
```typescript
analyzeFullName(fullName)
```
- Condition: `!fullName || fullName.trim().length === 0`
- Message: "No display name set. Real users typically add their name."

**4. Stale Account Detection (Red Flag)**
```typescript
analyzeStaleAccount(profile)
```
- Condition: Most recent post > 6 months old AND followerCount > 5000
- Message: "No recent posts despite {N} followers. Account may be abandoned or inactive."

#### Updated Function:
- `analyzeProfileSignals()` now calls all new detection functions

### 4. Consistency Analysis (`lib/scoring/consistency.ts`)

#### Updated Function Signature:
```typescript
analyzeConsistency(posts: InstagramPost[], aiScores: AIImageScore[], profile?: InstagramProfile)
```
- Added optional `profile` parameter for engagement rate calculations

#### New Detection Rules Added:

**5. Excessive Hashtags Detection (Red Flags)**
```typescript
analyzeHashtags(posts)
```
- Condition 1: avg hashtags > 25/post
  - Message: "Hashtag stuffing detected ({N}/post). Strong indicator of bot behavior."
- Condition 2: avg hashtags > 15/post
  - Message: "Uses excessive hashtags (avg {N}/post). Common spam behavior."

**6. Spam Hashtags Detection (Red Flag)**
```typescript
analyzeHashtags(posts)
```
- Detects: #followme, #follow4follow, #f4f, #like4like, #l4l, #likeforlike, #followback, #followforfollow, #likeforlikes, #likes4likes
- Message: "Uses engagement-bait hashtags (#follow4follow, #like4like). Bot behavior."

**7. Mass Tagging Detection (Red Flag)**
```typescript
analyzeMentions(posts)
```
- Condition: avg mentions > 5/post
- Message: "Tags many accounts per post (avg {N}). Spam-like behavior."

**8. Engagement Rate Analysis (Red Flags)**
```typescript
analyzeEngagementRate(posts, profile)
```
- Calculates: `engagementRate = (avgLikes + avgComments) / followerCount * 100`
- Low engagement: rate < 0.5% AND followers > 10K
  - Message: "Very low engagement rate ({N}%) despite {followers} followers. Possible bought followers."
- High engagement: rate > 20% AND followers > 5K
  - Message: "Unusually high engagement rate ({N}%). Possible fake engagement."

#### Helper Functions Added:
- `formatNumber()` - Formats large numbers with K/M suffix

### 5. Main Analysis (`lib/analyze.ts`)

#### Updated Function Call:
```typescript
const consistencyFlags = analyzeConsistency(profile.posts, aiScores, profile);
```
- Now passes `profile` as third parameter to enable engagement rate analysis

### 6. Mock Data (`lib/integrations/apify-mock.ts`)

#### Updated All Mock Profiles:
- Added `verified: false` to all profiles
- Added `hashtags: []` arrays to all posts with realistic hashtag examples
- Added `mentions: []` arrays to all posts

Example:
```typescript
{
  username: "testuser",
  verified: false,
  posts: [
    {
      hashtags: ["beach", "sunny", "vacation"],
      mentions: [],
      // ... other fields
    }
  ]
}
```

## Detection Logic Summary

### Profile-Level Signals (account metadata)
| Signal | Type | Trigger |
|--------|------|---------|
| Verified account | ✅ Green | Instagram verification badge |
| Random number suffix | 🚩 Red | Username like `user_29472` |
| Bot pattern | 🚩 Red | Username like `sx234ok` |
| Multiple underscores | 🚩 Red | 3+ underscores in username |
| Missing display name | 🚩 Red | No full name set |
| Stale account | 🚩 Red | No posts in 6 months + 5K+ followers |

### Engagement Pattern Signals (post-level patterns)
| Signal | Type | Trigger |
|--------|------|---------|
| Hashtag stuffing | 🚩 Red | Avg 25+ hashtags/post |
| Excessive hashtags | 🚩 Red | Avg 15+ hashtags/post |
| Spam hashtags | 🚩 Red | Uses #follow4follow, #like4like, etc. |
| Mass tagging | 🚩 Red | Avg 5+ mentions/post |
| Low engagement rate | 🚩 Red | < 0.5% engagement with 10K+ followers |
| High engagement rate | 🚩 Red | > 20% engagement with 5K+ followers |

## Build Verification

✅ TypeScript compilation successful
✅ No type errors
✅ All imports resolved correctly
✅ Build completed without warnings

## Testing Recommendations

### Manual Testing Scenarios:

1. **Verified Account Test**
   - Test with known verified Instagram accounts
   - Should show green "Verified account" flag

2. **Username Pattern Test**
   - Test usernames: `sexy_girl_29472`, `ab123cd`, `user___name___test`
   - Should flag suspicious patterns

3. **Spam Hashtag Test**
   - Account with #follow4follow, #like4like hashtags
   - Should flag spam hashtags

4. **Low Engagement Test**
   - Account: 100K followers, avg 50 likes/post
   - Engagement rate: ~0.05%
   - Should flag low engagement

5. **High Engagement Test**
   - Account: 10K followers, avg 3000 likes/post
   - Engagement rate: 30%
   - Should flag suspiciously high engagement

6. **UI Verification**
   - New flags should display in "Profile Analysis" card (profile signals)
   - New flags should display in "Engagement Pattern Analysis" card (consistency signals)
   - Both positive (green) and negative (red) flags should be visible

## Scoring Impact

The existing scoring algorithm in `calculateFinalScore()` already handles the new flags:
- Profile red flags: +5 points each (max 15 points)
- Profile green flags: -3 points each
- Consistency red flags: +5 points each (max 15 points)
- Consistency green flags: -3 points each
- Final score clamped to 0-100

No changes needed to scoring weights as the new rules integrate seamlessly.

## Files Modified

1. ✅ `lib/types.ts` - Added verified, hashtags, mentions
2. ✅ `lib/integrations/apify.ts` - Pass through new fields
3. ✅ `lib/scoring/profile-signals.ts` - Added 4 new detection functions
4. ✅ `lib/scoring/consistency.ts` - Added 4 new detection functions + profile param
5. ✅ `lib/analyze.ts` - Updated analyzeConsistency call
6. ✅ `lib/integrations/apify-mock.ts` - Updated mock data

## Next Steps

1. **Deploy to staging/production**
   - Run `npm run build` and deploy
   - Monitor error logs for any runtime issues

2. **Real-world testing**
   - Test with variety of accounts (real, fake, suspicious)
   - Verify new flags appear correctly in UI
   - Check that scoring remains balanced

3. **Fine-tuning** (if needed)
   - Adjust thresholds based on real data
   - Modify scoring weights if needed
   - Add more pattern detection as needed

## Notes

- All changes are backward compatible
- Existing tests should still pass (may need minor updates to mock data)
- The optional `profile` parameter in `analyzeConsistency` ensures no breaking changes
- All new detection rules are defensive (check for null/undefined values)
