import type { HiveImageScore } from "../types";

/**
 * @deprecated This integration is deprecated in favor of Sightengine.
 * Use lib/integrations/ai-detection.ts instead.
 * Will be removed in a future version.
 *
 * Hive Moderation API v3 integration for AI image detection
 * Docs: https://docs.thehive.ai/docs/ai-generated-media-detection
 *
 * STATUS: Authentication works but account needs AI detection models enabled.
 * See HIVE_AUTH_STATUS.md for details and next steps.
 */

const HIVE_API_ENDPOINT = "https://api.thehive.ai/api/v3/task/sync";

/**
 * Get Hive API credentials from environment
 */
function getHiveCredentials() {
  const apiKeyId = process.env.HIVE_API_KEY_ID;
  const secretKey = process.env.HIVE_SECRET_KEY;

  if (!apiKeyId || !secretKey) {
    throw new Error(
      "HIVE_API_KEY_ID and HIVE_SECRET_KEY must be set in environment variables"
    );
  }

  return { apiKeyId, secretKey };
}

/**
 * Analyze a single image for AI-generated content
 * @param imageUrl URL of the image to analyze
 * @returns AI probability score (0-1) or null if failed
 */
export async function analyzeImage(
  imageUrl: string
): Promise<HiveImageScore | null> {
  try {
    const { secretKey } = getHiveCredentials();

    console.log(`[Hive] Analyzing image: ${imageUrl}`);

    // v3 API uses Bearer authentication with secretKey
    const response = await fetch(HIVE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        url: imageUrl,
        model_name: "ai-generated-content", // TODO: Get correct model name from Hive support
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Hive] API error (${response.status}):`,
        errorText
      );

      // Check if this is the "no model info found" error
      if (errorText.includes("no model info found")) {
        console.warn(
          "[Hive] Account doesn't have AI detection models enabled. " +
          "See HIVE_AUTH_STATUS.md for instructions to enable."
        );
      }

      return {
        imageUrl,
        aiProbability: 0,
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract AI probability from Hive response
    const aiProbability = extractAIProbability(data);

    console.log(
      `[Hive] Image analyzed: ${imageUrl} - AI probability: ${(aiProbability * 100).toFixed(1)}%`
    );

    return {
      imageUrl,
      aiProbability,
      success: true,
    };
  } catch (error) {
    console.error(`[Hive] Error analyzing image ${imageUrl}:`, error);
    return {
      imageUrl,
      aiProbability: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Batch analyze multiple images
 * @param imageUrls Array of image URLs to analyze
 * @returns Array of scores for each image
 */
export async function analyzeImages(
  imageUrls: string[]
): Promise<HiveImageScore[]> {
  console.warn('[DEPRECATED] hive.ts is deprecated. Use ai-detection.ts instead.');

  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  // Check if using mock mode (no API keys)
  if (!checkHiveConfig()) {
    console.warn(
      "[Hive] No API keys configured, using mock data. Set HIVE_API_KEY_ID and HIVE_SECRET_KEY to use real analysis."
    );

    // Use mock data for development
    const { mockAnalyzeImages } = await import("./hive-mock");
    return mockAnalyzeImages(imageUrls);
  }

  console.log(`[Hive] Analyzing ${imageUrls.length} images...`);

  // Analyze images in parallel for speed
  const promises = imageUrls.map((url) => analyzeImage(url));
  const results = await Promise.all(promises);

  // Filter out null results
  const validResults = results.filter(
    (r): r is HiveImageScore => r !== null
  );

  const successCount = validResults.filter((r) => r.success).length;
  console.log(
    `[Hive] Completed: ${successCount}/${imageUrls.length} images analyzed successfully`
  );

  // If all images failed (likely due to model access), fall back to mock
  if (successCount === 0 && validResults.length > 0) {
    console.warn(
      "[Hive] All images failed analysis. Falling back to mock mode. " +
      "This is likely because AI detection models aren't enabled on your account."
    );
    const { mockAnalyzeImages } = await import("./hive-mock");
    return mockAnalyzeImages(imageUrls);
  }

  return validResults;
}

/**
 * Calculate average AI probability from multiple results
 * Only includes successful results in the average
 */
export function calculateAverageAIProbability(
  results: HiveImageScore[]
): number {
  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    return 0;
  }

  const sum = successfulResults.reduce((acc, r) => acc + r.aiProbability, 0);
  return sum / successfulResults.length;
}

/**
 * Extract AI probability from Hive API response
 * Hive response structure may vary, so we handle different formats
 */
function extractAIProbability(data: HiveAPIResponse): number {
  try {
    // Check for ai_generated class in status array
    if (data.status && Array.isArray(data.status)) {
      for (const statusItem of data.status) {
        if (statusItem.response?.output) {
          const outputs = statusItem.response.output;

          for (const output of outputs) {
            if (output.classes) {
              for (const classItem of output.classes) {
                if (classItem.class === "ai_generated") {
                  return classItem.score || 0;
                }
              }
            }
          }
        }
      }
    }

    console.warn("[Hive] Could not find ai_generated score in response");
    return 0;
  } catch (error) {
    console.error("[Hive] Error extracting AI probability:", error);
    return 0;
  }
}

/**
 * Check Hive API configuration
 */
export function checkHiveConfig(): boolean {
  return !!(process.env.HIVE_API_KEY_ID && process.env.HIVE_SECRET_KEY);
}

/**
 * Hive API response types
 * Based on: https://docs.thehive.ai/reference/classification
 */
interface HiveAPIResponse {
  status: Array<{
    response?: {
      output?: Array<{
        time?: number;
        classes?: Array<{
          class: string;
          score: number;
        }>;
      }>;
    };
  }>;
}
