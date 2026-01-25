import { NextResponse } from "next/server";
import {
  analyzeImages,
  calculateAverageAIProbability,
  checkHiveConfig,
} from "@/lib/integrations/hive";

/**
 * Test endpoint for Hive integration
 * POST /api/test-hive
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

    const isConfigured = checkHiveConfig();
    console.log(
      `[Test API] Testing Hive analysis for ${imageUrls.length} images (mode: ${isConfigured ? "real" : "mock"})`
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
      mode: isConfigured ? "real" : "mock",
      totalImages: imageUrls.length,
      analyzedSuccessfully: successCount,
      averageAIProbability: averageScore,
      averageAIPercentage: Math.round(averageScore * 100),
      duration: `${duration}ms`,
      results, // Individual results for each image
    });
  } catch (error) {
    console.error("[Test API] Error:", error);
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
  return NextResponse.json({
    message: "Hive API test endpoint",
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
  });
}
