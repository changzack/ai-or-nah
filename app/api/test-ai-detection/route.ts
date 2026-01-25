import { NextResponse } from "next/server";
import {
  analyzeImages,
  calculateAverageAIProbability,
  getCurrentProvider,
} from "@/lib/integrations/ai-detection";
import { checkSightengineConfig } from "@/lib/integrations/sightengine";

/**
 * Test endpoint for AI Detection integration (provider-agnostic)
 * POST /api/test-ai-detection
 * Body: { "imageUrls": ["url1", "url2", ...] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrls } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        {
          error: "Missing imageUrls",
          message: "Please provide an array of image URLs in the request body",
          example: {
            imageUrls: [
              "https://picsum.photos/400/400?random=1",
              "https://picsum.photos/400/400?random=2",
            ],
          },
        },
        { status: 400 }
      );
    }

    const provider = getCurrentProvider();
    const isConfigured = checkSightengineConfig();
    console.log(
      `[Test AI Detection] Testing with provider: ${provider} for ${imageUrls.length} images (mode: ${isConfigured ? "real" : "mock"})`
    );

    // Analyze the images
    const startTime = Date.now();
    const results = await analyzeImages(imageUrls);
    const duration = Date.now() - startTime;

    // Calculate statistics
    const successCount = results.filter((r) => r.success).length;
    const averageScore = calculateAverageAIProbability(results);

    return NextResponse.json({
      success: true,
      provider,
      mode: isConfigured ? "real" : "mock",
      totalImages: imageUrls.length,
      analyzedSuccessfully: successCount,
      averageAIProbability: averageScore,
      averageAIPercentage: Math.round(averageScore * 100),
      duration: `${duration}ms`,
      results, // Individual results for each image
    });
  } catch (error) {
    console.error("[Test AI Detection] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint with sample test
 */
export async function GET() {
  const provider = getCurrentProvider();

  return NextResponse.json({
    message: "AI Detection API test endpoint",
    currentProvider: provider,
    usage: "POST with body: { imageUrls: [...] }",
    example: {
      method: "POST",
      body: {
        imageUrls: [
          "https://picsum.photos/400/400?random=1",
          "https://picsum.photos/400/400?random=2",
          "https://picsum.photos/400/400?random=3",
        ],
      },
    },
    note: `Currently using ${provider} provider. Set AI_DETECTION_PROVIDER in .env.local to switch.`,
  });
}
