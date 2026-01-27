import { NextResponse } from "next/server";
import { analyzeAccount } from "@/lib/analyze";
import { parseInstagramUsername } from "@/lib/username";
import { getCachedResult, updateResultAccess } from "@/lib/db/results";
import { getResultImages } from "@/lib/db/images";
import type { AnalysisResult } from "@/lib/types";

/**
 * Main analysis endpoint
 * POST /api/analyze
 * Body: { "username": "instagram_username" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username: rawUsername } = body;

    if (!rawUsername) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_username",
          message: "Please provide a username",
        },
        { status: 400 }
      );
    }

    // Parse and validate username
    const username = parseInstagramUsername(rawUsername);

    if (!username) {
      return NextResponse.json(
        {
          status: "error",
          error: "invalid_username",
          message: "Invalid Instagram username or URL. Try again.",
        },
        { status: 400 }
      );
    }

    console.log(`[API] Checking cache for: ${username}`);

    // Step 1: Check cache first
    const cachedResult = await getCachedResult(username);

    if (cachedResult) {
      console.log(`[API] ✓ Cache hit for ${username} (last checked: ${cachedResult.checked_at})`);

      // Update access timestamp and view count
      await updateResultAccess(cachedResult.id);

      // Get stored image URLs
      const images = await getResultImages(cachedResult.id);
      const imageUrls = images.map((img) => img.image_url);

      // Return cached result
      const result: AnalysisResult = {
        status: "success",
        username: cachedResult.username,
        aiLikelihood: cachedResult.ai_likelihood_score,
        verdict: cachedResult.verdict,
        imageAnalysis: {
          score: cachedResult.image_analysis_score,
          count: cachedResult.images_analyzed_count,
          message: getImageAnalysisMessage(cachedResult.image_analysis_score),
        },
        profileFlags: cachedResult.profile_flags as any[],
        consistencyFlags: cachedResult.consistency_flags as any[],
        bottomLine: cachedResult.bottom_line,
        imageUrls,
        checkedAt: cachedResult.checked_at,
        lastAccessedAt: new Date().toISOString(),
        isCached: true,
      };

      return NextResponse.json(result);
    }

    console.log(`[API] ✗ Cache miss for ${username}, running fresh analysis`);

    // Step 2: Cache miss - run fresh analysis
    const result = await analyzeAccount(username);

    if (result.status === "error") {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "analysis_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper to get image analysis message (duplicated from constants to avoid circular imports)
function getImageAnalysisMessage(score: number): string {
  if (score < 0.3) return "The faces in these photos look pretty natural to me.";
  if (score < 0.6) return "Some of these photos have that AI-generated vibe, but it's hard to say for sure.";
  if (score < 0.8) return "Most of these faces have telltale signs of AI generation.";
  return "These photos are almost certainly AI-generated. The patterns are unmistakable.";
}
