import { createServerClient } from "../supabase/server";
import { VERIFICATION } from "../constants";
import type { VerificationCodeRow } from "../types";

/**
 * Verification code management for passwordless email auth
 */

/**
 * Generate a random 6-digit code
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check rate limit for sending codes (3 per hour)
 */
export async function checkSendRateLimit(email: string): Promise<{
  allowed: boolean;
  retryAfter?: number;
}> {
  const supabase = createServerClient();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("verification_codes")
    .select("created_at")
    .eq("email", email.toLowerCase())
    .gte("created_at", oneHourAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[verification] Error checking rate limit:", error);
    return { allowed: true };
  }

  if (!data || data.length < VERIFICATION.MAX_SENDS_PER_HOUR) {
    return { allowed: true };
  }

  // Calculate retry time based on oldest code in the window
  const oldestCode = data[data.length - 1];
  const retryAfter = new Date(oldestCode.created_at).getTime() + 60 * 60 * 1000;

  return {
    allowed: false,
    retryAfter: Math.ceil((retryAfter - Date.now()) / 1000),
  };
}

/**
 * Create a new verification code
 */
export async function createVerificationCode(email: string): Promise<string | null> {
  const supabase = createServerClient();

  const code = generateCode();
  const expiresAt = new Date(Date.now() + VERIFICATION.EXPIRY_MINUTES * 60 * 1000);

  const { error } = await supabase
    .from("verification_codes")
    .insert({
      email: email.toLowerCase(),
      code: code,
      attempts: 0,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error("[verification] Error creating code:", error);
    return null;
  }

  return code;
}

/**
 * Get the most recent unused verification code for an email
 */
async function getLatestCode(email: string): Promise<VerificationCodeRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("email", email.toLowerCase())
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as VerificationCodeRow;
}

/**
 * Increment attempt count for a verification code
 */
async function incrementAttempts(codeId: string): Promise<number> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("verification_codes")
    .select("attempts")
    .eq("id", codeId)
    .single();

  if (error || !data) {
    return 999; // Fail safe
  }

  const newAttempts = data.attempts + 1;

  await supabase
    .from("verification_codes")
    .update({ attempts: newAttempts })
    .eq("id", codeId);

  return newAttempts;
}

/**
 * Mark a verification code as used
 */
async function markCodeUsed(codeId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("verification_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", codeId);

  return !error;
}

/**
 * Verify a code
 * Returns { valid: boolean, attemptsExceeded?: boolean }
 */
export async function verifyCode(
  email: string,
  code: string
): Promise<{
  valid: boolean;
  attemptsExceeded?: boolean;
}> {
  const codeRow = await getLatestCode(email);

  if (!codeRow) {
    return { valid: false };
  }

  // Increment attempts BEFORE checking
  const attempts = await incrementAttempts(codeRow.id);

  // Check if attempts exceeded
  if (attempts > VERIFICATION.MAX_ATTEMPTS_PER_CODE) {
    return { valid: false, attemptsExceeded: true };
  }

  // Check if code matches
  if (codeRow.code !== code) {
    return { valid: false };
  }

  // Mark as used
  await markCodeUsed(codeRow.id);

  return { valid: true };
}

/**
 * Delete expired verification codes (for cleanup cron)
 */
export async function deleteExpiredCodes(): Promise<number> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("verification_codes")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[verification] Error deleting expired codes:", error);
    return 0;
  }

  return data?.length ?? 0;
}
