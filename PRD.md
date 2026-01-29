AIorNAH PRD

# Product Requirements Document: AI or Nah

**Version:** 1.0  
**Last Updated:** January 25, 2026  
**Primary Audience:** Claude Code (AI Development Agent)  
**Product URL:** https://aiornah.xyz

---

## Executive Summary

**AI or Nah** is a mobile-first web tool that helps users verify whether Instagram accounts feature real people or AI-generated models. The tool addresses the growing problem of fake AI Instagram accounts creating OnlyFans scams to deceive users.

**Core Value Proposition:** Quick, entertaining, shareable verification of Instagram account authenticity with a focus on detecting AI-generated imagery and suspicious profile patterns.

---

## Problem Statement

There is a proliferation of fake AI Instagram accounts featuring AI-generated models posing as real people. These accounts create fake OnlyFans profiles to trick men into paying for content. Users currently have no easy way to verify if an Instagram account is real or AI-generated before engaging or sending money.

---

## Target User

**Primary User:** Men (18-45) who encounter suspicious Instagram accounts and want to verify authenticity before engaging, following, or sending money.

**User Context:**
- Browsing Instagram on mobile device
- Encounters attractive account with OnlyFans/Patreon link
- Suspicious but unsure
- Wants quick, definitive answer
- May want to share findings with friends

---

## Product Overview

### MVP Scope (Phase 1)

**Core Function:** Single username lookup tool that analyzes Instagram accounts and returns an AI likelihood score with entertaining, detailed breakdown.

**Key Characteristics:**
- Mobile-only experience (desktop shows "mobile only" message)
- Playful, casual, entertaining tone
- Viral-optimized (shareable results)
- No user accounts required
- Free to use with rate limits

---

## User Journey

### Primary Flow: First-Time User

1. User visits aiornah.xyz on mobile
2. Sees simple landing page with input field and headline
3. Enters Instagram username (or pastes URL)
4. Sees loading animation with progress updates:
   - "Fetching profile..."
   - "Analyzing images..."
   - "Calculating score..."
5. Views results page with verdict and breakdown
6. Can share results via native share sheet
7. Can check another account

### Secondary Flow: Viewing Shared Result

1. User clicks shared link (aiornah.xyz/check/username)
2. Instantly sees cached results page
3. Views verdict and breakdown
4. Sees "Last checked: X days ago" timestamp
5. Can check another account

---

## Feature Requirements

### 1. Landing Page

**Purpose:** Entry point for new users

**Elements:**
- Product name/logo: "AI or Nah"
- Headline explaining purpose (e.g., "Check if your IG crush is real")
- Single input field for Instagram username/URL
- Submit button
- Simple explainer text (1-2 sentences)

**Input Flexibility:**
- Accept username only: `suspiciousmodel123`
- Accept full URL: `https://instagram.com/suspiciousmodel123`
- Accept URL with parameters: `instagram.com/suspiciousmodel123?hl=en`
- Strip to username backend

**Validation:**
- Show error if input is empty
- Show error if format is invalid

### 1b. Launch Optimization (SEO + Viral + Trust)

**Purpose:** Minimal technical SEO foundation + viral sharing optimization + lightweight trust-building. Prioritizes social sharing (the actual growth lever) over speculative SEO content.

**Philosophy:**
- Users arrive with intent (they have a suspicious account) — don't make them scroll through content
- Growth comes from viral sharing, not Google rankings (new domain, no authority)
- Trust-building should be concise, not content marketing

**Page Structure:**

1. **Above the Fold (Hero)**
   - Logo, H1 headline, input form, CTA button
   - Goal: Immediate utility for ready users

2. **Below the Fold (Minimal)**
   - Trust signals bar: "Results in seconds • 100% private • No account needed"
   - How it works: 3 compact steps with icons (~50 words total)
   - Footer with links to FAQ, Terms, Privacy

**Trust Signals Bar:**
- Display: "Results in seconds • 100% private • No account needed"
- No fake account counts at launch — only add when real
- Subtle styling, doesn't compete with input form

**How It Works Section:**
- 3 steps with icons (no H2 required, visual hierarchy only):
  1. 🔍 "Profile Analysis" — We scan posts, bio, and engagement patterns
  2. 🤖 "AI Detection" — Each image is checked for AI-generated signs
  3. 📊 "Your Verdict" — Get a clear score with detailed breakdown
- Compact design, confidence-building without content bloat

**Viral Sharing Optimization:**

This is the primary growth lever. Optimize for shares, not SEO.

- **Dynamic OG images:** Results pages generate images showing username + verdict (e.g., "🤖 @username: 87% Likely AI")
- **Engaging share copy:** OG title/description that makes people want to click
- **Screenshot-friendly design:** Verdict hero looks good when screenshotted, includes brand/URL
- **Share button copy:** Engaging text, not just "Share"

**Technical SEO (Basics Only):**
- Single H1 tag on homepage
- sitemap.xml (excludes /check/* result pages)
- robots.txt (disallows /check/*)
- Root metadata with title, description, OG tags
- OG image at 1200x630px

**What's NOT Included (Intentionally):**

| Removed | Reason |
|---------|--------|
| "The Problem" section | Users already know the problem |
| "Red Flags" checklist | SEO play, not conversion |
| Inline FAQ accordion | Just link to /faq |
| Final CTA section | Input is above fold |
| FAQPage JSON-LD | Premature optimization |
| WebSite JSON-LD | Premature optimization |

**Future Consideration:**
If organic search becomes meaningful (3+ months post-launch), revisit SEO content investment based on actual data.

### 2. Loading Experience

**Purpose:** Keep user engaged during 30-60 second analysis

**Requirements:**
- Animated loading indicator
- Progressive status updates:
  - "Fetching profile..."
  - "Analyzing images..."
  - "Calculating score..."
- Cannot be skipped or interrupted
- Mobile-optimized animation

### 3. Results Page - Core Display

**Purpose:** Show AI likelihood verdict with entertaining breakdown

**Layout Structure (Top to Bottom):**

#### A. Verdict Section (Hero)
- Large, prominent AI likelihood percentage (e.g., "81%")
- Clear verdict statement: "Almost Definitely Fake" / "Probably Real" / "Likely Fake"
- Emoji indicator (🤖 for fake, ✅ for real)

**Verdict Thresholds:**
- 0-30%: "Probably Real ✅"
- 31-60%: "Unclear 🤔" 
- 61-80%: "Likely Fake ⚠️"
- 81-100%: "Almost Definitely Fake 🤖"

#### B. Image Analysis Section
**Header:** "📸 THE IMAGES"

**Display:**
- Show number of images analyzed: "Analyzed 9 images"
- Show average AI likelihood score across all images
- Use general language based on score thresholds (Hive API provides overall score, not specific breakdowns):
  - High score (80%+): "Our AI detection system flagged these images as highly likely to be AI-generated."
  - Medium score (50-79%): "Our AI detection system found suspicious patterns in these images."
  - Low score (<50%): "These images appear to be authentic photographs."

#### C. Profile Pattern Section
**Header:** "👤 THE PROFILE"

**Display specific, factual red flags:**
- ❌ "Posts every single day at 9am like a robot" (if posting pattern is too consistent)
- ❌ "Every caption: 'Hey guys 💕 DM me'" (if captions are repetitive/generic)
- ❌ "Zero pics with actual friends" (if all solo photos)
- ❌ "10K followers but only 50 likes per post?" (if engagement ratio is suspicious)
- ✅ "Captions seem natural and varied" (if captions are diverse)

**Factual Data Points to Detect:**
- Posting frequency pattern
- Caption repetitiveness
- Content variety (all selfies vs mixed content)
- Engagement ratio (followers vs likes/comments)
- Bio indicators (OnlyFans link, Patreon, "DM for collab")

#### D. Consistency Check Section
**Header:** "🎯 THE PATTERN"

**Display:**
- ❌ "Every. Single. Photo. screams AI (all 80%+)" (if all images score high)
- ❌ "AI scores are suspiciously consistent across all posts" (if scores have low variance)
- ✅ "Some variety in the AI detection scores" (if mixed scores)

#### E. Bottom Line Section
**Clear action statement:**
- For high AI likelihood: "💡 Bottom line: This is AI-generated. Don't send money."
- For low AI likelihood: "💡 Bottom line: Looks legit. But stay cautious."
- For unclear: "💡 Bottom line: Hard to tell. Trust your instincts."

#### F. Educational Context
**Quick tips after results:**
```
🚩 Common red flags you can spot yourself:
- Perfect skin in every photo (no blemishes, pores)
- Identical face/body across all posts
- Captions that feel generic or copy-pasted
- Account promises content "in DMs" or "on OnlyFans"
```

#### G. Action Buttons
- **"Share This Result"** - Primary action, prominent button
  - Opens native mobile share sheet
  - Shares URL: aiornah.xyz/check/username
- **"Check Another Account"** - Secondary button
  - Returns to landing page input

#### H. Metadata Display
- "Last checked: X days ago" timestamp
- "Analyzed X images" count

### 4. Share Functionality

**Requirements:**
- Generate clean, shareable URL: `aiornah.xyz/check/username`
- Implement Open Graph meta tags for rich link previews:
  - Title: "🤖 @username: 81% Likely AI - AI or Nah"
  - Description: "Check if your IG crush is real"
  - Image: Product logo or generic preview image
- Native mobile share sheet on button click
- Copy link to clipboard fallback
- Show confirmation toast: "Link copied! Share with friends"

**Shared Link Experience:**
- Clicking shared link shows full results page immediately
- No re-authentication or input required
- Same layout as original results
- Shows "Last checked: X days ago" timestamp
- Has "Check Another Account" button

### 5. Caching & Database

**Requirements:**
- Every lookup result is stored in database
- Results are cached indefinitely by default
- Cached results are served instantly when same username is searched
- URL structure supports direct access: `aiornah.xyz/check/username`

**Auto-Cleanup Logic:**
- Delete cached results after 90 days of inactivity (no new checks)
- Timer resets every time username is searched again
- Popular/frequently checked accounts persist indefinitely
- Inactive results naturally expire

**Cache Indicator:**
- For cached results: Show "Last checked: 3 days ago"
- For fresh results: Show "Last checked: Just now"
- Use faster loading animation for cached results (< 2 seconds)

### 6. Rate Limiting

**Requirements:**
- 3 fresh lookups per IP address per day
- Unlimited views of cached results (no limit)
- Resets at midnight PST daily

**User Experience:**
- When limit reached, show message:
  - "You've used your 3 daily checks. Results reset at midnight PST."
  - "Or check accounts others have already searched!"
- Failed lookups (account not found, private, etc.) still count against limit
- No workaround or bypass in MVP

### 7. Edge Case Handling

#### Account Not Found / Private
**Scenario:** Instagram account doesn't exist, is private, or has no posts

**Handling:**
- Show simple error: "Account not found or is private"
- Counts against daily rate limit
- No suggestions for similar usernames

#### Limited Posts (1-3 posts only)
**Scenario:** Account has very few posts to analyze

**Handling:**
- Still run analysis on available posts
- Add disclaimer to results: "⚠️ Limited data available (only 2 posts). Results less reliable."
- Show normal verdict with caveat

#### Mixed Content
**Scenario:** Account posts mix of selfies, memes, landscapes

**Handling:**
- Only analyze photos with people/faces
- Show in results: "Analyzed 4 of 9 posts (others were memes/landscapes)"
- If no analyzable photos: "Insufficient individual photos to analyze"

#### Group Photos Only
**Scenario:** Account only has group photos, no clear individual shots

**Handling:**
- Show message: "Insufficient individual photos to analyze. This tool works best on accounts with solo portraits."
- Still counts against rate limit

#### Scraping Failures
**Scenario:** Apify scraper fails (Instagram blocking, timeout, service unavailable, etc.)

**Handling:**
- Retry automatically 1 time with 5-second delay
- After 2 failures, show error: "Couldn't analyze this account right now. Try again in a few minutes."
- Counts against daily rate limit (prevents retry spam)

### 8. Image Storage & Display

**Requirements:**
- Download Instagram images to server (not hotlink)
- Store images for cached results
- Display thumbnails on results page showing analyzed images
- Auto-delete images when result expires (90 days inactive)

**What to Show:**
- Number of images analyzed
- Thumbnails of analyzed images (3x3 grid or scrollable)
- Images prove what was analyzed for transparency

### 9. Legal Protection

**Disclaimers:**
- On results page: "⚠️ This is an automated analysis for entertainment purposes. Results are not definitive proof."
- Terms of Service page (separate): "Use at your own risk, not legal advice, no guarantees, etc."
- No "Report incorrect result" feature in MVP

### 10. Desktop Experience

**Requirement:** Mobile-only for MVP

**Desktop Handling:**
- Detect desktop viewport on page load
- Show centered message: "AI or Nah is currently mobile-only. Please visit on your phone."
- Show QR code linking to aiornah.xyz for easy mobile access
- No functional features on desktop

---

## Technical Requirements Summary

### Core Technologies
- **Scraping:** Apify Instagram Profile Scraper (handles proxies and anti-detection)
- **AI Detection:** Hive Moderation API for image analysis
- **Frontend Framework:** Next.js (React-based, SSR for OG meta tags)
- **Hosting:** Vercel (optimized for Next.js, free tier available)
- **Database:** Supabase (PostgreSQL, free tier with 500MB)
- **Image Storage:** Supabase Storage or Cloudflare R2 (S3-compatible, generous free tier)

### Data to Scrape from Instagram (via Apify)
- Profile username
- Follower count
- Following count
- Post count
- Bio text
- Last 9 image posts (URLs)
- Post captions
- Post dates/timestamps
- Engagement metrics (likes, comments)
- Public/private status

### Data to Store in Database
**Per cached result:**
- Instagram username
- AI likelihood score (0-100)
- Breakdown scores (image analysis, profile patterns, consistency)
- Red flags list (text array)
- Number of images analyzed
- Image URLs or stored images
- Timestamp of check
- Last accessed timestamp (for 90-day cleanup)
- View count (for analytics)

### API Integration
**Hive Moderation API:**
- Endpoint: POST image URLs for AI detection
- Response: AI probability score per image
- Calculate average across all analyzed images
- Cost: ~$0.001-0.002 per image

### Rate Limiting Implementation
- Track by IP address
- Store daily check count per IP in cache/database
- Reset counter at midnight PST
- Differentiate fresh checks vs cached views

---

## Success Metrics

**MVP Success Criteria (Qualitative):**
- Personal validation: Creator uses it 10+ times and finds it useful
- Small group validation: 5+ friends use it and report value
- Organic traction: 100+ searches from strangers (via Reddit/Twitter sharing)
- Viral indicator: At least one shared result gets reshared multiple times

**Note:** Formal analytics tracking is deferred to post-MVP. MVP success will be measured qualitatively through manual observation and user feedback.

---

## User Flows

### Flow 1: New User First Check (Fresh Scrape)
```
1. User opens aiornah.xyz on mobile
2. Sees landing page with input field
3. Enters "suspiciousmodel123"
4. Taps submit
5. Sees loading animation (30-60 seconds)
   - "Fetching profile..."
   - "Analyzing images..."
   - "Calculating score..."
6. Results page loads
7. Views verdict: "81% - Almost Definitely Fake 🤖"
8. Scrolls through breakdown sections
9. Taps "Share This Result"
10. Native share sheet opens
11. Shares to friend via text/Instagram DM
```

### Flow 2: User Checks Cached Result
```
1. User opens aiornah.xyz
2. Enters username that was checked 3 days ago
3. Brief loading animation (< 2 seconds)
4. Results page loads instantly
5. Sees "Last checked: 3 days ago"
6. Views same verdict and breakdown
7. Taps "Check Another Account"
```

### Flow 3: User Clicks Shared Link
```
1. User receives text: "Check this out: aiornah.xyz/check/suspiciousmodel123"
2. Taps link on mobile
3. Results page loads immediately (cached)
4. Views full verdict and breakdown
5. Sees "Last checked: 5 days ago"
6. Taps "Check Another Account" to try their own search
7. Enters new username
```

### Flow 4: User Hits Rate Limit
```
1. User has checked 3 accounts today
2. Attempts 4th check
3. Sees message: "You've used your 3 daily checks. Results reset at midnight PST. Or check accounts others have already searched!"
4. Can still view cached results by entering usernames others have checked
5. Cannot perform fresh scrapes until tomorrow
```

### Flow 5: Account Not Found
```
1. User enters username for private/deleted account
2. Loading animation runs
3. Scraper attempts to fetch profile
4. Error detected
5. Error message: "Account not found or is private"
6. This counts against their 3 daily checks
7. User can try different username
```

---

## Out of Scope (Phase 2 Features)

**Not included in MVP:**
- User accounts / authentication
- Browse/trending section (view all checked accounts)
- Popular searches leaderboard
- Community voting (upvote/downvote accuracy)
- Watchlist / follow suspicious accounts
- Comparison tool (compare multiple accounts)
- Browser extension
- Desktop-optimized experience
- Admin dashboard (analytics visualization)
- Analytics tracking tool integration (e.g., Plausible, PostHog, Google Analytics)
- "Report account deleted" functionality
- GPT-4 Vision specific image analysis (using general Hive API scores)
- Refresh/re-check button for stale data
- API access for developers
- Face similarity detection across images

---

## Phase 2: Monetization

**Goal:** Implement a lightweight freemium model to generate revenue as a side hustle without requiring enterprise-level infrastructure.

### Monetization Model Overview

**Approach:** Credit-based system with email as durable identity (no passwords)

| Tier | Access | Identity |
|------|--------|----------|
| Free | 3 checks lifetime | Device fingerprint + IP |
| Paid | Credit packs | Email (via Stripe) |

---

### Free Tier

**Allocation:**
- 3 free checks per device (lifetime, not daily)
- Tracked via device fingerprint + IP combination

**Fingerprint Composition:**
```
hash(IP + userAgent + timezone + screenResolution + language + canvasFingerprint)
```

**Rationale:** Lifetime limit (vs daily) prevents gaming via VPN/waiting. Fingerprint + IP catches 80-90% of casual abuse.

---

### Credit System

**Pricing Tiers:**

| Pack | Price | Per Check | Notes |
|------|-------|-----------|-------|
| 5 checks | $2.99 | $0.60 | Entry point |
| 15 checks | $6.99 | $0.47 | Anchor/default |
| 50 checks | $14.99 | $0.30 | Best value |

**Rules:**
- 1 credit = 1 analysis
- Credits never expire
- Credits tied to email address (Stripe customer)
- Balance visible in header when authenticated

---

### Identity & Authentication

**Approach:** Email as identity, no passwords

**Purchase Flow:**
1. User hits free tier limit
2. Selects credit pack
3. Redirects to Stripe Checkout (hosted)
4. Stripe collects email + payment
5. Webhook creates/updates customer in Supabase
6. Redirect back with success, session cookie set
7. User continues with credits available

**Returning Customer Flow:**
1. User hits paywall, clicks "Already purchased?"
2. Enters email address
3. Receives 6-digit verification code (10-min expiry)
4. Enters code, session restored
5. Credits available for use

**Session Management:**
- Signed session cookie after verification
- Cookie contains: email, customer_id, signature
- Server validates on each request
- No password storage, no reset flows

---

### Anti-Gaming Measures

**Layered Protection:**

| Layer | Method | Catches |
|-------|--------|---------|
| 1 | Device fingerprint | Same browser |
| 2 | IP address | Same network |
| 3 | Fingerprint + IP hash | Most casual users |
| 4 | Email verification (paid) | Durable identity |

**Future Enhancements (Not MVP):**
- Disposable email detection (block tempmail, guerrillamail)
- VPN/proxy detection (flag, don't block)
- Velocity checks (many emails from same IP)

---

### User Experience

#### Free Check Indicator
- **Style:** Subtle (not prominent)
- **Location:** Results page after first check
- **Copy:** "2 free checks remaining"

#### Paywall Screen
- **Trigger:** When free checks exhausted AND user tries to analyze
- **Behavior:** Hard gate (no analysis run, saves API costs)

**Paywall Layout:**
```
┌─────────────────────────────────────┐
│  You've used your free checks       │
│                                     │
│  Get more checks to continue        │
│  analyzing Instagram accounts       │
│                                     │
│  [5 for $2.99]  [15 for $6.99]     │
│           [50 for $14.99]           │
│                                     │
│  Already purchased? [Restore]       │
└─────────────────────────────────────┘
```

#### Credit Display (Authenticated Users)
- **Location:** Header, right side
- **Display:** "[12 credits] 👤" badge
- **On click:** Dropdown showing email, balance, "Buy more", "Sign out"

#### Email Verification Screen
```
┌─────────────────────────────────────┐
│  Restore your credits               │
│                                     │
│  Enter the email you used to        │
│  purchase:                          │
│                                     │
│  [________________________]         │
│  [Send verification code]           │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Check your email                   │
│                                     │
│  We sent a 6-digit code to          │
│  z***@gmail.com                     │
│                                     │
│  [______]                           │
│  [Verify]     Didn't get it? Resend │
└─────────────────────────────────────┘
```

---

### Database Schema Additions

**New Tables:**

```sql
-- Customers (paid users)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification codes (email auth)
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device fingerprints (free tier tracking)
CREATE TABLE device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash TEXT UNIQUE NOT NULL,
  checks_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase history (audit trail)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  credits_purchased INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/checkout` | POST | Create Stripe Checkout session |
| `/api/webhook` | POST | Handle Stripe webhook (payment success) |
| `/api/auth/send-code` | POST | Send 6-digit verification code |
| `/api/auth/verify` | POST | Verify code, create session |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/credits/balance` | GET | Get current credit balance |

---

### Stripe Integration

**Required:**
- Stripe account (standard)
- Products created for each credit pack
- Webhook endpoint for `checkout.session.completed`
- Checkout session with `customer_email` pre-filled (if known)

**Checkout Session Metadata:**
- `credits`: Number of credits purchased
- `redirect_username`: Username they were trying to check (for deep-link back)

**Webhook Handling:**
1. Verify webhook signature
2. Extract customer email and credits from session
3. Create or update customer record
4. Add credits to balance
5. Log purchase for audit

---

### FAQ Content

**Location:** Footer link to `/faq`

**Required Questions:**

```markdown
## How does AI or Nah work?
We analyze Instagram profile images using AI detection
technology and evaluate account patterns like posting
frequency, engagement ratios, and bio characteristics.

## How accurate is this?
Our tool provides an estimate, not a definitive answer.
AI detection is an evolving field. Use results as one
data point, not absolute truth. For entertainment purposes.

## Do I get free checks?
Yes, you get 3 free checks. After that, you can purchase
credit packs starting at $2.99.

## How do credits work?
1 credit = 1 account analysis. Credits never expire and
are tied to your email address.

## I purchased credits but can't access them
Tap "Already purchased?" on the upgrade screen and enter
the email you used at checkout. We'll send a verification
code to restore access.

## Can I get a refund?
Contact us within 7 days of purchase if you're unsatisfied.
We'll review on a case-by-case basis.

## What data do you store?
- Analysis results (cached 90 days)
- Customer emails for purchased accounts
- We don't store Instagram passwords or access your accounts

## How do I contact support?
Email: support@aiornah.ai
```

---

### Implementation Priority

1. **Database:** Add new tables (customers, verification_codes, device_fingerprints, purchases)
2. **Fingerprinting:** Client-side fingerprint generation + server storage
3. **Free tier gating:** Update rate limiting to use fingerprint instead of IP-only
4. **Stripe integration:** Checkout session + webhook handler
5. **Email verification:** Send code + verify endpoints
6. **Session management:** Signed cookies, middleware for auth state
7. **UI components:** Paywall screen, credit display, verification flow
8. **FAQ page:** Static content page

---

### Privacy Policy Updates Required

Add sections covering:
- Payment data handling (Stripe processes, we store email + purchase history)
- Device fingerprinting for rate limiting
- Email usage (transactional only, no marketing without consent)

---

## Open Questions & Risks

### Technical Risks
1. **Apify service reliability:** Dependent on third-party scraping service
   - Mitigation: Apify is well-established with maintained scrapers; free tier sufficient for MVP volume

2. **API costs:** Hive API (~$0.001-0.002/image) and Apify costs scale with usage
   - Mitigation: Cache aggressively, 90-day cleanup keeps storage manageable; free tiers cover MVP usage

3. **Apify scraper changes:** Instagram changes may temporarily break Apify scrapers
   - Mitigation: Apify maintains their scrapers; implement graceful failure handling

### Legal/Ethical Risks
1. **Copyright concerns:** Hosting Instagram images
   - Mitigation: 90-day auto-cleanup, disclaimer language, entertainment purposes framing
   
2. **Defamation concerns:** Publicly calling accounts "fake"
   - Mitigation: Strong disclaimer, "entertainment purposes," probabilistic language ("81% likely")
   
3. **Terms of Service violations:** Instagram prohibits scraping
   - Mitigation: Small-scale MVP, low volume, personal use focus

### Product Risks
1. **Accuracy:** What if tool is frequently wrong?
   - Mitigation: Be honest about limitations, use probabilistic language, educate users
   
2. **Low adoption:** What if no one uses it?
   - Mitigation: MVP approach validates concept cheaply, viral sharing mechanic built in
   
3. **Abuse:** What if people use it to harass real creators?
   - Mitigation: Rate limiting, disclaimer language, no comment/reporting features that enable harassment

---

## Implementation Notes for Claude Code

### Development Approach
- Build mobile-first (viewport width < 768px)
- Test on actual mobile device, not just browser dev tools
- Start with happy path (successful scrape + high AI score)
- Add edge case handling incrementally
- Use placeholder data initially before connecting real APIs

### Priority Order
1. Project setup (Next.js, Supabase, environment configuration)
2. Landing page + input handling
3. Apify Instagram scraping integration
4. Hive API integration
5. Results page layout with playful copy
6. Database caching (Supabase)
7. Rate limiting
8. Share functionality + OG meta tags
9. Edge case handling
10. Image storage (Supabase Storage)
11. Desktop QR code experience
12. Polish and optimization

### Testing Recommendations
- Test with known AI accounts (search "AI influencer" on Instagram)
- Test with verified real accounts (celebrities)
- Test edge cases (private accounts, low post count)
- Test rate limiting with multiple IPs
- Test sharing functionality across different apps (SMS, Instagram DM, Twitter)
- Test cache expiry logic
- Test OG meta tags render correctly when sharing links

---

## Appendix: Copy Examples

### Landing Page Headline Options
- "Is your IG crush real? Find out in 30 seconds."
- "Check if that Instagram model is actually AI"
- "Don't get catfished. Verify before you slide into DMs."

### Results Page Verdict Copy (Tone Examples)

**High AI Likelihood (81-100%):**
- "🤖 Almost Definitely Fake (87%)"
- Bottom line: "This is AI-generated. Don't send money."

**Medium AI Likelihood (61-80%):**
- "⚠️ Likely Fake (73%)"
- Bottom line: "Multiple red flags detected. Proceed with extreme caution."

**Unclear (31-60%):**
- "🤔 Hard to Tell (52%)"
- Bottom line: "Some suspicious signs, but not conclusive. Trust your gut."

**Low AI Likelihood (0-30%):**
- "✅ Probably Real (23%)"
- Bottom line: "Looks legit based on our analysis. But stay cautious online."

---

## Launch Readiness Requirements

This section defines minimum requirements for public launch, addressing legal, trust, observability, and user experience gaps.

### 1. Legal & Trust Foundation

**About Page (/about) - Required**

Must include:
- What AI or Nah is and does (1-2 paragraphs)
- Why it was created (problem it solves)
- How it works (high-level, non-technical explanation)
- Disclaimers:
  - "This tool provides probabilistic analysis for informational purposes only"
  - "Results are not definitive proof of AI generation or authenticity"
  - "AI or Nah is not affiliated with Instagram, Meta, or any analyzed accounts"
- Contact information (support@aiornah.ai)

**Contact Mechanism - Required**
- Functional email inbox at support@aiornah.ai
- Response time expectation stated on /about page

**Disclaimer Visibility - Required**
- Results page must display disclaimer prominently
- Disclaimer text: "This analysis is probabilistic and for informational purposes only. Not affiliated with Instagram or Meta."

---

### 2. Result Page Indexation

**noindex Directive - Required**

All `/check/*` result pages must be non-indexable:
- Add `robots: { index: false, follow: false }` metadata
- Exclude from sitemap
- Rationale: Publishing third-party profile judgments creates legal/reputation risk

---

### 3. Analytics & Observability

**Product Analytics - Required**
- Implement privacy-friendly analytics (Plausible, Fathom, or similar)
- Track: page views, unique visitors, conversion funnel
- No personally identifiable information collected

**Error Monitoring - Required**
- Implement error tracking (Sentry or similar)
- Capture: JavaScript errors, API failures, unhandled exceptions
- Alert on error rate spikes

---

### 4. Refund & Support Process

**Refund Policy - Required**
- Document 7-day refund window in Terms of Service
- Process: User emails support@aiornah.ai within 7 days
- Manual review and Stripe refund if approved
- No automated refund mechanism required for MVP

**Support Inbox - Required**
- Functional support@aiornah.ai inbox
- Check at least daily during launch period
- Template responses for common issues (can't access credits, refund requests)

---

### 5. Credit Deduction for Cached Results

**Same-User Cache Policy - Required**

When a user checks the same username multiple times:
- First check: Deduct 1 credit (or 1 free check)
- Subsequent checks by SAME user for SAME username: Free (no credit deduction)
- Different user checking same cached username: Still deducts credit

**Implementation:**
- Track user-username pairs that have been charged
- For anonymous users: Use device fingerprint + username
- For authenticated users: Use customer_id + username
- Store in new table or add column to existing structure

**Rationale:** Prevents frustration when users re-check an account (e.g., to share results or revisit). Different users still pay because they haven't seen the result before.

---

### 6. Launch Checklist

**Before Public Launch:**
- [ ] /about page live with all required content
- [ ] support@aiornah.ai inbox functional and monitored
- [ ] noindex on all /check/* pages
- [ ] Analytics installed and tracking
- [ ] Error monitoring installed and alerting
- [ ] Refund policy documented in /terms
- [ ] Same-user cache policy implemented
- [ ] Test Stripe webhook with real payment
- [ ] Disclaimer visible on results page

---

**End of PRD**