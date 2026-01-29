"use client";

import { useState, useEffect } from "react";
import { getDeviceIdentity } from "@/lib/fingerprint";

/**
 * Device identity hook
 * Provides device fingerprint and token
 */

export function useDeviceIdentity() {
  const [identity, setIdentity] = useState<{
    fingerprint: string | null;
    deviceToken: string | null;
  }>({
    fingerprint: null,
    deviceToken: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIdentity() {
      try {
        const result = await getDeviceIdentity();
        setIdentity(result);
      } catch (error) {
        console.error("[useDeviceIdentity] Error getting device identity:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadIdentity();
  }, []);

  return {
    fingerprint: identity.fingerprint,
    deviceToken: identity.deviceToken,
    isLoading,
  };
}
