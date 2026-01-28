import type { InstagramProfile } from "../types";

/**
 * Mock Apify integration for development without API key
 * Returns fake data for testing
 */

const MOCK_PROFILES: Record<string, InstagramProfile> = {
  testuser: {
    username: "testuser",
    fullName: "Test User",
    bio: "This is a test account for development",
    followerCount: 1250,
    followingCount: 500,
    postCount: 45,
    isPrivate: false,
    verified: false,
    posts: [
      {
        id: "1",
        imageUrl: "https://picsum.photos/400/400?random=1",
        caption: "Beautiful day at the beach! ☀️",
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        likesCount: 234,
        commentsCount: 12,
        hashtags: ["beach", "sunny", "vacation"],
        mentions: [],
      },
      {
        id: "2",
        imageUrl: "https://picsum.photos/400/400?random=2",
        caption: "Coffee time ☕",
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        likesCount: 189,
        commentsCount: 8,
        hashtags: ["coffee", "morning"],
        mentions: [],
      },
      {
        id: "3",
        imageUrl: "https://picsum.photos/400/400?random=3",
        caption: "Sunset vibes 🌅",
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        likesCount: 456,
        commentsCount: 23,
        hashtags: ["sunset", "nature", "photography"],
        mentions: [],
      },
      {
        id: "4",
        imageUrl: "https://picsum.photos/400/400?random=4",
        caption: "New look! What do you think?",
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
        likesCount: 567,
        commentsCount: 45,
        hashtags: ["fashion", "style"],
        mentions: [],
      },
      {
        id: "5",
        imageUrl: "https://picsum.photos/400/400?random=5",
        caption: "Weekend mood 💕",
        timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
        likesCount: 234,
        commentsCount: 15,
        hashtags: ["weekend", "relax"],
        mentions: [],
      },
      {
        id: "6",
        imageUrl: "https://picsum.photos/400/400?random=6",
        caption: "Throwback to summer",
        timestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
        likesCount: 345,
        commentsCount: 18,
        hashtags: ["throwback", "summer", "memories"],
        mentions: [],
      },
      {
        id: "7",
        imageUrl: "https://picsum.photos/400/400?random=7",
        caption: "Feeling cute, might delete later",
        timestamp: new Date(Date.now() - 86400000 * 18).toISOString(),
        likesCount: 678,
        commentsCount: 34,
        hashtags: ["selfie"],
        mentions: [],
      },
      {
        id: "8",
        imageUrl: "https://picsum.photos/400/400?random=8",
        caption: "OOTD 👗",
        timestamp: new Date(Date.now() - 86400000 * 21).toISOString(),
        likesCount: 456,
        commentsCount: 28,
        hashtags: ["ootd", "fashion", "style"],
        mentions: [],
      },
      {
        id: "9",
        imageUrl: "https://picsum.photos/400/400?random=9",
        caption: "Living my best life ✨",
        timestamp: new Date(Date.now() - 86400000 * 25).toISOString(),
        likesCount: 789,
        commentsCount: 41,
        hashtags: ["blessed", "grateful"],
        mentions: [],
      },
    ],
  },
  privateuser: {
    username: "privateuser",
    fullName: "Private User",
    bio: undefined,
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
    isPrivate: true,
    verified: false,
    posts: [],
  },
  noposts: {
    username: "noposts",
    fullName: "No Posts User",
    bio: "Brand new account",
    followerCount: 50,
    followingCount: 100,
    postCount: 0,
    isPrivate: false,
    verified: false,
    posts: [],
  },
};

/**
 * Mock scrape function that returns fake data
 */
export async function mockScrapeInstagramProfile(
  username: string
): Promise<InstagramProfile | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`[Apify Mock] Scraping profile: ${username}`);

  // Return mock data if exists
  const mockProfile = MOCK_PROFILES[username.toLowerCase()];

  if (mockProfile) {
    console.log(
      `[Apify Mock] Returning mock data for: ${username} (${mockProfile.posts.length} posts)`
    );
    return mockProfile;
  }

  // Simulate "not found"
  console.log(`[Apify Mock] Profile not found: ${username}`);
  return null;
}

/**
 * Mock scrape with retry (same interface as real one)
 */
export async function mockScrapeInstagramProfileWithRetry(
  username: string
): Promise<InstagramProfile | null> {
  return mockScrapeInstagramProfile(username);
}

/**
 * Instructions for using mock data
 */
export function getMockInstructions(): string {
  return `
Mock Apify integration active (no API key configured).

Available test usernames:
- testuser: Returns 9 posts with full data
- privateuser: Returns private account error
- noposts: Returns account with no posts
- any other username: Returns null (not found)

To use real Apify data, set APIFY_API_TOKEN in .env.local
  `.trim();
}
