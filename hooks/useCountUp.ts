"use client";

import { useState, useEffect, useRef } from "react";

// Easing function for smooth slowdown at the end
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  startFrom?: number;
  enabled?: boolean;
}

export function useCountUp(
  target: number,
  options: UseCountUpOptions = {}
): number {
  const { duration = 2000, delay = 0, startFrom = 0, enabled = true } = options;
  const [current, setCurrent] = useState(startFrom);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCurrent(startFrom);
      return;
    }

    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) {
        setCurrent(target);
        return;
      }
    }

    const delayTimeout = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const value = Math.round(startFrom + (target - startFrom) * easedProgress);

        setCurrent(value);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, delay, startFrom, enabled]);

  return current;
}
