import { NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

const APIFY_ACTOR_ID = "apify/instagram-profile-scraper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username parameter required" },
      { status: 400 }
    );
  }

  try {
    const apiToken = process.env.APIFY_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    console.log(`[Debug] Testing scrape for: ${username}`);

    const client = new ApifyClient({ token: apiToken });

    // Run the actor
    const run = await client.actor(APIFY_ACTOR_ID).call({
      usernames: [username],
      resultsLimit: 9,
      addParentData: false,
    });

    console.log(`[Debug] Actor run ID: ${run.id}`);
    console.log(`[Debug] Run status: ${run.status}`);

    // Get results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`[Debug] Items returned: ${items.length}`);

    if (!items || items.length === 0) {
      return NextResponse.json({
        status: "no_data",
        message: "Apify returned no data",
        username,
        runId: run.id,
        runStatus: run.status,
      });
    }

    const profileData = items[0];

    return NextResponse.json({
      status: "success",
      username,
      runId: run.id,
      rawData: {
        keys: Object.keys(profileData),
        id: profileData.id,
        username: profileData.username,
        fullName: profileData.fullName,
        biography: profileData.biography,
        followersCount: profileData.followersCount,
        followsCount: profileData.followsCount,
        postsCount: profileData.postsCount,
        private: profileData.private,
        verified: profileData.verified,
        latestPostsCount: profileData.latestPosts?.length || 0,
        profilePicUrl: profileData.profilePicUrl ? "present" : "missing",
      },
      firstPost: profileData.latestPosts?.[0] ? {
        type: profileData.latestPosts[0].type,
        hasDisplayUrl: !!profileData.latestPosts[0].displayUrl,
        hasThumbnailUrl: !!profileData.latestPosts[0].thumbnailUrl,
        hasCaption: !!profileData.latestPosts[0].caption,
      } : null,
    });
  } catch (error) {
    console.error("[Debug] Error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
