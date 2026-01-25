import { createServerClient } from "../supabase/server";
import type { ResultImageRow } from "../types";

/**
 * Database operations for result_images table
 */

/**
 * Save image references for a result
 */
export async function saveResultImages(
  resultId: string,
  images: Array<{
    imageUrl: string;
    storagePath: string;
    position: number;
  }>
): Promise<boolean> {
  const supabase = createServerClient();

  const imageRows = images.map((img) => ({
    result_id: resultId,
    image_url: img.imageUrl,
    storage_path: img.storagePath,
    position: img.position,
  }));

  const { error } = await supabase.from("result_images").insert(imageRows);

  if (error) {
    console.error("Error saving result images:", error);
    return false;
  }

  return true;
}

/**
 * Get images for a result
 */
export async function getResultImages(
  resultId: string
): Promise<ResultImageRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("result_images")
    .select("*")
    .eq("result_id", resultId)
    .order("position", { ascending: true });

  if (error || !data) {
    console.error("Error fetching result images:", error);
    return [];
  }

  return data as ResultImageRow[];
}

/**
 * Delete images for a result (cascade will handle this, but useful for manual cleanup)
 */
export async function deleteResultImages(resultId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("result_images")
    .delete()
    .eq("result_id", resultId);

  return !error;
}
