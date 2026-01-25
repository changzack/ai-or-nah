import { NextResponse } from "next/server";
import { analyzeAccount } from "@/lib/analyze";
import { parseInstagramUsername } from "@/lib/username";

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

    console.log(`[API] Analyzing account: ${username}`);

    // Run analysis
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
