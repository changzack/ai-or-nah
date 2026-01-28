import { createServerClient } from "../supabase/server";
import type { ResultRow, RedFlag, VerdictLevel } from "../types";

/**
 * Database operations for results table
 */

/**
 * Get a cached result by username
 */
export async function getCachedResult(
  username: string
): Promise<ResultRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data as ResultRow;
}

/**
 * Save a new result to the database
 */
export async function saveResult(params: {
  username: string;
  aiLikelihoodScore: number;
  verdict: VerdictLevel;
  imageAnalysisScore: number;
  imagesAnalyzedCount: number;
  profileFlags: RedFlag[];
  consistencyFlags: RedFlag[];
}): Promise<ResultRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("results")
    .insert({
      username: params.username.toLowerCase(),
      ai_likelihood_score: params.aiLikelihoodScore,
      verdict: params.verdict,
      image_analysis_score: params.imageAnalysisScore,
      images_analyzed_count: params.imagesAnalyzedCount,
      profile_flags: params.profileFlags,
      consistency_flags: params.consistencyFlags,
      checked_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      view_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving result:", error);
    return null;
  }

  return data as ResultRow;
}

/**
 * Update last_accessed_at and increment view_count
 */
export async function updateResultAccess(
  resultId: string
): Promise<boolean> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("results")
    .update({
      last_accessed_at: new Date().toISOString(),
      view_count: supabase.rpc("increment", { row_id: resultId }),
    })
    .eq("id", resultId);

  return !error;
}

/**
 * Delete old results (90+ days since last access) for cleanup
 */
export async function deleteStaleResults(daysInactive = 90): Promise<number> {
  const supabase = createServerClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  const { data, error } = await supabase
    .from("results")
    .delete()
    .lt("last_accessed_at", cutoffDate.toISOString())
    .select("id");

  if (error) {
    console.error("Error deleting stale results:", error);
    return 0;
  }

  return data?.length ?? 0;
}
