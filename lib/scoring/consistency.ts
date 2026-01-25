import type { InstagramPost, RedFlag, AIImageScore } from "../types";

/**
 * Consistency analysis for "THE PATTERN" section
 * Analyzes caption repetitiveness, engagement patterns, AI score consistency
 */

/**
 * Analyze consistency across posts
 */
export function analyzeConsistency(
  posts: InstagramPost[],
  aiScores: AIImageScore[]
): RedFlag[] {
  const flags: RedFlag[] = [];

  // Caption analysis
  const captionFlags = analyzeCaptions(posts);
  flags.push(...captionFlags);

  // Engagement ratio analysis
  const engagementFlag = analyzeEngagement(posts);
  if (engagementFlag) flags.push(engagementFlag);

  // AI score consistency
  const aiConsistencyFlag = analyzeAIScoreConsistency(aiScores);
  if (aiConsistencyFlag) flags.push(aiConsistencyFlag);

  return flags;
}

/**
 * Analyze caption patterns for repetitiveness
 */
function analyzeCaptions(posts: InstagramPost[]): RedFlag[] {
  const flags: RedFlag[] = [];

  const captions = posts
    .map((p) => p.caption || "")
    .filter((c) => c.length > 0);

  if (captions.length < 3) {
    return flags; // Not enough data
  }

  // Check for identical or very similar captions
  const uniqueCaptions = new Set(captions.map((c) => c.toLowerCase().trim()));

  if (uniqueCaptions.size < captions.length * 0.5) {
    flags.push({
      type: "negative",
      message: "Many captions are identical or very similar. Bots often reuse captions.",
    });
  }

  // Check for generic captions
  const genericPatterns = [
    /^(hey|hi|hello)[\s!]*$/i,
    /^(good morning|good night)[\s!]*$/i,
  ];

  const genericCount = captions.filter((caption) =>
    genericPatterns.some((pattern) => pattern.test(caption))
  ).length;

  if (genericCount > captions.length * 0.5) {
    flags.push({
      type: "negative",
      message: "Most captions are generic phrases or just emojis. Lacks personal touch.",
    });
  }

  // Check for repetitive emoji usage (simplified pattern)
  const allEmojis: string[] = [];
  for (const caption of captions) {
    // Simple check: if caption is very short and has no letters, likely just emojis
    if (caption.length < 20 && !/[a-zA-Z]/.test(caption)) {
      allEmojis.push(caption);
    }
  }

  if (allEmojis.length > 0) {
    const uniqueEmojis = new Set(allEmojis);
    if (uniqueEmojis.size < 5 && allEmojis.length > 10) {
      flags.push({
        type: "negative",
        message: "Uses the same few emojis repeatedly. Bot-like behavior.",
      });
    }
  }

  return flags;
}

/**
 * Analyze engagement (likes/comments) patterns
 */
function analyzeEngagement(posts: InstagramPost[]): RedFlag | null {
  if (posts.length < 3) {
    return null;
  }

  const ratios = posts
    .filter((p) => p.likesCount > 0)
    .map((p) => {
      const total = p.likesCount + p.commentsCount;
      return total > 0 ? p.commentsCount / total : 0;
    });

  if (ratios.length === 0) {
    return null;
  }

  const avgCommentRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;

  // Red flag: Very low engagement ratio (lots of likes, few comments)
  // Real accounts typically get ~1-5% comments, fake accounts often < 0.5%
  if (avgCommentRatio < 0.005 && posts[0].likesCount > 100) {
    return {
      type: "negative",
      message: "Very high likes but almost no comments. Possible fake engagement.",
    };
  }

  // Red flag: Suspiciously consistent engagement
  const variance = calculateVariance(ratios);
  if (variance < 0.0001 && ratios.length > 5) {
    return {
      type: "negative",
      message: "Engagement ratios are suspiciously consistent across all posts.",
    };
  }

  return null;
}

/**
 * Analyze AI score consistency across images
 */
function analyzeAIScoreConsistency(scores: AIImageScore[]): RedFlag | null {
  const successfulScores = scores
    .filter((s) => s.success)
    .map((s) => s.aiProbability);

  if (successfulScores.length < 3) {
    return null;
  }

  const avgScore = successfulScores.reduce((sum, s) => sum + s, 0) / successfulScores.length;

  // Red flag: ALL photos have high AI scores
  if (avgScore > 0.8 && successfulScores.every((s) => s > 0.7)) {
    return {
      type: "negative",
      message: `All photos scored ${Math.round(avgScore * 100)}%+ AI probability. Consistent AI generation.`,
    };
  }

  // Red flag: Very consistent high scores (low variance)
  const variance = calculateVariance(successfulScores);
  if (variance < 0.01 && avgScore > 0.6) {
    return {
      type: "negative",
      message: "All images show nearly identical AI patterns. Likely same AI generator.",
    };
  }

  // Green flag: Mixed scores suggest real photos
  if (variance > 0.1 && avgScore < 0.5) {
    return {
      type: "positive",
      message: "Image AI scores vary naturally. Suggests real photos.",
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
