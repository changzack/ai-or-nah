import type { HiveImageScore } from "../types";

/**
 * Mock Hive integration for development without API key
 * Returns fake AI detection scores for testing
 */

/**
 * Generate a realistic-looking AI probability score
 * Based on a hash of the image URL for consistency
 */
function generateMockScore(imageUrl: string): number {
  // Simple hash function to get consistent scores for same URLs
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    const char = imageUrl.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash to generate a score between 0 and 1
  const normalized = Math.abs(hash) / 2147483647;

  // Bias towards higher scores for more interesting test data
  // Most scores will be in the 0.4-0.9 range
  return Math.min(0.95, 0.4 + normalized * 0.5);
}

/**
 * Mock analyze single image
 */
export async function mockAnalyzeImage(
  imageUrl: string
): Promise<HiveImageScore> {
  // Simulate API delay (Hive is usually fast ~500ms per image)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));

  const aiProbability = generateMockScore(imageUrl);

  console.log(
    `[Hive Mock] Image analyzed: ${imageUrl.substring(0, 50)}... - AI probability: ${(aiProbability * 100).toFixed(1)}%`
  );

  return {
    imageUrl,
    aiProbability,
    success: true,
  };
}

/**
 * Mock analyze multiple images
 */
export async function mockAnalyzeImages(
  imageUrls: string[]
): Promise<HiveImageScore[]> {
  console.log(`[Hive Mock] Analyzing ${imageUrls.length} images...`);

  // Analyze in parallel like the real implementation
  const promises = imageUrls.map((url) => mockAnalyzeImage(url));
  const results = await Promise.all(promises);

  console.log(`[Hive Mock] Completed: ${results.length}/${imageUrls.length} images`);

  return results;
}

/**
 * Instructions for using mock data
 */
export function getMockInstructions(): string {
  return `
Mock Hive integration active (no API keys configured).

Mock behavior:
- Generates consistent AI scores based on image URL hash
- Most scores range from 40% to 95% AI probability
- Simulates ~300-700ms delay per image (realistic API timing)
- All requests succeed (no failures in mock mode)

To use real Hive API, set HIVE_API_KEY_ID and HIVE_SECRET_KEY in .env.local
  `.trim();
}
