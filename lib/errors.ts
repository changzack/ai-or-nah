import type { ErrorCode } from "./types";

/**
 * Error handling utilities for AI or Nah
 */

export class AIOrNahError extends Error {
  constructor(
    public code: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AIOrNahError";
  }
}

/**
 * Get user-facing error message for error codes
 */
export function getErrorMessage(code: ErrorCode): string {
  switch (code) {
    case "account_not_found":
      return "Account not found or is private";
    case "account_private":
      return "This account is private and cannot be analyzed";
    case "insufficient_posts":
      return "This account doesn't have enough posts to analyze";
    case "insufficient_photos":
      return "Insufficient individual photos to analyze. This tool works best on accounts with solo portraits.";
    case "scraping_failed":
      return "Couldn't analyze this account right now. Try again in a few minutes.";
    case "analysis_failed":
      return "Failed to analyze images. Please try again later.";
    case "invalid_username":
      return "Invalid Instagram username or URL. Try again.";
    default:
      return "An error occurred. Please try again.";
  }
}

/**
 * Check if profile has sufficient data for analysis
 */
export function validateProfileForAnalysis(profile: {
  posts: unknown[];
  isPrivate: boolean;
}): { valid: boolean; error?: ErrorCode } {
  // Check if private
  if (profile.isPrivate) {
    return { valid: false, error: "account_private" };
  }

  // Check if has posts
  if (!profile.posts || profile.posts.length === 0) {
    return { valid: false, error: "insufficient_posts" };
  }

  // All good
  return { valid: true };
}

/**
 * Determine if an error should count against rate limit
 * Per PRD: All checks count against limit, including failures
 */
export function shouldCountAgainstRateLimit(errorCode?: ErrorCode): boolean {
  // All errors count against rate limit to prevent spam
  return true;
}
