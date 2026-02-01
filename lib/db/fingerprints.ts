import { createServerClient } from "../supabase/server";
import type { DeviceFingerprintRow, DeviceFingerprint } from "../types";
import { FREE_TIER } from "../constants";
import { querySingle, insertSingle, executeUpdate } from "./utils";

/**
 * Database operations for device_fingerprints table
 * Two-layer identity matching: device token first, fingerprint hash fallback
 */

/**
 * Convert database row to domain type
 */
function toDeviceFingerprint(row: DeviceFingerprintRow): DeviceFingerprint {
  return {
    id: row.id,
    fingerprintHash: row.fingerprint_hash,
    deviceToken: row.device_token,
    checksUsed: row.checks_used,
  };
}

/**
 * Get device by token (primary identifier)
 */
export async function getDeviceByToken(
  deviceToken: string
): Promise<DeviceFingerprint | null> {
  const supabase = createServerClient();

  return querySingle<DeviceFingerprintRow, DeviceFingerprint>(
    supabase.from("device_fingerprints").select("*").eq("device_token", deviceToken),
    toDeviceFingerprint,
    "[fingerprints]"
  );
}

/**
 * Get device by fingerprint hash (fallback identifier)
 */
export async function getDeviceByFingerprint(
  fingerprintHash: string
): Promise<DeviceFingerprint | null> {
  const supabase = createServerClient();

  // Note: Using maybeSingle() instead of single() to avoid error if not found
  const { data, error } = await supabase
    .from("device_fingerprints")
    .select("*")
    .eq("fingerprint_hash", fingerprintHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toDeviceFingerprint(data as DeviceFingerprintRow);
}

/**
 * Get device using two-layer matching:
 * 1. Try device token first (most reliable)
 * 2. Fall back to fingerprint hash
 */
export async function getDevice(
  deviceToken: string | null,
  fingerprintHash: string
): Promise<DeviceFingerprint | null> {
  // Try token first
  if (deviceToken) {
    const byToken = await getDeviceByToken(deviceToken);
    if (byToken) {
      return byToken;
    }
  }

  // Fall back to fingerprint
  return getDeviceByFingerprint(fingerprintHash);
}

/**
 * Create a new device record
 */
export async function createDevice(
  fingerprintHash: string,
  deviceToken?: string
): Promise<DeviceFingerprint | null> {
  const supabase = createServerClient();

  return insertSingle<DeviceFingerprintRow, DeviceFingerprint>(
    supabase.from("device_fingerprints").insert({
      fingerprint_hash: fingerprintHash,
      device_token: deviceToken || null,
      checks_used: 0,
    }),
    toDeviceFingerprint,
    "[fingerprints]"
  );
}

/**
 * Get or create device record
 */
export async function getOrCreateDevice(
  fingerprintHash: string,
  deviceToken?: string
): Promise<DeviceFingerprint | null> {
  const existing = await getDevice(deviceToken || null, fingerprintHash);

  if (existing) {
    console.log(`[fingerprints] Found existing device ${existing.id} with ${existing.checksUsed} checks used`);
    // If device exists but doesn't have a token, link it
    if (!existing.deviceToken && deviceToken) {
      await linkTokenToDevice(existing.id, deviceToken);
      return { ...existing, deviceToken };
    }
    return existing;
  }

  console.log(`[fingerprints] Creating new device for fingerprint hash`);
  return createDevice(fingerprintHash, deviceToken);
}

/**
 * Link a device token to an existing device
 */
export async function linkTokenToDevice(
  deviceId: string,
  deviceToken: string
): Promise<boolean> {
  const supabase = createServerClient();

  return executeUpdate(
    supabase.from("device_fingerprints").update({ device_token: deviceToken }).eq("id", deviceId),
    "[fingerprints]"
  );
}

/**
 * Get remaining free checks for a device
 */
export async function getFreeChecksRemaining(
  deviceToken: string | null,
  fingerprintHash: string
): Promise<number> {
  const device = await getDevice(deviceToken, fingerprintHash);

  if (!device) {
    console.log(`[fingerprints] No device found, returning ${FREE_TIER.LIFETIME_CHECKS} checks`);
    return FREE_TIER.LIFETIME_CHECKS;
  }

  const remaining = Math.max(0, FREE_TIER.LIFETIME_CHECKS - device.checksUsed);
  console.log(`[fingerprints] Device ${device.id} has used ${device.checksUsed} checks, ${remaining} remaining`);
  return remaining;
}

/**
 * Check if device has free checks remaining
 */
export async function hasFreeChecks(
  deviceToken: string | null,
  fingerprintHash: string
): Promise<boolean> {
  const remaining = await getFreeChecksRemaining(deviceToken, fingerprintHash);
  return remaining > 0;
}

/**
 * Increment device's check count
 * Returns true if increment was successful
 */
export async function incrementDeviceChecks(
  deviceToken: string | null,
  fingerprintHash: string
): Promise<boolean> {
  const device = await getOrCreateDevice(fingerprintHash, deviceToken || undefined);

  if (!device) {
    console.error("[fingerprints] Failed to get/create device for increment");
    return false;
  }

  console.log(`[fingerprints] Incrementing checks for device ${device.id}: ${device.checksUsed} → ${device.checksUsed + 1}`);

  const supabase = createServerClient();

  const success = await executeUpdate(
    supabase.from("device_fingerprints").update({ checks_used: device.checksUsed + 1 }).eq("id", device.id),
    "[fingerprints]"
  );

  if (success) {
    console.log(`[fingerprints] Successfully incremented checks to ${device.checksUsed + 1}`);
  }

  return success;
}

/**
 * Get device's check count
 */
export async function getDeviceChecks(
  deviceToken: string | null,
  fingerprintHash: string
): Promise<number> {
  const device = await getDevice(deviceToken, fingerprintHash);
  return device?.checksUsed ?? 0;
}
