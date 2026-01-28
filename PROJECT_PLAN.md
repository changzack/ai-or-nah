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
- **Free tier:** 3 lifetime checks per device (fingerprint + IP hash)
- **Paid tier:** Credit packs ($2.99/5, $6.99/15, $14.99/50)
- **Identity:** Email via Stripe, no passwords
- **Key rule:** Credits only deducted on SUCCESSFUL analysis

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
* Tables: `customers`, `verification_codes`, `device_fingerprints`, `purchases`
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

7. Create fingerprints database operations
Files
* Create: `lib/db/fingerprints.ts`
Dependencies
* Task 2
Acceptance criteria
* Functions: `getDeviceChecks`, `incrementDeviceChecks`, `createOrGetDevice`

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
Dependencies
* Task 2, Domain 2
References
* PRD: Email Verification Flow
Acceptance criteria
* Functions: `sendVerificationCode`, `verifyCode`
* 6-digit code, 10-minute expiry
* Integrates with Resend API

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

12. Create client-side fingerprint wrapper
Files
* Create: `lib/fingerprint.ts`
Dependencies
* Task 1
References
* PRD: Anti-Gaming Measures
Acceptance criteria
* Wrapper around FingerprintJS
* Returns stable hash for device identification

### Phase D: API Endpoints

13. Create send verification code endpoint
Files
* Create: `app/api/auth/send-code/route.ts`
Dependencies
* Task 10
Acceptance criteria
* POST endpoint accepting email
* Sends 6-digit code via Resend
* Rate limited to prevent abuse

14. Create verify code endpoint
Files
* Create: `app/api/auth/verify/route.ts`
Dependencies
* Tasks 9, 10
Acceptance criteria
* POST endpoint accepting email + code
* Creates session on success
* Returns customer info

15. Create logout endpoint
Files
* Create: `app/api/auth/logout/route.ts`
Dependencies
* Task 9
Acceptance criteria
* POST endpoint
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
* Adds credits to customer account
* Records purchase

### Phase E: Core Flow Modification

19. Modify analyze route for credit gating
Files
* Modify: `app/api/analyze/route.ts`
Dependencies
* Tasks 6, 7, 9
References
* PRD: Key rule - credits only on success
Acceptance criteria
* Pre-flight check: session OR fingerprint required
* If authenticated: check credit balance
* If anonymous: check device free checks
* Return 402 with paywall status if exhausted
* Deduct credit ONLY on successful analysis

### Phase F: UI Components

20. Create useAuth hook
Files
* Create: `hooks/useAuth.ts`
Dependencies
* Tasks 14, 15, 16
Acceptance criteria
* Manages auth state client-side
* Functions: `login`, `logout`, `checkAuth`
* Returns: `isAuthenticated`, `email`, `credits`

21. Create useFingerprint hook
Files
* Create: `hooks/useFingerprint.ts`
Dependencies
* Task 12
Acceptance criteria
* Generates and caches device fingerprint
* Returns: `fingerprint`, `isLoading`

22. Create Paywall component
Files
* Create: `components/Paywall.tsx`
Dependencies
* Tasks 17, 20
References
* PRD: Paywall Screen layout
Acceptance criteria
* Shows "You've used your free checks" message
* Displays 3 credit pack options with prices
* "Already purchased?" link to restore flow
* Opens Stripe Checkout on pack selection

23. Create CreditBadge component
Files
* Create: `components/CreditBadge.tsx`
Dependencies
* Task 20
References
* PRD: Credit Display (Authenticated Users)
Acceptance criteria
* Shows "[N credits]" badge in header
* Click opens dropdown: email, balance, "Buy more", "Sign out"

24. Create EmailVerification component
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

25. Create FreeChecksIndicator component
Files
* Create: `components/FreeChecksIndicator.tsx`
Dependencies
* Task 21
References
* PRD: Free Check Indicator
Acceptance criteria
* Subtle indicator: "X free checks remaining"
* Only shown after first check
* Hidden when authenticated

### Phase G: Page Integration

26. Modify check page for paywall handling
Files
* Modify: `app/check/[username]/page.tsx`
Dependencies
* Tasks 19, 21, 22, 25
Acceptance criteria
* Sends fingerprint header with API request
* Handles 402 paywall response
* Shows Paywall component when triggered
* Shows FreeChecksIndicator on results

27. Modify layout for CreditBadge
Files
* Modify: `app/layout.tsx`
Dependencies
* Task 23
Acceptance criteria
* CreditBadge in header (right side)
* Only visible when authenticated

28. Modify Footer with FAQ link
Files
* Modify: `components/Footer.tsx`
Dependencies
* None
Acceptance criteria
* Add link to /faq page

29. Create FAQ page
Files
* Create: `app/faq/page.tsx`
Dependencies
* None
References
* PRD: FAQ Content
Acceptance criteria
* All FAQ questions from PRD
* Mobile-friendly layout
* Link back to home

## Stripe Setup (Manual, One-time)
1. Create Stripe account
2. Create 3 products: "5 Checks" ($2.99), "15 Checks" ($6.99), "50 Checks" ($14.99)
3. Copy price IDs to env vars
4. Add webhook endpoint: `https://aiornah.ai/api/webhook`
5. Select event: `checkout.session.completed`
6. Copy webhook signing secret

## Verification Checklist
- [ ] Fresh user can analyze without indicator
- [ ] After 1st check, shows "2 free checks remaining"
- [ ] After 3rd check, paywall appears on next attempt
- [ ] Stripe Checkout opens with correct price
- [ ] After payment, credits visible in header
- [ ] Credits deduct only on successful analysis
- [ ] Failed analysis (private account) does NOT deduct
- [ ] Email verification restores credits on new device
- [ ] Logout clears session
- [ ] Mobile UI renders correctly

## Notes
- **Refunds:** Handle manually in Stripe dashboard
- **Fingerprint stability:** Browser updates may reset (acceptable - user gets new free tier)
- **Multi-device:** Each device gets 3 free checks (acceptable tradeoff)
- **Rate limiting:** Old IP-based system deprecated once fingerprint system is live
