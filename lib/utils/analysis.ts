/**
 * Analysis utility functions
 * Centralized location to avoid circular import issues
 */

/**
 * Get user-friendly image analysis message based on AI detection score
 * @param score - AI detection score (0-1 scale, where 1 = definitely AI)
 * @returns Human-readable message about the analysis results
 */
export function getImageAnalysisMessage(score: number): string {
  if (score < 0.3) {
    return "The faces in these photos look pretty natural to me.";
  }
  if (score < 0.6) {
    return "Some of these photos have that AI-generated vibe, but it's hard to say for sure.";
  }
  if (score < 0.8) {
    return "Most of these faces have telltale signs of AI generation.";
  }
  return "These photos are almost certainly AI-generated. The patterns are unmistakable.";
}
