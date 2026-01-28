"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { prefersReducedMotion } from "@/lib/animations";

interface MagnifyingGlassLoaderProps {
  username: string;
}

export function MagnifyingGlassLoader({ username }: MagnifyingGlassLoaderProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const reducedMotion = prefersReducedMotion();

  // Estimate initial width based on username length to start animation immediately
  const estimatedWidth = username.length * 28; // Rough estimate for 4xl text

  // Measure text and container width
  useEffect(() => {
    const measure = () => {
      if (textRef.current) {
        const width = textRef.current.offsetWidth;
        setTextWidth(width);
      }
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    // Set estimated widths immediately so animation can start
    setTextWidth(estimatedWidth);
    setContainerWidth(400); // Estimated container width for mobile

    // Then refine with actual measurement
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    } else {
      setTimeout(measure, 100);
    }

    // Re-measure on window resize
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [username, estimatedWidth]);

  // Calculate animation parameters based on text width
  const glassSize = 120; // Diameter of the magnifying glass
  const glassRadius = glassSize / 2;

  // Motion value for the glass position
  const glassX = useMotionValue(0);

  // Transform glassX into glass SVG position
  const glassPosition = useTransform(glassX, (x) => x - glassRadius);

  // Start animation when container width is ready
  useEffect(() => {
    if (containerWidth > 0 && !reducedMotion) {
      // Start from off-screen left, travel to off-screen right
      const containerHalfWidth = containerWidth / 2;
      const startX = -containerHalfWidth - glassRadius;
      const endX = containerHalfWidth + glassRadius;
      const travelDistance = endX - startX;
      const duration = Math.max(3, Math.min(5, travelDistance / 100)) * 2;

      // Animate back and forth across the full container
      const controls = animate(glassX, [startX, endX, startX], {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      });

      return () => controls.stop();
    }
  }, [containerWidth, glassRadius, reducedMotion, glassX]);

  return (
    <div className="relative flex flex-col items-center justify-center mb-8">
      {/* Container for the text and magnifying effect */}
      <div ref={containerRef} className="relative w-full" style={{ height: "100px", overflow: "hidden" }}>
        {/* Hidden text for measurement */}
        <div
          ref={textRef}
          className="text-4xl font-bold text-gray-900 opacity-0 pointer-events-none whitespace-nowrap"
          aria-hidden="true"
        >
          @{username}
        </div>

        {/* Base text layer - the only text shown */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-gray-900 whitespace-nowrap"
          style={{ zIndex: 1 }}
        >
          @{username}
        </div>

        {/* Magnifying glass icon - sweeps across the full container */}
        {containerWidth > 0 && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-y-1/2"
            style={{
              zIndex: 2,
              x: reducedMotion ? "-50%" : glassPosition,
            }}
          >
            <svg
              width={glassSize}
              height={glassSize}
              viewBox="0 0 120 120"
              fill="none"
              className="drop-shadow-lg"
            >
              {/* Glass lens with light blue tint */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="rgba(200, 220, 255, 0.15)"
              />
              {/* Metal rim */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="#4B5563"
                strokeWidth="4"
                fill="none"
              />
              {/* Inner highlight for depth */}
              <circle
                cx="60"
                cy="60"
                r="40"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
              {/* Lens glint/reflection */}
              <circle
                cx="50"
                cy="50"
                r="12"
                fill="white"
                opacity="0.4"
              />
              <circle
                cx="48"
                cy="48"
                r="6"
                fill="white"
                opacity="0.6"
              />
              {/* Handle - dark gray/black */}
              <line
                x1="85"
                y1="85"
                x2="110"
                y2="110"
                stroke="#374151"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Handle highlight for 3D effect */}
              <line
                x1="86"
                y1="86"
                x2="109"
                y2="109"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* "Analyzing" label below */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-gray-500 text-center mt-2"
      >
        analyzing account...
      </motion.p>
    </div>
  );
}
