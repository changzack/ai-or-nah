import type { VerdictLevel } from "./types";

// Free tier limits
export const FREE_TIER = {
  LIFETIME_CHECKS: 3,
} as const;

// Credit pack type definition
// Note: Actual product configuration is now stored in Supabase products table
// See lib/db/products.ts for querying products
export type CreditPackId = "small" | "medium" | "large";

// Legacy constant for backward compatibility (values only, no Stripe IDs)
// Use getProduct() from lib/db/products.ts for full product data
export const CREDIT_PACK_INFO = {
  SMALL: { id: 'small' as CreditPackId, credits: 5, priceCents: 299 },
  MEDIUM: { id: 'medium' as CreditPackId, credits: 15, priceCents: 699 },
  LARGE: { id: 'large' as CreditPackId, credits: 50, priceCents: 1499 },
} as const;

// Session configuration
export const SESSION = {
  COOKIE_NAME: 'aion_session',
  EXPIRY_DAYS: 30,
} as const;

// Verification code configuration
export const VERIFICATION = {
  CODE_LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_SENDS_PER_HOUR: 3,
  MAX_ATTEMPTS_PER_CODE: 5,
} as const;

// Verdict thresholds per PRD
export const VERDICT_THRESHOLDS = {
  REAL_MAX: 30,
  UNCLEAR_MAX: 60,
  LIKELY_FAKE_MAX: 80,
  // 81-100 is "almost_definitely_fake"
} as const;

// Rate limiting per PRD
export const RATE_LIMIT = {
  MAX_FRESH_CHECKS_PER_DAY: 3,
  RESET_TIMEZONE: "America/Los_Angeles", // PST
} as const;

// Cache expiry per PRD
export const CACHE_EXPIRY_DAYS = 90;

// Image analysis per PRD
export const TARGET_IMAGE_COUNT = 9;

/**
 * Map AI likelihood score (0-100) to verdict level
 */
export function getVerdict(score: number): VerdictLevel {
  if (score <= VERDICT_THRESHOLDS.REAL_MAX) {
    return "real";
  } else if (score <= VERDICT_THRESHOLDS.UNCLEAR_MAX) {
    return "unclear";
  } else if (score <= VERDICT_THRESHOLDS.LIKELY_FAKE_MAX) {
    return "likely_fake";
  } else {
    return "almost_definitely_fake";
  }
}

/**
 * Get verdict label with emoji per PRD
 */
export function getVerdictLabel(verdict: VerdictLevel): string {
  switch (verdict) {
    case "real":
      return "✅ Probably Real";
    case "unclear":
      return "🤔 Hard to Tell";
    case "likely_fake":
      return "⚠️ Likely Fake";
    case "almost_definitely_fake":
      return "🤖 Almost Definitely Fake";
  }
}

/**
 * Get image analysis message based on score per PRD
 * Re-exported from utils to maintain backward compatibility
 */
export { getImageAnalysisMessage } from "./utils/analysis";
