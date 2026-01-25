// Core domain types for AI or Nah

export type VerdictLevel = "real" | "unclear" | "likely_fake" | "almost_definitely_fake";

export type RedFlag = {
  type: "negative" | "positive";
  message: string;
};

// Database row types
export type ResultRow = {
  id: string;
  username: string;
  ai_likelihood_score: number; // 0-100
  verdict: VerdictLevel;
  image_analysis_score: number;
  images_analyzed_count: number;
  profile_flags: RedFlag[];
  consistency_flags: RedFlag[];
  bottom_line: string;
  checked_at: string; // ISO timestamp
  last_accessed_at: string; // ISO timestamp
  view_count: number;
};

export type ResultImageRow = {
  id: string;
  result_id: string;
  image_url: string; // App-owned URL (Supabase storage)
  storage_path: string;
  position: number;
};

export type RateLimitRow = {
  id: string;
  ip_address: string;
  check_count: number;
  reset_date: string; // PST date string (YYYY-MM-DD)
  last_check_at: string; // ISO timestamp
};

// API response payloads
export type AnalysisResult = {
  status: "success" | "error" | "rate_limited";
  username: string;
  aiLikelihood: number; // 0-100
  verdict: VerdictLevel;
  imageAnalysis: {
    score: number;
    count: number;
    message: string;
  };
  profileFlags: RedFlag[];
  consistencyFlags: RedFlag[];
  bottomLine: string;
  imageUrls: string[];
  checkedAt: string;
  lastAccessedAt: string;
  isCached: boolean;
};

export type ErrorResult = {
  status: "error";
  error: ErrorCode;
  message: string;
};

export type RateLimitResult = {
  status: "rate_limited";
  message: string;
  resetsAt: string; // ISO timestamp for midnight PST
};

export type ErrorCode =
  | "account_not_found"
  | "account_private"
  | "insufficient_posts"
  | "insufficient_photos"
  | "scraping_failed"
  | "analysis_failed"
  | "invalid_username";

// Instagram scraper response shape
export type InstagramProfile = {
  username: string;
  fullName?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
  posts: InstagramPost[];
};

export type InstagramPost = {
  id: string;
  imageUrl: string;
  caption?: string;
  timestamp: string; // ISO
  likesCount: number;
  commentsCount: number;
};

// AI Detection API response (provider-agnostic)
export type AIImageScore = {
  imageUrl: string;
  aiProbability: number; // 0-1
  success: boolean;
  error?: string;
};

/** @deprecated Use AIImageScore instead. Maintained for backward compatibility. */
export type HiveImageScore = AIImageScore;
