import { ApifyClient } from "apify-client";
import type { InstagramProfile, InstagramPost } from "../types";

/**
 * Apify Instagram Profile Scraper integration
 * Actor: apify/instagram-profile-scraper
 * Docs: https://apify.com/apify/instagram-profile-scraper
 */

const APIFY_ACTOR_ID = "apify/instagram-profile-scraper";
const MAX_POSTS = 12; // Request slightly more to ensure we get 9 images

/**
 * Initialize Apify client
 */
function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_API_TOKEN;

  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set in environment variables");
  }

  return new ApifyClient({ token });
}

/**
 * Scrape an Instagram profile using Apify
 * @param username Instagram username (without @)
 * @returns Profile data or null if failed
 */
export async function scrapeInstagramProfile(
  username: string
): Promise<InstagramProfile | null> {
  try {
    const client = getApifyClient();

    console.log(`[Apify] Scraping profile: ${username}`);

    // Run the Instagram Profile Scraper actor
    const run = await client.actor(APIFY_ACTOR_ID).call({
      usernames: [username],
      resultsLimit: MAX_POSTS,
      addParentData: false,
    });

    // Wait for the run to finish and fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      console.error(`[Apify] No data returned for username: ${username}`);
      return null;
    }

    const profileData = items[0] as ApifyInstagramProfile;

    // Check if profile exists and is accessible
    if (!profileData || !profileData.id) {
      console.error(`[Apify] Profile not found: ${username}`);
      return null;
    }

    // Check if profile is private
    if (profileData.private) {
      console.error(`[Apify] Profile is private: ${username}`);
      return null;
    }

    // Transform to our InstagramProfile type
    const profile = transformApifyProfile(profileData);

    console.log(
      `[Apify] Successfully scraped: ${username} (${profile.posts.length} posts)`
    );

    return profile;
  } catch (error) {
    console.error(`[Apify] Error scraping profile ${username}:`, error);
    return null;
  }
}

/**
 * Transform Apify response to our InstagramProfile type
 */
function transformApifyProfile(data: ApifyInstagramProfile): InstagramProfile {
  // Extract image posts only (filter out videos, carousels without images)
  const imagePosts: InstagramPost[] = [];

  if (data.latestPosts && Array.isArray(data.latestPosts)) {
    for (const post of data.latestPosts) {
      // Only include posts with images
      if (post.type === "Image" || post.type === "Sidecar") {
        // Get the main image URL
        const imageUrl = post.displayUrl || post.thumbnailUrl;

        if (imageUrl) {
          imagePosts.push({
            id: post.id || post.shortCode || "",
            imageUrl,
            caption: post.caption || undefined,
            timestamp: post.timestamp || new Date().toISOString(),
            likesCount: post.likesCount || 0,
            commentsCount: post.commentsCount || 0,
          });
        }
      }
    }
  }

  return {
    username: data.username,
    fullName: data.fullName || undefined,
    bio: data.biography || undefined,
    followerCount: data.followersCount || 0,
    followingCount: data.followsCount || 0,
    postCount: data.postsCount || 0,
    isPrivate: data.private || false,
    posts: imagePosts.slice(0, 9), // Limit to 9 posts
  };
}

/**
 * Scrape with retry logic (as per PRD: retry once on failure)
 */
export async function scrapeInstagramProfileWithRetry(
  username: string
): Promise<InstagramProfile | null> {
  // Check if using mock mode (no API token)
  if (!checkApifyConfig()) {
    console.warn(
      "[Apify] No API token configured, using mock data. Set APIFY_API_TOKEN to use real scraping."
    );

    // Use mock data for development
    const { mockScrapeInstagramProfileWithRetry } = await import("./apify-mock");
    return mockScrapeInstagramProfileWithRetry(username);
  }

  console.log(`[Apify] Starting scrape for: ${username}`);

  // First attempt
  let result = await scrapeInstagramProfile(username);

  if (result) {
    return result;
  }

  // Retry once with 5-second delay (per PRD)
  console.log(`[Apify] First attempt failed, retrying in 5 seconds...`);
  await sleep(5000);

  result = await scrapeInstagramProfile(username);

  if (!result) {
    console.error(`[Apify] Failed after retry for username: ${username}`);
  }

  return result;
}

/**
 * Check Apify API configuration
 */
export function checkApifyConfig(): boolean {
  return !!process.env.APIFY_API_TOKEN;
}

/**
 * Sleep utility for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Apify Instagram Profile Scraper response types
 * Based on: https://apify.com/apify/instagram-profile-scraper
 */
interface ApifyInstagramProfile {
  id: string;
  username: string;
  fullName?: string;
  biography?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  private: boolean;
  verified?: boolean;
  profilePicUrl?: string;
  url?: string;
  latestPosts?: ApifyPost[];
}

interface ApifyPost {
  id?: string;
  shortCode?: string;
  type: "Image" | "Video" | "Sidecar";
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  url?: string;
  commentsCount?: number;
  likesCount?: number;
  displayUrl?: string;
  thumbnailUrl?: string;
  timestamp?: string;
  ownerUsername?: string;
}
