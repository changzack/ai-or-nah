import { createServerClient } from "../supabase/server";

/**
 * Supabase Storage operations for Instagram images
 * Bucket name: "instagram-images"
 */

const BUCKET_NAME = "instagram-images";

/**
 * Upload an image from URL to Supabase Storage
 * @returns Public URL and storage path if successful
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  username: string,
  position: number
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    const supabase = createServerClient();

    // Download image from Instagram
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image:", imageUrl);
      return null;
    }

    const imageBlob = await response.blob();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Generate storage path: username/timestamp-position.ext
    const timestamp = Date.now();
    const extension = contentType.split("/")[1] || "jpg";
    const storagePath = `${username}/${timestamp}-${position}.${extension}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, imageBlob, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

    return { publicUrl, storagePath };
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

/**
 * Delete images for a username (cleanup after 90 days)
 */
export async function deleteUserImages(username: string): Promise<boolean> {
  const supabase = createServerClient();

  // List all files in the username folder
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(username);

  if (listError || !files || files.length === 0) {
    return false;
  }

  // Delete all files
  const filePaths = files.map((file) => `${username}/${file.name}`);
  const { error: deleteError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  return !deleteError;
}

/**
 * Delete a specific image by storage path
 */
export async function deleteImage(storagePath: string): Promise<boolean> {
  const supabase = createServerClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  return !error;
}

/**
 * Get public URL for a storage path (useful for debugging)
 */
export function getPublicUrl(storagePath: string): string {
  const supabase = createServerClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  return publicUrl;
}
