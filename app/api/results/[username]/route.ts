import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET endpoint to fetch cached analysis results (read-only)
 * Used for metadata generation and result viewing
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { status: "error", message: "Username is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch cached result
    const { data: cachedResult, error } = await supabase
      .from("results")
      .select("*")
      .eq("username", username.toLowerCase())
      .single();

    if (error || !cachedResult) {
      return NextResponse.json(
        { status: "error", message: "Result not found" },
        { status: 404 }
      );
    }

    // Return the cached result
    return NextResponse.json({
      status: "success",
      aiLikelihood: cachedResult.ai_likelihood,
      verdict: cachedResult.verdict,
      username: cachedResult.username,
      fromCache: true,
    });
  } catch (error) {
    console.error("[results-api] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
