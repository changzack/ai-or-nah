import type { InstagramProfile, RedFlag } from "../types";

/**
 * Profile pattern heuristics (non-ML) for "THE PROFILE" section
 * Analyzes follower patterns, bio, posting behavior
 */

/**
 * Analyze profile for suspicious patterns
 * Returns list of red flags and green flags
 */
export function analyzeProfileSignals(profile: InstagramProfile): RedFlag[] {
  const flags: RedFlag[] = [];

  // Verified account check (green flag - check first as it's a strong positive signal)
  const verifiedFlag = analyzeVerifiedStatus(profile);
  if (verifiedFlag) flags.push(verifiedFlag);

  // Username pattern analysis
  const usernameFlags = analyzeUsername(profile.username);
  flags.push(...usernameFlags);

  // Missing full name check
  const fullNameFlag = analyzeFullName(profile.fullName);
  if (fullNameFlag) flags.push(fullNameFlag);

  // Follower-to-following ratio analysis
  const followerRatio = analyzeFollowerRatio(profile);
  if (followerRatio) flags.push(followerRatio);

  // Bio analysis
  const bioFlags = analyzeBio(profile.bio);
  flags.push(...bioFlags);

  // Posting frequency (if we can infer from post count and timestamps)
  const postingFlag = analyzePostingFrequency(profile);
  if (postingFlag) flags.push(postingFlag);

  // Account age indicators (based on post count vs follower count)
  const accountAgeFlag = analyzeAccountAge(profile);
  if (accountAgeFlag) flags.push(accountAgeFlag);

  // Stale account detection
  const staleFlag = analyzeStaleAccount(profile);
  if (staleFlag) flags.push(staleFlag);

  return flags;
}

/**
 * Analyze verified status
 * Verified accounts are extremely unlikely to be AI/fake
 */
function analyzeVerifiedStatus(profile: InstagramProfile): RedFlag | null {
  if (profile.verified) {
    return {
      type: "positive",
      message: "Verified account. Instagram has confirmed this identity.",
    };
  }
  return null;
}

/**
 * Analyze username for suspicious patterns
 * Bots often have auto-generated usernames
 */
function analyzeUsername(username: string): RedFlag[] {
  const flags: RedFlag[] = [];

  // Pattern: Random numbers at end (e.g., emma_2847362, emma2847362)
  if (/[a-z]+_?\d{4,}$/i.test(username)) {
    flags.push({
      type: "negative",
      message: "Username has suspicious random number suffix.",
    });
  }

  // Pattern: Bot-generated pattern (e.g., sx234ok, ab12cd34)
  if (/^[a-z]{2,3}\d+[a-z]*\d*$/i.test(username)) {
    flags.push({
      type: "negative",
      message: "Username follows bot-generated pattern.",
    });
  }

  // Pattern: Excessive underscores (3 or more)
  const underscoreCount = (username.match(/_/g) || []).length;
  if (underscoreCount >= 3) {
    flags.push({
      type: "negative",
      message: "Username has multiple underscores. Common in fake accounts.",
    });
  }

  return flags;
}

/**
 * Analyze full name field
 * Real users typically add their display name
 */
function analyzeFullName(fullName?: string): RedFlag | null {
  if (!fullName || fullName.trim().length === 0) {
    return {
      type: "negative",
      message: "No display name set. Real users typically add their name.",
    };
  }
  return null;
}

/**
 * Analyze follower-to-following ratio
 * Real accounts typically have balanced ratios or follow more than they're followed
 * Fake accounts often have high followers, low following
 */
function analyzeFollowerRatio(profile: InstagramProfile): RedFlag | null {
  const { followerCount, followingCount } = profile;

  if (followingCount === 0) {
    return null; // Can't calculate ratio
  }

  const ratio = followerCount / followingCount;

  // Suspicious: Very high follower-to-following ratio
  if (ratio > 100 && followerCount > 10000) {
    return {
      type: "negative",
      message: `${formatNumber(followerCount)} followers but only following ${followingCount}. Unusual for real accounts.`,
    };
  }

  // Suspicious: Moderate followers, follows almost nobody
  if (ratio > 50 && followerCount > 5000) {
    return {
      type: "negative",
      message: `${formatNumber(followerCount)} followers, following ${followingCount}. Fake accounts rarely follow others.`,
    };
  }

  // Green flag: Balanced ratio
  if (ratio < 5 && followerCount < 50000) {
    return {
      type: "positive",
      message: "Balanced follower-to-following ratio. Normal for real accounts.",
    };
  }

  return null;
}

/**
 * Analyze bio text for suspicious patterns
 */
function analyzeBio(bio?: string): RedFlag[] {
  const flags: RedFlag[] = [];

  if (!bio || bio.trim().length === 0) {
    flags.push({
      type: "negative",
      message: "Empty bio. Many AI accounts lack personal details.",
    });
    return flags;
  }

  const bioLower = bio.toLowerCase();

  // Red flags: Common OnlyFans/scam indicators
  const onlyFansTerms = ["onlyfans", "of link", "link in bio", "exclusive content", "subscribe"];
  if (onlyFansTerms.some((term) => bioLower.includes(term))) {
    flags.push({
      type: "negative",
      message: 'Bio mentions OnlyFans or "link in bio". Common in fake accounts.',
    });
  }

  // Red flags: Generic/bot-like language
  const genericPhrases = ["dm me", "dm for", "cashapp", "venmo", "paypal"];
  if (genericPhrases.some((phrase) => bioLower.includes(phrase))) {
    flags.push({
      type: "negative",
      message: "Bio requests DMs or payment info. Red flag for scam accounts.",
    });
  }

  // Green flag: Detailed personal bio
  if (bio.length > 100 && !bioLower.includes("link")) {
    flags.push({
      type: "positive",
      message: "Detailed bio with personal information. Good sign.",
    });
  }

  return flags;
}

/**
 * Analyze posting frequency based on post timestamps
 */
function analyzePostingFrequency(profile: InstagramProfile): RedFlag | null {
  const { posts } = profile;

  if (posts.length < 3) {
    return null; // Not enough data
  }

  // Check if posts are at suspiciously regular intervals
  const timestamps = posts
    .map((p) => new Date(p.timestamp).getTime())
    .sort((a, b) => b - a);

  const intervals: number[] = [];
  for (let i = 0; i < timestamps.length - 1; i++) {
    intervals.push(timestamps[i] - timestamps[i + 1]);
  }

  // Calculate average interval
  const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
  const dayInMs = 86400000;

  // Red flag: Posts at very regular intervals (daily at same time)
  const variance = calculateVariance(intervals);
  const isRegular = variance < avgInterval * 0.1; // Very low variance

  if (isRegular && avgInterval < dayInMs * 2) {
    return {
      type: "negative",
      message: "Posts at suspiciously regular intervals. Bots often post on schedule.",
    };
  }

  return null;
}

/**
 * Analyze account age relative to follower count
 */
function analyzeAccountAge(profile: InstagramProfile): RedFlag | null {
  const { followerCount, postCount } = profile;

  // Red flag: High followers, very few posts
  if (followerCount > 10000 && postCount < 20) {
    return {
      type: "negative",
      message: `${formatNumber(followerCount)} followers but only ${postCount} posts. Unusual growth pattern.`,
    };
  }

  // Red flag: Massive followers, moderate posts (bought followers?)
  if (followerCount > 50000 && postCount < 50) {
    return {
      type: "negative",
      message: `${formatNumber(followerCount)} followers with ${postCount} posts. Possible bought followers.`,
    };
  }

  return null;
}

/**
 * Analyze stale accounts
 * Accounts with high followers but no recent posts may be abandoned or inactive
 */
function analyzeStaleAccount(profile: InstagramProfile): RedFlag | null {
  const { posts, followerCount } = profile;

  if (posts.length === 0 || followerCount < 5000) {
    return null;
  }

  // Get the most recent post timestamp
  const timestamps = posts.map((p) => new Date(p.timestamp).getTime());
  const mostRecentPost = Math.max(...timestamps);
  const now = Date.now();
  const sixMonthsMs = 180 * 24 * 60 * 60 * 1000; // ~6 months in milliseconds

  if (now - mostRecentPost > sixMonthsMs) {
    return {
      type: "negative",
      message: `No recent posts despite ${formatNumber(followerCount)} followers. Account may be abandoned or inactive.`,
    };
  }

  return null;
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
}

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
