import { createServerClient } from "../supabase/server";
import { RATE_LIMIT } from "../constants";
import { querySingle } from "./utils";

/**
 * Database operations for IP rate limiting
 */

/**
 * Get current date in PST (YYYY-MM-DD format)
 */
function getPSTDate(): string {
  const now = new Date();
  const pstDate = now.toLocaleDateString("en-US", {
    timeZone: RATE_LIMIT.RESET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Convert MM/DD/YYYY to YYYY-MM-DD
  const [month, day, year] = pstDate.split("/");
  return `${year}-${month}-${day}`;
}

/**
 * Get midnight PST timestamp for rate limit reset
 */
function getMidnightPST(): Date {
  const now = new Date();
  const pstString = now.toLocaleString("en-US", {
    timeZone: RATE_LIMIT.RESET_TIMEZONE,
  });
  const pstDate = new Date(pstString);

  // Set to next midnight
  pstDate.setHours(24, 0, 0, 0);

  return pstDate;
}

/**
 * Check if IP has exceeded rate limit for today
 */
export async function checkRateLimit(
  ipAddress: string
): Promise<{ allowed: boolean; remaining: number; resetsAt: string }> {
  const supabase = createServerClient();
  const today = getPSTDate();

  // Get or create rate limit record
  const data = await querySingle<{ check_count: number }>(
    supabase.from("ip_rate_limits").select("*").eq("ip_address", ipAddress).eq("reset_date", today),
    undefined,
    "[rate-limit]"
  );

  if (!data) {
    // No record exists, user has full quota
    return {
      allowed: true,
      remaining: RATE_LIMIT.MAX_FRESH_CHECKS_PER_DAY,
      resetsAt: getMidnightPST().toISOString(),
    };
  }

  const remaining = RATE_LIMIT.MAX_FRESH_CHECKS_PER_DAY - data.check_count;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resetsAt: getMidnightPST().toISOString(),
  };
}

/**
 * Increment rate limit counter for an IP
 */
export async function incrementRateLimit(ipAddress: string): Promise<boolean> {
  const supabase = createServerClient();
  const today = getPSTDate();

  // Upsert: increment if exists, create if not
  const { error } = await supabase.from("ip_rate_limits").upsert(
    {
      ip_address: ipAddress,
      reset_date: today,
      check_count: 1,
      last_check_at: new Date().toISOString(),
    },
    {
      onConflict: "ip_address,reset_date",
      ignoreDuplicates: false,
    }
  );

  if (error) {
    // If record exists, increment check_count
    const { error: updateError } = await supabase.rpc("increment_rate_limit", {
      ip: ipAddress,
      date: today,
    });

    return !updateError;
  }

  return true;
}

/**
 * Clean up old rate limit records (optional maintenance)
 */
export async function cleanupOldRateLimits(daysToKeep = 7): Promise<number> {
  const supabase = createServerClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const cutoffDateString = cutoffDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("ip_rate_limits")
    .delete()
    .lt("reset_date", cutoffDateString)
    .select("id");

  if (error) {
    console.error("Error cleaning up rate limits:", error);
    return 0;
  }

  return data?.length ?? 0;
}
