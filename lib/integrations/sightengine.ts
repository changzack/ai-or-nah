import type { AIImageScore } from "../types";

/**
 * Sightengine AI Detection Integration
 *
 * Provides AI-generated image detection via Sightengine's genai model.
 * Processes multiple images in parallel for optimal performance.
 *
 * Free tier: 2,000 operations/month (500/day)
 * With parallel processing: ~222 profile analyses per month (9 images per profile)
 */

/**
 * Get Sightengine credentials from environment
 */
function getSightengineCredentials(): { apiUser: string; apiSecret: string } | null {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    return null;
  }

  return { apiUser, apiSecret };
}

/**
 * Check if Sightengine is properly configured
 */
export function checkSightengineConfig(): boolean {
  return getSightengineCredentials() !== null;
}

/**
 * Analyze a single image for AI generation
 */
export async function analyzeImage(imageUrl: string): Promise<AIImageScore | null> {
  const credentials = getSightengineCredentials();

  if (!credentials) {
    console.warn("[Sightengine] No credentials configured, falling back to mock");
    const { mockAnalyzeImage } = await import("./ai-detection-mock");
    return mockAnalyzeImage(imageUrl);
  }

  const { apiUser, apiSecret } = credentials;

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: "genai",
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const response = await fetch(
      `https://api.sightengine.com/1.0/check.json?${params}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Sightengine] API error (${response.status}): ${errorText}`);

      return {
        imageUrl,
        aiProbability: 0,
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract AI probability from response
    const aiProbability = data.type?.ai_generated ?? 0;

    console.log(
      `[Sightengine] Image analyzed: ${imageUrl.substring(0, 50)}... - AI probability: ${(aiProbability * 100).toFixed(1)}%`
    );

    return {
      imageUrl,
      aiProbability,
      success: true,
    };
  } catch (error) {
    console.error("[Sightengine] Request failed:", error);

    return {
      imageUrl,
      aiProbability: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}


/**
 * Analyze multiple images in parallel
 * Processes all images simultaneously for optimal performance
 */
export async function analyzeImages(imageUrls: string[]): Promise<AIImageScore[]> {
  if (imageUrls.length === 0) {
    return [];
  }

  console.log(`[Sightengine] Analyzing ${imageUrls.length} images in parallel...`);

  // Process all images in parallel
  const promises = imageUrls.map(url => analyzeImage(url));
  const results = await Promise.all(promises);

  // Filter out null results
  const validResults = results.filter((r): r is AIImageScore => r !== null);

  const successCount = validResults.filter(r => r.success).length;
  console.log(
    `[Sightengine] Completed: ${successCount}/${imageUrls.length} images successfully analyzed`
  );

  return validResults;
}

/**
 * Calculate average AI probability from image analysis results
 */
export function calculateAverageAIProbability(results: AIImageScore[]): number {
  const successfulResults = results.filter((r) => r.success);

  if (successfulResults.length === 0) {
    return 0;
  }

  const sum = successfulResults.reduce((acc, r) => acc + r.aiProbability, 0);
  return sum / successfulResults.length;
}
