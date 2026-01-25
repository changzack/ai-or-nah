import type { AIImageScore } from "../types";

/**
 * Provider-Agnostic AI Detection Integration
 *
 * Routes to the appropriate AI detection provider based on environment configuration.
 * Supports instant provider switching via AI_DETECTION_PROVIDER env variable.
 *
 * Supported providers:
 * - 'sightengine' (default): Sightengine AI detection with batch processing
 * - 'hive': Legacy Hive AI detection (deprecated)
 */

type AIProvider = "sightengine" | "hive";

/**
 * Get the configured AI detection provider
 */
function getProvider(): AIProvider {
  const provider = process.env.AI_DETECTION_PROVIDER as AIProvider;

  // Default to sightengine if not specified or invalid
  if (provider !== "sightengine" && provider !== "hive") {
    return "sightengine";
  }

  return provider;
}

/**
 * Analyze a single image for AI generation
 * Routes to the configured provider
 */
export async function analyzeImage(imageUrl: string): Promise<AIImageScore | null> {
  const provider = getProvider();

  if (provider === "hive") {
    console.warn("[AI Detection] Using deprecated Hive provider. Consider switching to Sightengine.");
    const { analyzeImage: hiveAnalyze } = await import("./hive");
    return hiveAnalyze(imageUrl);
  }

  const { analyzeImage: sightengineAnalyze } = await import("./sightengine");
  return sightengineAnalyze(imageUrl);
}

/**
 * Analyze multiple images for AI generation
 * Routes to the configured provider with batch processing support
 */
export async function analyzeImages(imageUrls: string[]): Promise<AIImageScore[]> {
  const provider = getProvider();

  if (provider === "hive") {
    console.warn("[AI Detection] Using deprecated Hive provider. Consider switching to Sightengine.");
    const { analyzeImages: hiveAnalyze } = await import("./hive");
    return hiveAnalyze(imageUrls);
  }

  const { analyzeImages: sightengineAnalyze } = await import("./sightengine");
  return sightengineAnalyze(imageUrls);
}

/**
 * Calculate average AI probability from image analysis results
 * This is a simple synchronous calculation, no need for provider-specific logic
 */
export function calculateAverageAIProbability(results: AIImageScore[]): number {
  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    return 0;
  }

  const sum = successfulResults.reduce((acc, r) => acc + r.aiProbability, 0);
  return sum / successfulResults.length;
}

/**
 * Get the current provider name for debugging/logging
 */
export function getCurrentProvider(): AIProvider {
  return getProvider();
}
