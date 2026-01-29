import FingerprintJS from "@fingerprintjs/fingerprintjs";

/**
 * Client-side device fingerprinting utility
 * Manages device identity using fingerprint hash + localStorage token
 */

const DEVICE_TOKEN_KEY = "aion_device_token";

/**
 * Generate a random device token
 */
function generateDeviceToken(): string {
  return `dt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create device token from localStorage
 */
function getOrCreateDeviceToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);

    if (!token) {
      token = generateDeviceToken();
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    console.warn("[fingerprint] localStorage not available:", error);
    return null;
  }
}

/**
 * Get device identity (fingerprint + token)
 * Uses FingerprintJS for browser fingerprinting (NO IP address)
 */
export async function getDeviceIdentity(): Promise<{
  fingerprint: string;
  deviceToken: string | null;
}> {
  // Get or create device token
  const deviceToken = getOrCreateDeviceToken();

  // Get browser fingerprint
  const fp = await FingerprintJS.load();
  const result = await fp.get();

  return {
    fingerprint: result.visitorId,
    deviceToken,
  };
}

/**
 * Clear device token (for testing or user request)
 */
export function clearDeviceToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(DEVICE_TOKEN_KEY);
    } catch (error) {
      console.warn("[fingerprint] Failed to clear device token:", error);
    }
  }
}
