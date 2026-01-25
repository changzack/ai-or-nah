# [ARCHIVED] Hive API Authentication Status

> **⚠️ NOTE**: This project has migrated to Sightengine for AI detection.
> See [SIGHTENGINE_MIGRATION.md](./SIGHTENGINE_MIGRATION.md) for details.
> This document is kept for historical reference only.

---

## Summary

✅ **Authentication Works!** We successfully authenticated with Hive v3 API.

⚠️ **Model Access Issue:** Your account doesn't have access to AI detection models.

## What We Found

### ✅ Correct Configuration

- **API Version:** v3 (not v2)
- **Endpoint:** `https://api.thehive.ai/api/v3/task/sync`
- **Auth Method:** `Bearer` token
- **Token to Use:** Secret Key (`AVZtSMreWHRLlECYDlcbdA==`)

### ❌ Current Issue

**Error:** "Unfortunately, no model info found."

**What this means:**
- Your credentials are VALID ✅
- Authentication is WORKING ✅
- But your account doesn't have AI detection models enabled ❌

## Tested Model Names (All Failed)

1. `ai-generated-content`
2. `ai-generated`
3. `generic`
4. Model arrays: `["ai-generated-content"]`

All returned: "Unfortunately, no model info found."

## Next Steps

### Option 1: Contact Hive Support (Recommended)

Email Hive support with:
```
Subject: Enable AI Detection Models for v3 API

Hi Hive Team,

I have v3 API credentials:
- Access Key ID: Hoxo9Qhy8x94qG4y
- Using endpoint: https://api.thehive.ai/api/v3/task/sync

Authentication works with Bearer token, but I'm getting:
"Unfortunately, no model info found."

Could you please:
1. Enable AI-generated content detection models on my account?
2. Provide the correct model_name to use for AI detection?
3. Confirm if there are any additional setup steps required?

Thanks!
```

### Option 2: Check Hive Dashboard

1. Log in to https://thehive.ai/dashboard
2. Look for "Models" or "AI Detection" section
3. Check if AI detection needs to be manually enabled
4. Look for available model names you have access to

### Option 3: Continue with Mock Mode

For development, the mock mode works perfectly:
- Consistent AI scores
- Fast response times
- Full app functionality for testing

## Working Code (Once Models Are Enabled)

```typescript
const response = await fetch("https://api.thehive.ai/api/v3/task/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer AVZtSMreWHRLlECYDlcbdA==`,
  },
  body: JSON.stringify({
    url: imageUrl,
    model_name: "[MODEL_NAME_FROM_HIVE]", // Need this from Hive
  }),
});
```

## Current App Status

**What's Working:**
- Landing page ✅
- Instagram scraping (Apify) ✅
- Profile heuristics ✅
- Consistency analysis ✅
- Results page UI ✅

**Using Mock Data:**
- AI image detection (Hive) - 70% of final score

**Impact:**
- App is fully functional
- Verdicts are based 30% on real data, 70% on mock
- Can switch to real Hive once models are enabled

## Recommendation

**For MVP launch:**
1. Contact Hive support to enable models
2. In meantime, continue with mock mode
3. Once enabled, update line 46 in `lib/integrations/hive.ts`
4. Adjust scoring weights if needed (increase heuristics weight)

**Quick win:**
You could adjust the scoring algorithm to rely more on real heuristics:
```typescript
// Current: 70% images, 15% profile, 15% consistency
// Could change to: 40% images, 30% profile, 30% consistency
```

This would make the app more accurate with mock data until Hive is working.
