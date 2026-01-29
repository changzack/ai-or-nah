# AI or Nah - Amplitude Tracking Plan

## Overview

This document defines all analytics events for AI or Nah. Use this as the source of truth when implementing or updating analytics.

**Provider:** Amplitude (client-side SDK only)
**Session Tracking:** Amplitude automatic session tracking enabled

---

## Key Funnel

```
Home → Submit Username → Paywall (if no credits) → Purchase → Results
```

Primary conversion metrics:
- Submit Rate: Viewed Home → Submitted Username
- Paywall Conversion: Viewed Paywall → Completed Purchase
- Overall Conversion: Viewed Home → Completed Purchase

---

## Event Taxonomy

### Page View Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `Viewed Home` | Homepage loads | `source` (direct, share_link, search) |
| `Viewed Results` | Results page loads | `username`, `verdict`, `isFromCache`, `source` |
| `Viewed Paywall` | Paywall modal/page shown | `trigger` (no_credits, upgrade), `creditsRemaining` |
| `Viewed Checkout` | Checkout page loads | `package` (5_pack, 15_pack, etc.), `price` |
| `Viewed FAQ` | FAQ page loads | — |
| `Viewed Privacy` | Privacy page loads | — |
| `Viewed Terms` | Terms page loads | — |
| `Viewed About` | About page loads | — |
| `Viewed Contact` | Contact page loads | — |

### Core Action Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `Submitted Username` | User submits Instagram username | `username`, `isLoggedIn`, `creditsRemaining`, `source` |
| `Started Analysis` | Analysis begins (API called) | `username`, `isFromCache` |
| `Completed Analysis` | Analysis finishes successfully | `username`, `verdict`, `confidenceScore`, `duration_ms`, `isFromCache` |
| `Failed Analysis` | Analysis fails | `username`, `errorType`, `errorMessage` |

### Monetization Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `Viewed Paywall` | Paywall shown | `trigger`, `creditsRemaining` |
| `Dismissed Paywall` | User closes paywall without purchasing | — |
| `Selected Package` | User selects a credit package | `package`, `price`, `credits` |
| `Started Checkout` | User initiates Stripe checkout | `package`, `price` |
| `Completed Purchase` | Stripe webhook confirms payment | `package`, `price`, `credits`, `transactionId` |
| `Failed Purchase` | Payment fails | `package`, `errorType` |
| `Used Credit` | Credit deducted for analysis | `creditsRemaining`, `username` |
| `Used Free Check` | Free check deducted (anonymous) | `freeChecksRemaining`, `username` |

### Authentication Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `Clicked Sign In` | User clicks sign in button | `source` |
| `Started Auth` | Auth flow initiated | `provider` (email, google) |
| `Completed Auth` | User successfully authenticates | `provider`, `isNewUser` |
| `Failed Auth` | Auth fails | `provider`, `errorType` |
| `Signed Out` | User signs out | — |

### Sharing Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `Clicked Share Button` | User clicks share button | `username`, `verdict`, `platform` (copy, twitter, native) |
| `Copied Share Link` | Link copied to clipboard | `username`, `verdict` |
| `Shared to Platform` | Share completed (if detectable) | `username`, `verdict`, `platform` |

### Error Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `Encountered Error` | Any user-facing error | `errorType`, `errorMessage`, `context` |
| `Failed API Call` | API request fails | `endpoint`, `statusCode`, `errorMessage` |
| `Invalid Username` | Username validation fails | `username`, `reason` |

---

## Property Definitions

### Event Properties

| Property | Type | Description |
|----------|------|-------------|
| `username` | string | Instagram username being checked |
| `verdict` | string | Analysis result (real, ai_generated, likely_ai, inconclusive) |
| `confidenceScore` | number | 0-100 confidence score |
| `isFromCache` | boolean | Whether result was served from cache |
| `isLoggedIn` | boolean | User's authentication state |
| `creditsRemaining` | number | User's credit balance |
| `freeChecksRemaining` | number | Anonymous user's remaining free checks |
| `source` | string | Where the action originated |
| `trigger` | string | What caused the event (e.g., paywall trigger reason) |
| `package` | string | Credit package identifier |
| `price` | number | Price in cents |
| `credits` | number | Number of credits in package |
| `transactionId` | string | Stripe transaction ID |
| `provider` | string | Auth provider (email, google) |
| `platform` | string | Share platform (copy, twitter, native) |
| `errorType` | string | Category of error |
| `errorMessage` | string | Error details |
| `duration_ms` | number | Time taken in milliseconds |

### User Properties

Set these on user identification:

| Property | Type | Description |
|----------|------|-------------|
| `email` | string | User's email address |
| `authProvider` | string | How user signed up |
| `createdAt` | string | Account creation timestamp |
| `totalCredits` | number | Lifetime credits purchased |
| `totalChecks` | number | Lifetime checks performed |
| `lastCheckAt` | string | Timestamp of last check |

---

## Implementation Notes

### Analytics Utility (`/lib/analytics.ts`)

```typescript
import * as amplitude from '@amplitude/analytics-browser';

// Initialize (call once in app startup)
export function initAnalytics() {
  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
    autocapture: { sessions: true }
  });
}

// Track events
export function track(eventName: string, properties?: Record<string, any>) {
  amplitude.track(eventName, properties);
}

// Identify user (call on auth)
export function identify(userId: string, userProperties?: Record<string, any>) {
  amplitude.setUserId(userId);
  if (userProperties) {
    const identifyObj = new amplitude.Identify();
    Object.entries(userProperties).forEach(([key, value]) => {
      identifyObj.set(key, value);
    });
    amplitude.identify(identifyObj);
  }
}

// Reset on sign out
export function resetAnalytics() {
  amplitude.reset();
}
```

### Initialization

Initialize in root layout or app provider:

```typescript
// app/layout.tsx or a client provider
'use client';
import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

useEffect(() => {
  initAnalytics();
}, []);
```

### Page View Pattern

```typescript
// In page components
'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export default function ResultsPage({ params }) {
  useEffect(() => {
    track('Viewed Results', {
      username: params.username,
      verdict: result.verdict,
      isFromCache: result.fromCache
    });
  }, []);
}
```

### Action Tracking Pattern

```typescript
// In event handlers
import { track } from '@/lib/analytics';

const handleSubmit = async (username: string) => {
  track('Submitted Username', {
    username,
    isLoggedIn: !!user,
    creditsRemaining: credits
  });

  // ... rest of submit logic
};
```

### Server-Side Events (via Client Callback)

For events that happen server-side (like purchase completion), trigger client-side tracking after receiving the response:

```typescript
// After successful purchase API response
const result = await fetch('/api/checkout/success');
if (result.ok) {
  track('Completed Purchase', {
    package: selectedPackage,
    price: packagePrice,
    credits: packageCredits,
    transactionId: result.transactionId
  });
}
```

---

## Testing Checklist

Before deploying, verify these events fire correctly:

- [ ] `Viewed Home` - Load homepage
- [ ] `Submitted Username` - Enter username and submit
- [ ] `Started Analysis` - Analysis begins
- [ ] `Completed Analysis` - Analysis finishes
- [ ] `Viewed Results` - Results page loads
- [ ] `Viewed Paywall` - Run out of credits
- [ ] `Selected Package` - Choose a package
- [ ] `Completed Purchase` - Complete test purchase
- [ ] `Clicked Share Button` - Click share
- [ ] `Completed Auth` - Sign in
- [ ] `Signed Out` - Sign out

Use Amplitude's debug mode during development:
```typescript
amplitude.init(API_KEY, { logLevel: amplitude.Types.LogLevel.Debug });
```

---

## Adding New Events

When adding new functionality:

1. Define event name using Title Case, Verb + Noun pattern
2. List all relevant properties
3. Add to this document under appropriate category
4. Implement using the patterns above
5. Test in Amplitude debug mode
