import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { errorResponse, CommonErrors } from "@/lib/api/responses";

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
      return CommonErrors.missingParameter("username");
    }

    const supabase = createServerClient();

    // Fetch cached result
    const { data: cachedResult, error } = await supabase
      .from("results")
      .select("*")
      .eq("username", username.toLowerCase())
      .single();

    if (error || !cachedResult) {
      return CommonErrors.notFound("Result not found");
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
    return CommonErrors.internalError();
  }
}
