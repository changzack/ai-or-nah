# Problem statement
Implement the MVP described in `PRD.md` for **AI or Nah**: a mobile-first Next.js app that accepts an Instagram username/URL, scrapes account data (Apify), runs AI-image detection (Hive), computes an “AI likelihood” verdict + breakdown, caches results for shareable URLs, and enforces rate limits.
# Current state (repo)
Only documentation exists: `PRD.md`, `README.md`, `BRAND_GUIDELINE.md`, and an empty `PROJECT_PLAN.md`. There is no application code, no `package.json`, and the folder is not a git repository.
# Proposed changes overview
Create a Next.js (App Router) codebase with:
1. Backend/API routes for scraping, Hive scoring, caching, image storage, rate limiting, and error handling.
2. Frontend pages/components implementing the mobile-first UX + brand system, with a mobile-only desktop gate and shareable results URLs.
3. Infra/testing/docs to enable reliable local dev, deployment, and regression safety.
# Domain 1 — Foundation / Repo & App Scaffolding
1. Initialize repo + Next.js scaffold (TypeScript)
Files
* Create: `package.json`, `next.config.*`, `tsconfig.json`, `app/`, `public/`
* Create: `.env.example`, `.gitignore`
* Create: `README.md` updates (dev commands) (modify existing)
Dependencies
* None
References
* README: “Tech Stack” (Next.js) + “Project Structure”
* PRD: “Core Technologies” (Next.js)
Acceptance criteria
* `npm run dev` starts; base route renders on http://localhost:3000.
* `.env.example` contains all required keys from README (“Environment Variables”).
2. Add styling system aligned to brand guidelines
Files
* Create/modify: `app/globals.css`, `tailwind.config.*` (if Tailwind) or CSS variables theme file
* Modify: `app/layout.tsx` (global font + base layout)
Dependencies
* Domain 1 Task 1
References
* BRAND_GUIDELINE: palette, typography, spacing, cards/buttons specs
Acceptance criteria
* App uses brand colors/typography defaults; reusable card/button styles exist.
3. Establish shared types + constants used across domains
Files
* Create: `lib/types.ts` (DB row types / API payloads), `lib/constants.ts` (thresholds/verdict mapping), `lib/username.ts` (input parsing)
Dependencies
* Domain 1 Task 1
References
* PRD: Verdict thresholds (0–30 / 31–60 / 61–80 / 81–100), input flexibility rules
Acceptance criteria
* Pure functions exist for: username parsing from URL; verdict label mapping; consistent score rounding.
Cross-domain notes
* Frontend Domain Task 2 and Backend Domain Task 4 both depend on this domain’s shared types/constants.
# Domain 2 — Data Model & Storage (Supabase)
1. Define database schema for cached results + analytics timestamps
Files
* Create: `supabase/migrations/001_init.sql` (or `db/schema.sql` if not using Supabase CLI)
* Create: `lib/db/schema.ts` (optional: runtime validation)
Dependencies
* Domain 1 Task 3 (types/constants)
References
* PRD: “Data to Store in Database” + caching/90-day cleanup requirements
Acceptance criteria
* Tables cover (at minimum): `results` (per-username cached result), `result_images` (stored image refs), `ip_rate_limits` (daily usage), plus timestamps: `checked_at`, `last_accessed_at`, `view_count`.
2. Add Supabase clients (anon + service role)
Files
* Create: `lib/supabase/server.ts` (service role for API routes), `lib/supabase/client.ts` (if needed client-side)
* Modify: `.env.example`
Dependencies
* Domain 2 Task 1
References
* README: Supabase env vars
Acceptance criteria
* Server-side client can read/write to `results` in local/dev Supabase.
3. Storage buckets and image lifecycle hooks
Files
* Document bucket name + path conventions in `lib/storage.ts`
* Create: `lib/storage/supabase.ts`
Dependencies
* Domain 2 Task 2
References
* PRD: “Image Storage & Display” + auto-delete images when result expires
Acceptance criteria
* Given an image URL and username, code can upload image bytes to storage and store a stable reference in DB.
Cross-domain notes
* Backend Domain Task 6 (download/store images) depends on this domain.
* Frontend Domain Task 5 (thumbnail grid) depends on this domain.
# Domain 3 — Backend (Next.js API routes + core logic)
1. Implement username/URL normalization and validation
Files
* Modify: `lib/username.ts`
* Create: `lib/validation.ts`
Dependencies
* Domain 1 Task 3
References
* PRD: input flexibility + validation requirements
Acceptance criteria
* Accepts raw `@name`, `name`, `instagram.com/name?...`, rejects empty/invalid formats with clear error codes.
2. Implement cache lookup + “last checked” semantics
Files
* Create: `app/api/check/[username]/route.ts`
* Create/modify: `lib/db/results.ts`
Dependencies
* Domain 2 Task 2
References
* PRD: cached results served instantly; show “Last checked: X days ago”
Acceptance criteria
* API returns cached result if present; updates `last_accessed_at` and increments `view_count`.
3. Implement rate limiting for “fresh checks” (3/day/IP, reset midnight PST)
Files
* Create: `lib/rate_limit.ts`
* Create/modify: `app/api/analyze/route.ts` (enforce)
* Create/modify: `lib/db/rate_limits.ts`
Dependencies
* Domain 2 Task 1–2
References
* PRD: rate limiting rules + UX copy
Acceptance criteria
* A 4th fresh analysis request from same IP on the same PST day returns a deterministic “rate_limited” response.
* Cached views remain unlimited (no increment for cached page loads).
4. Apify integration: scrape profile + recent posts (target last ~9 image posts)
Files
* Create: `lib/apify.ts`
* Create: `lib/providers/instagram.ts` (adapter shaping data)
Dependencies
* Domain 1 Task 1–3
References
* PRD: “Scraping: Apify Instagram Profile Scraper” + “Data to Scrape” fields
Acceptance criteria
* Given a username, returns a normalized profile object including follower counts, bio, recent posts with image URLs, captions, timestamps, likes/comments).
5. Hive integration: AI probability per image + aggregation
Files
* Create: `lib/hive.ts`
* Create: `lib/scoring/image_scoring.ts`
Dependencies
* Domain 1 Task 3
References
* PRD: Hive endpoint + cost; “Image Analysis Section” language by score thresholds
Acceptance criteria
* Given N images, returns per-image score and aggregate average; supports partial failures with clear error handling.
6. Image download + storage (no hotlinking)
Files
* Create: `lib/images/fetch.ts` (download + content-type validation)
* Modify: `lib/storage/supabase.ts` (upload)
* Modify: `lib/db/results.ts` (store references)
Dependencies
* Domain 2 Task 3, Backend Task 4
References
* PRD: “Download Instagram images to server (not hotlink)” + auto-delete policy
Acceptance criteria
* For a successful analysis, stored result includes stable, app-owned image URLs for rendering thumbnails.
7. Profile-pattern heuristics (non-ML) for “THE PROFILE” + “THE PATTERN” sections
Files
* Create: `lib/scoring/profile_signals.ts`
* Create: `lib/scoring/consistency.ts`
Dependencies
* Backend Task 4–5
References
* PRD: posting frequency, caption repetitiveness, engagement ratio, bio indicators; consistency/variance messaging
Acceptance criteria
* Produces a deterministic list of factual red flags/green flags derived from scraped data (no hallucinated specifics).
8. Orchestrate `/api/analyze`: fresh scrape → score → persist → return
Files
* Create/modify: `app/api/analyze/route.ts`
* Create: `lib/analyze.ts` (workflow)
Dependencies
* Backend Tasks 2–7
References
* PRD: loading 30–60s; retry scraper 1 time; edge cases count against limit; caching behavior
Acceptance criteria
* If cached result exists, returns it without calling Apify/Hive.
* If not cached: enforces rate limit, runs workflow, persists, returns.
* Retries Apify once on failure; after two failures returns error payload per PRD.
9. Edge-case handling (private/not found, limited posts, mixed content, group-only)
Files
* Modify: `lib/providers/instagram.ts`, `lib/analyze.ts`
* Modify: API responses (typed error codes)
Dependencies
* Backend Task 4–8
References
* PRD: “Edge Case Handling” section
Acceptance criteria
* Each PRD edge case returns the specified user-facing state and counts toward daily checks where required.
10. Cleanup job plan for 90-day inactivity expiry
Files
* Create: `scripts/cleanup.ts` (or `app/api/cron/cleanup/route.ts`)
* Document deployment trigger (Vercel cron) in `README.md`
Dependencies
* Domain 2 Task 1–3
References
* PRD: 90-day inactivity cleanup, delete images with expired results
Acceptance criteria
* Running cleanup removes stale DB rows and storage objects older than policy based on `last_accessed_at`.
Cross-domain notes
* Frontend Domain Tasks 2–6 depend on Backend Tasks 2 and 8.
* Share/OG (Frontend Task 6) depends on Backend Task 2 (stable cached read).
# Domain 4 — Frontend (App Router pages, components, UX)
1. Mobile-only gating + desktop QR view
Files
* Create: `app/(marketing)/page.tsx` (landing)
* Create: `components/DesktopGate.tsx`
* Create: `components/QRCode.tsx` (or small library)
Dependencies
* Domain 1 Task 2
References
* PRD: “Desktop Handling” message + QR code requirement
Acceptance criteria
* On desktop widths, app shows “mobile-only” message + QR linking to site; no functional input.
2. Landing page: input field, validation messaging, submit
Files
* Modify/create: `app/page.tsx` (or route group)
* Create: `components/UsernameInput.tsx`
* Create: `components/Button.tsx`, `components/Card.tsx`
Dependencies
* Domain 1 Task 2–3
References
* PRD: “Landing Page” elements + input flexibility + validation
* BRAND_GUIDELINE: button/card sizing and spacing
Acceptance criteria
* Accepts username/URL; prevents empty submit; routes to loading/analyze flow.
Cross-domain dependencies
* Uses `lib/username.ts` (Foundation Task 3).
3. Loading experience (30–60s, progressive status updates)
Files
* Create: `app/check/[username]/loading.tsx` or `components/LoadingScreen.tsx`
* Create: client-side polling or server action wrapper in `lib/client/analyze.ts`
Dependencies
* Backend Domain Task 8
References
* PRD: “Loading Experience” requirements
Acceptance criteria
* Shows required progress messages; cannot be skipped; handles cached (<2s) vs fresh (longer) states.
4. Results page layout + verdict hero + sections
Files
* Create: `app/check/[username]/page.tsx`
* Create: `components/results/VerdictHero.tsx`, `ImageGrid.tsx`, `ProfileFlags.tsx`, `ConsistencyCard.tsx`, `BottomLineCard.tsx`, `EducationCard.tsx`
Dependencies
* Backend Domain Task 2, 8
References
* PRD: Results layout sections A–H + verdict thresholds + disclaimers
* BRAND_GUIDELINE: card hierarchy, typography sizing, emoji usage guidance
Acceptance criteria
* Renders verdict, percent, “last checked”, analyzed image count, and each required section.
* Includes disclaimer text per PRD (“entertainment purposes”).
5. Thumbnails grid from stored images
Files
* Modify: `components/results/ImageGrid.tsx`
* Ensure Next.js image config for remote/storage URLs in `next.config.*`
Dependencies
* Backend Domain Task 6
References
* PRD: “Image Storage & Display” + show thumbnails of analyzed images
Acceptance criteria
* Shows thumbnails for analyzed images; never hotlinks Instagram URLs.
6. Share UX + Open Graph meta tags
Files
* Create/modify: `app/check/[username]/page.tsx` (share button wiring)
* Create: `app/check/[username]/opengraph-image.tsx` (or static) and `generateMetadata` usage
* Create: `components/ShareButton.tsx`
Dependencies
* Backend Domain Task 2
References
* PRD: share URL format; OG tags title/description/image; native share sheet + clipboard fallback
Acceptance criteria
* Share button uses `navigator.share` when available; falls back to clipboard with toast.
* Shared link renders correct OG preview metadata.
7. Rate limit UI + error states
Files
* Create: `components/ErrorState.tsx`
* Modify: results/landing routing to display rate-limited message
Dependencies
* Backend Domain Task 3, 9
References
* PRD: exact rate limit copy + error handling behaviors
Acceptance criteria
* When rate limited, shows PRD copy and still allows viewing cached usernames.
Cross-domain notes
* Backend Task 9 must provide stable, typed error responses for UI mapping.
# Domain 5 — Security, Reliability, and Observability
1. Secrets and environment hardening
Files
* Modify: `.env.example` (no secrets committed)
* Create: `lib/env.ts` (runtime env validation)
Dependencies
* Domains 2–4 (env usage)
References
* README env list
Acceptance criteria
* App fails fast with clear error if required env vars missing.
2. Request timeouts, retries, and graceful failures
Files
* Modify: `lib/apify.ts`, `lib/hive.ts`, `lib/analyze.ts`
Dependencies
* Backend Task 4–8
References
* PRD: retry Apify once; user-facing failure message; prevent retry spam via rate limit counting
Acceptance criteria
* Analysis doesn’t hang indefinitely; errors are surfaced as user-mappable codes.
3. Basic logging
Files
* Create: `lib/log.ts`
* Modify: API routes to log key events (cache hit, scrape fail, hive fail)
Dependencies
* Backend tasks
Acceptance criteria
* Logs are structured enough to debug failures without leaking secrets.
# Domain 6 — Testing & QA
1. Unit tests for pure logic (parsing, scoring thresholds, heuristics)
Files
* Create: `tests/unit/*` (or `__tests__/*`) and test runner config
Dependencies
* Domain 1 Task 3; Backend Task 5,7
References
* PRD: verdict thresholds; consistency logic
Acceptance criteria
* Tests cover username normalization, verdict mapping, and at least 2 heuristic outputs.
2. Integration tests with mocked external providers
Files
* Create: `tests/integration/analyze.test.*`
* Add provider mocks for Apify/Hive
Dependencies
* Backend Task 8
Acceptance criteria
* One test for cached hit path; one test for fresh path; one test for rate-limit path.
3. Basic E2E smoke (optional but recommended)
Files
* Create: Playwright/Cypress setup + one happy-path test
Dependencies
* Frontend Tasks 2–4, Backend Task 8
Acceptance criteria
* Simulates entering username → sees loading → sees results UI.
# Domain 7 — Legal/Policy Pages (MVP)
1. Add disclaimers and Terms of Service page
Files
* Create: `app/terms/page.tsx`
* Modify: results page to include PRD disclaimer
Dependencies
* Frontend Task 4
References
* PRD: “Legal Protection” section
Acceptance criteria
* ToS route exists; results page contains disclaimer wording (entertainment/no guarantees).
# Domain 8 — Brand Redesign
Align the existing front-end with BRAND_GUIDELINE.md specifications. This domain merges the existing animation work (framer-motion, confetti, hooks) with a cohesive visual redesign.

1. Update global color palette and CSS variables
Files
* Modify: `app/globals.css`
* Modify: `tailwind.config.ts` (if custom colors needed)
Dependencies
* Domain 1 Task 2 (styling system)
References
* BRAND_GUIDELINE: Color Palette section (Warm Cream, Coral Pop, Soft Sage, Electric Violet, Sunny Yellow, Sky Blue)
* BRAND_GUIDELINE: Cards section (shadow specification)
Acceptance criteria
* App background is Warm Cream (#FDF6E9) throughout.
* All brand colors are defined as CSS variables and/or Tailwind classes.
* Card shadow updated to `0 4px 24px rgba(0,0,0,0.08)`.

2. Switch typography to Plus Jakarta Sans
Files
* Modify: `app/layout.tsx`
Dependencies
* Domain 1 Task 2
References
* BRAND_GUIDELINE: Typography section (Plus Jakarta Sans, weights 400/500/700/800)
Acceptance criteria
* All text renders in Plus Jakarta Sans.
* Font weights 400, 500, 700, 800 load correctly.

3. Update Button component to pill shape + brand colors
Files
* Modify: `components/ui/Button.tsx`
Dependencies
* Domain 8 Task 1 (color variables)
References
* BRAND_GUIDELINE: Components > Buttons (pill shape, Coral Pop primary, transparent secondary)
Acceptance criteria
* Buttons use rounded-full (pill shape).
* Primary buttons use Coral Pop (#FF6B6B).
* Secondary buttons have transparent background with 2px Charcoal border.
* Hover scale is 1.05.

4. Update Input component styling
Files
* Modify: `components/ui/Input.tsx`
Dependencies
* Domain 8 Task 1 (color variables)
References
* BRAND_GUIDELINE: Color Palette (accent colors for focus states)
Acceptance criteria
* Input focus glow uses brand accent color.
* Error states use Coral Pop (#FF6B6B).

5. Convert headlines to lowercase throughout
Files
* Modify: `app/page.tsx`
* Modify: `app/check/[username]/page.tsx`
* Modify: `components/results/VerdictHero.tsx`
* Modify: `components/results/FlagsCard.tsx`
* Modify: `components/results/BottomLineCard.tsx`
* Modify: `components/results/EducationCard.tsx`
Dependencies
* Domain 4 (Frontend pages exist)
References
* BRAND_GUIDELINE: Typography Rules (lowercase headlines are default)
Acceptance criteria
* All headlines use lowercase per brand guidelines.
* Subheads and body copy use sentence case.

6. Update card components with brand styling
Files
* Modify: `components/results/VerdictHero.tsx`
* Modify: `components/results/FlagsCard.tsx`
* Modify: `components/results/BottomLineCard.tsx`
* Modify: `components/results/EducationCard.tsx`
* Modify: `components/results/ImageGrid.tsx`
Dependencies
* Domain 8 Task 1 (color variables)
References
* BRAND_GUIDELINE: Components > Cards (16px radius, shadow, padding)
* BRAND_GUIDELINE: Color Palette (accent colors)
Acceptance criteria
* Cards have consistent 16px border-radius.
* Shadow matches brand spec: `0 4px 24px rgba(0,0,0,0.08)`.
* Accent colors align with brand palette (indigo → Electric Violet, green → Soft Sage).

7. Create Sticker component system
Files
* Create: `components/ui/Sticker.tsx`
* Modify: `app/page.tsx` (add stickers to hero)
* Modify: `app/check/[username]/page.tsx` (add stickers to results)
Dependencies
* Domain 8 Task 1 (styling foundation)
References
* BRAND_GUIDELINE: Visual Language > Sticker System (rotation, sizes, usage rules)
Acceptance criteria
* Sticker component supports rotation prop (5-15° range).
* Size variants: sm, md, lg.
* Core emoji set: 👁️ ✨ 🔍 ✅ 🚩 🤖 🎭 ⚡ 💫
* Max 3-5 stickers per section.

8. Update ShareButton with brand styling
Files
* Modify: `components/ShareButton.tsx`
Dependencies
* Domain 8 Task 1 (color variables), Domain 8 Task 3 (button styling)
References
* BRAND_GUIDELINE: Color Palette (Coral Pop for celebration)
Acceptance criteria
* Confetti colors use brand palette (Coral, Orange tones).
* Button styling follows brand button specs.

9. Final polish and consistency pass
Files
* All modified files from previous tasks
Dependencies
* Domain 8 Tasks 1–8
References
* BRAND_GUIDELINE: Animation Guidelines (150-300ms duration)
* BRAND_GUIDELINE: entire document
Acceptance criteria
* All pages use Warm Cream background.
* Loading states use brand personality.
* Error states follow brand tone.
* Animations are within 150-300ms per brand spec.
* No remnants of old color scheme.

Cross-domain notes
* This domain builds on top of existing Frontend Domain components.
* Animation infrastructure (framer-motion, hooks) is preserved and enhanced.
# Execution order across domains (high-level)
1. Domain 1 (scaffold/theme/types)
2. Domain 2 (DB/storage)
3. Domain 3 (backend workflow + caching + rate limit)
4. Domain 4 (frontend flows + OG/share)
5. Domain 5 (reliability/env/logging)
6. Domain 6 (tests)
7. Domain 7 (legal pages)
8. Domain 8 (brand redesign)
9. Domain 9 (monetization - Phase 2)

# Domain 9 — Monetization (Phase 2)
Add freemium monetization with device fingerprinting, credit packs via Stripe, and email-based identity restoration.

## Summary
- **Free tier:** 3 lifetime checks per device
- **Paid tier:** Credit packs ($2.99/5, $6.99/15, $14.99/50)
- **Identity:** Email via Stripe, no passwords
- **Key rule:** Credits only deducted on SUCCESSFUL analysis (errors preserve credits)

## Device Identity Model
Device tracking uses a two-layer approach for persistence:

1. **FingerprintJS hash** - Browser characteristics (canvas, fonts, screen, etc.) - NO IP
2. **localStorage token** - Random UUID stored client-side, persists across browser updates

**Matching logic (server-side):**
- If localStorage token matches existing device → same device
- Else if fingerprint matches existing device → same device (link token)
- Else → new device (create record, link both identifiers)

**What this catches:**
- Browser updates → still tracked (token survives)
- VPN usage → still tracked (IP not in hash)
- Clear cookies → still tracked (localStorage ≠ cookies)

**What resets identity:**
- Clear localStorage + fingerprint change → new device
- Different browser → new device (separate localStorage)

## New Dependencies
```json
{
  "@fingerprintjs/fingerprintjs": "^4.2.0",
  "stripe": "^14.0.0",
  "resend": "^2.0.0",
  "jose": "^5.2.0"
}
```

## New Environment Variables
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_SMALL=price_xxx
STRIPE_PRICE_MEDIUM=price_xxx
STRIPE_PRICE_LARGE=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Resend (email)
RESEND_API_KEY=re_xxx

# Session
SESSION_SECRET=<32-char-random-string>
```

## Tasks

### Phase A: Foundation

1. Install new dependencies
Files
* Modify: `package.json`
Dependencies
* None
Acceptance criteria
* `npm install` succeeds with all new packages.

2. Create database migration for monetization tables
Files
* Create: `supabase/migrations/003_monetization.sql`
Dependencies
* Domain 2 (existing schema)
References
* PRD: Phase 2 Database Schema
Acceptance criteria
* Tables: `customers`, `verification_codes`, `device_fingerprints`, `purchases`, `credit_transactions`
* `credit_transactions` table for audit trail: `id`, `customer_id`, `amount` (+/-), `reason` (enum: 'purchase', 'analysis', 'refund', 'admin_grant'), `result_id` (nullable, links to analysis), `created_at`
* `verification_codes` table includes `attempts` column (default 0) for brute-force protection
* Index on `verification_codes.expires_at` for efficient cleanup
* Proper indexes and triggers for `updated_at`

3. Update constants with monetization values
Files
* Modify: `lib/constants.ts`
Dependencies
* Task 1
Acceptance criteria
* `FREE_TIER.LIFETIME_CHECKS = 3`
* `CREDIT_PACKS` with small/medium/large pricing
* `SESSION` config (cookie name, expiry)

4. Update types with new domain types
Files
* Modify: `lib/types.ts`
Dependencies
* Task 1
Acceptance criteria
* Types: `Customer`, `SessionPayload`, `PaywallResult`, `DeviceFingerprint`, `Purchase`, `VerificationCode`

5. Update environment example
Files
* Modify: `.env.example`
Dependencies
* None
Acceptance criteria
* All new Stripe, Resend, and Session variables documented

### Phase B: Database Layer

6. Create customers database operations
Files
* Create: `lib/db/customers.ts`
Dependencies
* Task 2, Domain 2
Acceptance criteria
* Functions: `getCustomerByEmail`, `getCustomerById`, `createCustomer`, `addCredits`, `deductCredit`, `getCreditsBalance`
* `deductCredit` MUST use atomic operation: `UPDATE customers SET credits = credits - 1 WHERE id = $1 AND credits > 0 RETURNING credits`
* Returns `{ success: boolean, remainingCredits: number }` - success is false if credits were 0
* All credit changes recorded in `credit_transactions` table with reason

7. Create fingerprints database operations
Files
* Create: `lib/db/fingerprints.ts`
Dependencies
* Task 2
Acceptance criteria
* Functions: `getDeviceByToken`, `getDeviceByFingerprint`, `createDevice`, `linkTokenToDevice`, `getDeviceChecks`, `incrementDeviceChecks`
* Supports two-layer matching: token first, then fingerprint fallback
* Links new tokens to existing devices when fingerprint matches

8. Create purchases database operations
Files
* Create: `lib/db/purchases.ts`
Dependencies
* Task 2, Task 6
Acceptance criteria
* Functions: `recordPurchase`, `getPurchaseHistory`

### Phase C: Auth Infrastructure

9. Create session management with jose
Files
* Create: `lib/auth/session.ts`
Dependencies
* Tasks 3, 4
References
* PRD: Session Management (signed cookies)
Acceptance criteria
* Functions: `createSession`, `getSession`, `clearSession`
* Uses jose for JWT signing/verification
* Session stored in HTTP-only cookie

10. Create email verification with Resend
Files
* Create: `lib/auth/verification.ts`
* Create: `lib/email/templates.ts`
Dependencies
* Task 2, Domain 2
References
* PRD: Email Verification Flow
Acceptance criteria
* Functions: `sendVerificationCode`, `verifyCode`, `checkVerificationRateLimit`, `incrementVerifyAttempts`
* 6-digit code, 10-minute expiry
* Rate limit on SENDING: 3 codes per email per hour
* Rate limit on VERIFYING: 5 attempts per code, then code is invalidated (prevents brute force)
* `verifyCode` increments attempt counter before checking, returns specific error if max attempts exceeded
* Integrates with Resend API
* Email template: Clean, simple design with code prominently displayed

11. Create Stripe client and helpers
Files
* Create: `lib/stripe.ts`
Dependencies
* Task 3
References
* PRD: Stripe Integration
Acceptance criteria
* Stripe client initialization
* Functions: `createCheckoutSession`, `getCheckoutSession`
* Credit pack metadata handling

12. Create client-side device identity wrapper
Files
* Create: `lib/fingerprint.ts`
Dependencies
* Task 1
References
* PRD: Anti-Gaming Measures
Acceptance criteria
* Wrapper around FingerprintJS (NO IP in hash)
* Manages localStorage device token (UUID, persists across browser updates)
* Returns: `{ fingerprint: string, deviceToken: string }`
* Creates token on first visit, retrieves on subsequent visits

12b. Create CSRF protection utility
Files
* Create: `lib/auth/csrf.ts`
Dependencies
* None
Acceptance criteria
* `validateOrigin(request: Request): boolean` - checks Origin header against allowed origins
* Allowed origins: `NEXT_PUBLIC_SITE_URL` (production) + `localhost:3000` (dev)
* Returns false if Origin header missing or doesn't match
* Used by all state-changing POST endpoints (checkout, logout, send-code, verify)

### Phase D: API Endpoints

13. Create send verification code endpoint
Files
* Create: `app/api/auth/send-code/route.ts`
Dependencies
* Task 10, Task 12b
Acceptance criteria
* POST endpoint accepting email
* Validates `Origin` header (CSRF protection)
* Sends 6-digit code via Resend
* Rate limited: 3 codes per email per hour
* Returns 429 with retry time if rate limited

14. Create verify code endpoint
Files
* Create: `app/api/auth/verify/route.ts`
Dependencies
* Tasks 9, 10
Acceptance criteria
* POST endpoint accepting email + code
* Increments attempt counter BEFORE validating (prevents timing attacks)
* Returns 429 with "Too many attempts" if 5+ attempts on this code
* Creates session on success
* Returns customer info

15. Create logout endpoint
Files
* Create: `app/api/auth/logout/route.ts`
Dependencies
* Task 9
Acceptance criteria
* POST endpoint
* Validates `Origin` header matches site origin (CSRF protection)
* Clears session cookie

16. Create credits balance endpoint
Files
* Create: `app/api/credits/balance/route.ts`
Dependencies
* Tasks 6, 9
Acceptance criteria
* GET endpoint
* Returns credit balance for authenticated user
* Returns free checks remaining for anonymous user

17. Create checkout session endpoint
Files
* Create: `app/api/checkout/route.ts`
Dependencies
* Task 11
Acceptance criteria
* POST endpoint accepting pack size
* Validates `Origin` header matches site origin (CSRF protection)
* Creates Stripe Checkout session
* Returns checkout URL

18. Create Stripe webhook handler
Files
* Create: `app/api/webhook/route.ts`
Dependencies
* Tasks 6, 8, 11
References
* PRD: Webhook Handling
Acceptance criteria
* Handles `checkout.session.completed` event
* Verifies webhook signature
* **Idempotency check:** Query `purchases` table for `stripe_session_id` BEFORE processing - if exists, return 200 OK without re-adding credits (Stripe may send webhook multiple times)
* Creates customer if new (by email from Stripe)
* Adds credits to customer account (with `credit_transactions` audit entry)
* Records purchase with `stripe_session_id` as unique key

19. Create checkout success page
Files
* Create: `app/checkout/success/page.tsx`
Dependencies
* Tasks 9, 11, 17, 18
Acceptance criteria
* Receives Stripe session_id from redirect URL
* Verifies session completed via Stripe API (direct call, don't rely on webhook)
* Creates user session cookie (logs them in)
* Displays: "Payment successful!", credit balance, CTA to homepage
* **Error states to handle:**
  - No session_id in URL → "Something went wrong. Contact support."
  - Session status != 'complete' → "Payment not completed. Please try again."
  - Webhook delay (credits not yet in DB) → Poll every 2s for 10s, then show "Processing your purchase... Credits will appear shortly." with manual refresh option
  - Stripe API error → "Unable to verify payment. Your credits will appear within a few minutes."

19b. Create checkout cancelled page
Files
* Create: `app/checkout/cancelled/page.tsx`
Dependencies
* None
Acceptance criteria
* Simple page: "Checkout cancelled. No charges were made."
* CTA: "Return to AI or Nah" button → homepage
* Optional: "Try again" → return to paywall

### Phase E: Core Flow Modification

20. Modify analyze route for credit gating
Files
* Modify: `app/api/analyze/route.ts`
Dependencies
* Tasks 6, 7, 9
References
* PRD: Key rule - credits only on success
Acceptance criteria
* Pre-flight check: session OR device identity (fingerprint + token) required
* If authenticated: check credit balance
* If anonymous: check device free checks via two-layer matching
* Return 402 with paywall status if exhausted
* Deduct credit ONLY on successful analysis
* Errors (private account, not found, API failures) do NOT deduct credits

21. Deprecate old IP-based rate limiting
Files
* Modify: `lib/rate_limit.ts` (remove or feature-flag)
* Modify: `app/api/analyze/route.ts`
Dependencies
* Task 20
Acceptance criteria
* Old IP-based daily rate limiting disabled
* All rate limiting now uses device fingerprint system
* Clean removal, no dead code

### Phase F: UI Components

22. Create useAuth hook
Files
* Create: `hooks/useAuth.ts`
Dependencies
* Tasks 14, 15, 16
Acceptance criteria
* Manages auth state client-side
* Functions: `login`, `logout`, `checkAuth`
* Returns: `isAuthenticated`, `email`, `credits`, `isLoading`
* Hydrates auth state on page load via API call

23. Create useDeviceIdentity hook
Files
* Create: `hooks/useDeviceIdentity.ts`
Dependencies
* Task 12
Acceptance criteria
* Generates fingerprint + manages localStorage token
* Returns: `{ fingerprint, deviceToken, isLoading }`
* Creates token on first visit, retrieves on subsequent

24. Create Paywall component
Files
* Create: `components/Paywall.tsx`
Dependencies
* Tasks 17, 22
References
* PRD: Paywall Screen layout
Acceptance criteria
* Shows "You've used your free checks" message
* Displays 3 credit pack options with prices
* "Already purchased?" link to restore flow
* Opens Stripe Checkout on pack selection

25. Create CreditBadge component
Files
* Create: `components/CreditBadge.tsx`
Dependencies
* Task 22
References
* PRD: Credit Display (Authenticated Users)
Acceptance criteria
* Shows "[N credits]" badge in header
* Click opens dropdown: email, balance, "Buy more", "Sign out"

26. Create EmailVerification component
Files
* Create: `components/auth/EmailVerification.tsx`
Dependencies
* Tasks 13, 14
References
* PRD: Email Verification Screen
Acceptance criteria
* Two-step flow: enter email → enter code
* Masks email in second step (z***@gmail.com)
* Resend code option
* Shows rate limit message if 3 codes/hour exceeded

27. Create FreeChecksIndicator component
Files
* Create: `components/FreeChecksIndicator.tsx`
Dependencies
* Task 23
References
* PRD: Free Check Indicator
Acceptance criteria
* Subtle indicator: "X free checks remaining"
* Shown when checks remaining < 3 (i.e., after first use)
* Hidden when authenticated

### Phase G: Page Integration

28. Modify check page for paywall handling
Files
* Modify: `app/check/[username]/page.tsx`
Dependencies
* Tasks 20, 23, 24, 27
Acceptance criteria
* Sends device identity (fingerprint + token) with API request
* Handles 402 paywall response
* Shows Paywall component when triggered
* Shows FreeChecksIndicator on results

29. Create Header component and wire CreditBadge
Files
* Create: `components/Header.tsx` (if not exists, or modify existing)
* Modify: `app/layout.tsx` to include Header
Dependencies
* Task 25
Acceptance criteria
* Header component with logo/home link on left, optional `rightSlot` prop for additional content
* CreditBadge rendered in `rightSlot` when user is authenticated
* Header sticky on scroll (optional)
* Responsive: works on mobile and desktop
* Note: If Header already exists from earlier work, just add the rightSlot pattern

30. Modify Footer with FAQ link
Files
* Modify: `components/Footer.tsx`
Dependencies
* None
Acceptance criteria
* Add link to /faq page

31. Create FAQ page
Files
* Create: `app/faq/page.tsx`
Dependencies
* None
References
* PRD: FAQ Content
Acceptance criteria
* All FAQ questions from PRD
* Mobile-friendly layout
* Responsive for desktop
* Link back to home

### Phase G-2: Legal/Compliance Updates

31b. Update Privacy Policy for monetization
Files
* Modify: `app/privacy/page.tsx`
Dependencies
* None
Acceptance criteria
* Add section on payment data: "Stripe processes payments; we store email and purchase history"
* Add section on device fingerprinting: "We use browser fingerprinting for fraud prevention and rate limiting"
* Add section on email usage: "Transactional emails only (verification codes, receipts)"
* Link to Stripe's privacy policy

31c. Update Terms of Service for monetization
Files
* Modify: `app/terms/page.tsx`
Dependencies
* None
Acceptance criteria
* Add section on credit purchases: non-refundable by default, manual refunds available within 7 days
* Add section on account access: credits tied to email, no password recovery (email verification only)
* Add section on service availability: no guarantees on uptime, credits preserved if service unavailable
* Add prohibited use: no reselling credits, no automated purchasing

### Phase H: Testing

32. Unit tests for credit and fingerprint logic
Files
* Create: `lib/__tests__/db/customers.test.ts`
* Create: `lib/__tests__/db/fingerprints.test.ts`
* Create: `lib/__tests__/auth/session.test.ts`
Dependencies
* Tasks 6, 7, 9
Acceptance criteria
* Test credit deduction only on success
* Test device matching (token priority, fingerprint fallback)
* Test session creation/validation

33. Integration tests for auth flows
Files
* Create: `tests/integration/auth.test.ts`
Dependencies
* Tasks 13, 14, 15, 19
Acceptance criteria
* Test send code → verify code → session created
* Test rate limiting (3 codes/email/hour)
* Test checkout success → session created

34. Integration tests for payment flow
Files
* Create: `tests/integration/payment.test.ts`
Dependencies
* Tasks 17, 18, 19
Acceptance criteria
* Test checkout session creation
* Test webhook handling (mock Stripe signature)
* Test credits added after webhook

35. E2E test for purchase flow
Files
* Create: `tests/e2e/purchase.test.ts`
Dependencies
* All Phase G tasks
Acceptance criteria
* User hits paywall → selects pack → Stripe test checkout → returns with credits
* Uses Stripe test mode

36. Add verification code cleanup to cron
Files
* Modify: `scripts/cleanup.ts` or `app/api/cron/cleanup/route.ts`
Dependencies
* Task 10, Domain 3 Task 10
Acceptance criteria
* Deletes expired verification codes (older than 10 minutes)
* Runs with existing cleanup job

## Stripe Setup (Manual, One-time)
1. Create Stripe account
2. Create 3 products: "5 Checks" ($2.99), "15 Checks" ($6.99), "50 Checks" ($14.99)
3. Copy price IDs to env vars
4. Add webhook endpoint: `https://aiornah.ai/api/webhook`
5. Select event: `checkout.session.completed`
6. Copy webhook signing secret

## Verification Checklist

### Core Functionality
- [ ] Fresh user can analyze without indicator showing
- [ ] After 1st check, shows "2 free checks remaining"
- [ ] After 3rd check, paywall appears on next attempt
- [ ] Stripe Checkout opens with correct price
- [ ] Checkout success page shows credit balance
- [ ] Checkout cancelled page shows appropriate message
- [ ] After payment, credits visible in header badge
- [ ] Credits deduct only on successful analysis
- [ ] Failed analysis (private account, not found, API error) does NOT deduct
- [ ] Email verification restores credits on new device
- [ ] Logout clears session and hides credit badge

### Device Tracking
- [ ] Browser update does NOT reset free checks (localStorage token persists)
- [ ] VPN usage does NOT reset free checks (IP not in fingerprint)

### Security
- [ ] Verification code sending rate limit works (max 3/email/hour)
- [ ] Verification code attempt rate limit works (max 5 attempts/code, then code invalidated)
- [ ] Concurrent credit deduction doesn't allow double-spend (atomic update)
- [ ] Duplicate webhook doesn't add credits twice (idempotency check)
- [ ] POST endpoints reject requests with missing/invalid Origin header (CSRF)

### Error Handling
- [ ] Checkout success handles webhook delay gracefully (polling + fallback message)
- [ ] Checkout success handles invalid session_id
- [ ] Checkout success handles Stripe API errors

### UI/UX
- [ ] Mobile UI renders correctly
- [ ] Desktop UI renders correctly (Header with CreditBadge)

### Legal
- [ ] Privacy policy updated with fingerprinting disclosure
- [ ] Terms of service updated with credit/refund policy

## Notes

### Business Rules
- **Refunds:** Handle manually in Stripe dashboard within 7 days
- **Customer creation:** Happens at webhook (first purchase) - email verification looks up existing customer
- **Credit expiry:** Credits never expire

### Device Tracking
- **Fingerprint persistence:** Two-layer system (fingerprint + localStorage token) survives browser updates
- **Multi-device:** Each device gets 3 free checks (intentional per-device model)
- **Multi-browser:** Each browser on same device = separate "device" (acceptable)
- **IP not used:** Removed from fingerprint hash to prevent VPN gaming and avoid punishing shared networks
- **Rate limiting transition:** Old IP-based system explicitly removed in Task 21

### Security Measures
- **Verification brute-force:** 5 attempts max per code, then code invalidated
- **Credit race condition:** Atomic `UPDATE ... WHERE credits > 0` prevents double-spend
- **Webhook idempotency:** Check `stripe_session_id` exists before processing, prevents duplicate credits
- **CSRF protection:** Origin header validation on all state-changing POST endpoints
- **Audit trail:** All credit changes logged in `credit_transactions` table

# Domain 10 — Landing Page SEO & Content

Transform the homepage from utility-only to a hybrid landing page with SEO-optimized content sections below the fold.

## Summary
- Add scrollable content sections below hero for SEO
- Fix critical technical SEO gaps (h1, sitemap, structured data)
- Target organic search for AI detection queries
- Preserve conversion path (utility above fold)

## Tasks

### Phase A: Technical SEO Foundation

1. Add H1 tag to homepage
Files
* Modify: `app/page.tsx`
Dependencies
* None
References
* PRD: Landing Page SEO (H1 requirement)
Acceptance criteria
* Homepage has single `<h1>` tag with primary keyword
* Current large `<p>` headline converted to semantic `<h1>`
* H1 text: "Detect AI-Generated Instagram Accounts Instantly"

2. Create sitemap.ts
Files
* Create: `app/sitemap.ts`
Dependencies
* None
References
* PRD: SEO requirements
Acceptance criteria
* Dynamic sitemap includes: homepage (priority 1.0), /faq (0.7), /privacy (0.3), /terms (0.3)
* Accessible at /sitemap.xml
* Valid XML format

3. Create robots.ts
Files
* Create: `app/robots.ts`
Dependencies
* Task 2
Acceptance criteria
* Allows all crawlers
* References sitemap URL
* Accessible at /robots.txt

4. Update root layout metadata
Files
* Modify: `app/layout.tsx`
Dependencies
* None
References
* PRD: Landing Page SEO (meta tags)
Acceptance criteria
* metadataBase set to production URL
* Comprehensive title, description with keywords
* OpenGraph and Twitter card metadata
* Canonical URL configuration
* Keywords meta tag (AI detection, Instagram, fake account)

5. Verify/create OG image
Files
* Verify/create: `public/og-image.png`
Dependencies
* None
Acceptance criteria
* OG image exists at 1200x630px
* Referenced correctly in metadata

### Phase B: Content Sections

6. Create scroll indicator for hero
Files
* Modify: `app/page.tsx`
Dependencies
* Phase A complete
Acceptance criteria
* Subtle "Learn how it works" indicator below hero
* Smooth scroll on click
* Animates to draw attention

7. Create social proof bar component
Files
* Create: `components/landing/SocialProofBar.tsx`
* Modify: `app/page.tsx`
Dependencies
* Domain 2 (database)
Acceptance criteria
* Displays accounts analyzed count (from DB or static milestone)
* Shows "Results in 30 seconds" and "100% private"
* Styled consistent with brand

8. Create "The Problem" section
Files
* Create: `components/landing/ProblemSection.tsx`
* Modify: `app/page.tsx`
Dependencies
* Phase A Task 1 (heading hierarchy)
Acceptance criteria
* H2: "The AI Instagram Scam Epidemic"
* 150-200 words educational content
* Proper semantic `<section>` with id="problem"
* Mobile-responsive layout

9. Create "How It Works" section
Files
* Create: `components/landing/HowItWorksSection.tsx`
* Modify: `app/page.tsx`
Dependencies
* Task 8
Acceptance criteria
* H2: "How AI or Nah Detects Fake Accounts"
* 3-step visual process (H3 for each step)
* Icons/illustrations for each step
* Semantic section with id="how-it-works"

10. Create "Red Flags" section
Files
* Create: `components/landing/RedFlagsSection.tsx`
* Modify: `app/page.tsx`
Dependencies
* Task 9
Acceptance criteria
* H2: "5 Red Flags of AI Instagram Accounts"
* Checklist format with icons
* H3 for each flag
* Content matches PRD spec
* Semantic section with id="red-flags"

11. Create inline FAQ section with accordion
Files
* Create: `components/landing/FAQSection.tsx`
* Create: `components/ui/Accordion.tsx`
* Modify: `app/page.tsx`
Dependencies
* Task 10
Acceptance criteria
* H2: "Frequently Asked Questions"
* 5 questions in expandable accordion
* FAQPage JSON-LD schema embedded
* Link to full /faq page
* Semantic section with id="faq"

12. Create final CTA section
Files
* Create: `components/landing/FinalCTASection.tsx`
* Modify: `app/page.tsx`
Dependencies
* Task 11
Acceptance criteria
* H2: "Ready to Check an Account?"
* Duplicate of hero input form
* Semantic section with id="cta"

### Phase C: Structured Data

13. Add WebSite JSON-LD schema to homepage
Files
* Modify: `app/page.tsx` or `app/layout.tsx`
Dependencies
* Phase B complete
Acceptance criteria
* WebSite schema with name, URL, description
* SearchAction for direct username lookup
* Valid per schema.org validator

14. Ensure FAQPage schema in FAQ section
Files
* Verify: `components/landing/FAQSection.tsx`
Dependencies
* Task 11
Acceptance criteria
* FAQPage schema with all 5 questions
* mainEntity array properly formatted
* Valid per Google Rich Results Test

### Phase D: Heading Hierarchy & Accessibility

15. Audit and fix heading hierarchy
Files
* Modify: `app/page.tsx`
* Modify: All new section components
Dependencies
* Phase B complete
Acceptance criteria
* Single H1 at top
* H2 for each major section
* H3 for subsections (How It Works steps, Red Flags items)
* No skipped levels

16. Add semantic sections and ARIA
Files
* Modify: `app/page.tsx`
* Modify: All new section components
Dependencies
* Task 15
Acceptance criteria
* Each content block wrapped in `<section>`
* IDs on sections: problem, how-it-works, red-flags, faq, cta
* aria-labelledby attributes referencing H2 ids

## Cross-domain notes
* Depends on Domain 1 (styling foundation)
* Uses brand colors/typography from Domain 8
* FAQ section references /faq page from Domain 9 Task 31

## Verification Checklist

### Technical SEO
- [ ] H1 tag present on homepage (inspect element)
- [ ] /sitemap.xml returns valid XML
- [ ] /robots.txt returns valid content with sitemap reference
- [ ] Meta tags render correctly (view source)
- [ ] Canonical URL in head
- [ ] OG image loads at /og-image.png

### Structured Data
- [ ] WebSite schema validates at validator.schema.org
- [ ] FAQPage schema validates
- [ ] Google Rich Results Test passes

### Content
- [ ] All 6 sections render on homepage
- [ ] Scroll indicator works
- [ ] FAQ accordion expands/collapses
- [ ] Final CTA form functional

### Mobile
- [ ] All sections responsive at 375px width
- [ ] No horizontal scroll
- [ ] Touch targets adequate size

### Accessibility
- [ ] Heading hierarchy logical (H1 -> H2 -> H3)
- [ ] Screen reader navigation works
- [ ] Color contrast passes WCAG AA

### Performance
- [ ] PageSpeed Insights mobile score > 90
- [ ] No layout shift from new content
- [ ] Images optimized
