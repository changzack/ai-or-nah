"use client";

type HapticIntensity = "light" | "medium" | "heavy";

const vibrationPatterns: Record<HapticIntensity, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: [50, 30, 50],
};

export function useHaptic() {
  const trigger = (intensity: HapticIntensity = "light") => {
    // Check if vibration API is available (mobile devices)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(vibrationPatterns[intensity]);
      } catch {
        // Silently fail if vibration not supported
      }
    }
  };

  return {
    light: () => trigger("light"),
    medium: () => trigger("medium"),
    heavy: () => trigger("heavy"),
    trigger,
  };
}
