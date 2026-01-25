import { NextResponse } from "next/server";
import { scrapeInstagramProfileWithRetry, checkApifyConfig } from "@/lib/integrations/apify";

/**
 * Test endpoint for Apify integration
 * GET /api/test-apify?username=instagram
 */
export async function GET(request: Request) {
  try {
    // Get username from query params
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        {
          error: "Missing username",
          message: "Please provide ?username=instagram parameter",
        },
        { status: 400 }
      );
    }

    const isConfigured = checkApifyConfig();
    console.log(
      `[Test API] Testing Apify scrape for: ${username} (mode: ${isConfigured ? "real" : "mock"})`
    );

    // Scrape the profile (automatically uses mock if no API key)
    const startTime = Date.now();
    const profile = await scrapeInstagramProfileWithRetry(username);
    const duration = Date.now() - startTime;

    if (!profile) {
      return NextResponse.json(
        {
          error: "Scraping failed",
          message: "Could not scrape profile. Account may be private, not found, or Apify service is down.",
          username,
          duration: `${duration}ms`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: isConfigured ? "real" : "mock",
      username: profile.username,
      followerCount: profile.followerCount,
      postCount: profile.postCount,
      imagePosts: profile.posts.length,
      isPrivate: profile.isPrivate,
      duration: `${duration}ms`,
      profile, // Full profile data
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
