"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AIDetectionMeterProps {
  aiLikelihood: number; // 0-100
  onAnimationComplete?: () => void;
  className?: string;
}

// Helper to convert polar coordinates to cartesian
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Helper to describe an arc path
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export function AIDetectionMeter({
  aiLikelihood,
  onAnimationComplete,
  className = "",
}: AIDetectionMeterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [needleRotation, setNeedleRotation] = useState(-90); // Start at -90° (left/0%)
  const hasAnimated = useRef(false);

  // Determine active color based on likelihood (aligned with segments)
  const getActiveColor = (value: number) => {
    if (value <= 25) return "#A8D5BA"; // Soft Sage (Green)
    if (value <= 50) return "#FCD34D"; // Sunny Yellow
    if (value <= 75) return "#FF8B5A"; // Orange
    return "#FF6B6B"; // Coral Pop (Red)
  };

  useEffect(() => {
    // Check for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Skip animation, show final state
      setDisplayValue(aiLikelihood);
      setNeedleRotation((aiLikelihood / 100) * 180 - 90);
      onAnimationComplete?.();
      return;
    }

    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Calculate target rotation (-90° to +90° maps to 0-100%)
    const targetRotation = (aiLikelihood / 100) * 180 - 90;
    const startRotation = -90;

    // Animate both needle and percentage
    const startTime = Date.now() + 300; // 300ms delay
    const duration = 2000;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for smooth deceleration
      const easedProgress =
        progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      // Animate needle angle (sweeps around the arc)
      const currentRotation = startRotation + (targetRotation - startRotation) * easedProgress;
      setNeedleRotation(currentRotation);

      // Animate percentage display
      const currentValue = Math.round(aiLikelihood * easedProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Add wiggle effect at the end with spring physics
        const wiggleStart = Date.now();
        const wiggleDuration = 600;
        const wiggleAmount = 3; // degrees to overshoot

        const wiggle = () => {
          const wiggleElapsed = Date.now() - wiggleStart;
          const wiggleProgress = Math.min(wiggleElapsed / wiggleDuration, 1);

          // Damped oscillation
          const dampingFactor = Math.exp(-wiggleProgress * 4);
          const oscillation = Math.sin(wiggleProgress * Math.PI * 3) * dampingFactor;
          const wiggleRotation = targetRotation + (oscillation * wiggleAmount);

          setNeedleRotation(wiggleRotation);

          if (wiggleProgress < 1) {
            requestAnimationFrame(wiggle);
          } else {
            setNeedleRotation(targetRotation);
            onAnimationComplete?.();
          }
        };

        requestAnimationFrame(wiggle);
      }
    };

    requestAnimationFrame(animate);
  }, [aiLikelihood, onAnimationComplete]);

  // SVG configuration
  const centerX = 100;
  const centerY = 100;
  const radius = 70;
  const strokeWidth = 12;
  const needleLength = radius - strokeWidth / 2;

  // Arc segments aligned with tick marks (0°, 45°, 90°, 135°, 180°)
  const segments = [
    { start: 0, end: 45, color: "#A8D5BA" }, // Green: 0-25%
    { start: 45, end: 90, color: "#FCD34D" }, // Yellow: 25-50%
    { start: 90, end: 135, color: "#FF8B5A" }, // Orange: 50-75%
    { start: 135, end: 180, color: "#FF6B6B" }, // Red: 75-100%
  ];

  // Tick mark positions (0%, 25%, 50%, 75%, 100%)
  const tickAngles = [0, 45, 90, 135, 180];

  // Calculate needle endpoint based on rotation angle
  // needleRotation ranges from -90° to +90°
  // Map to arc angle: -90° -> 0° (left), 0° -> 90° (bottom), +90° -> 180° (right)
  const needleAngle = needleRotation + 90;
  const needleEnd = polarToCartesian(centerX, centerY, needleLength, needleAngle);

  // Calculate arrow points (triangle at needle tip)
  const arrowSize = 6; // arrow height
  const arrowWidth = 5; // arrow base width
  const arrowTip = polarToCartesian(centerX, centerY, needleLength + arrowSize, needleAngle);
  const arrowLeft = polarToCartesian(
    centerX,
    centerY,
    needleLength - 1,
    needleAngle - arrowWidth
  );
  const arrowRight = polarToCartesian(
    centerX,
    centerY,
    needleLength - 1,
    needleAngle + arrowWidth
  );
  const arrowPoints = `${arrowTip.x},${arrowTip.y} ${arrowLeft.x},${arrowLeft.y} ${arrowRight.x},${arrowRight.y}`;

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      role="meter"
      aria-valuenow={aiLikelihood}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`AI Detection: ${aiLikelihood}%`}
    >
      {/* SVG Gauge */}
      <svg
        viewBox="0 0 200 130"
        className="w-full max-w-[280px]"
        aria-hidden="true"
      >
        {/* Background arc (gray track) */}
        <path
          d={describeArc(centerX, centerY, radius, 0, 180)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segments.map((segment, idx) => (
          <path
            key={idx}
            d={describeArc(centerX, centerY, radius, segment.start, segment.end)}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}

        {/* Tick marks */}
        {tickAngles.map((angle, idx) => {
          const outerPoint = polarToCartesian(
            centerX,
            centerY,
            radius + strokeWidth / 2 + 2,
            angle
          );
          const innerPoint = polarToCartesian(
            centerX,
            centerY,
            radius + strokeWidth / 2 + 8,
            angle
          );
          return (
            <line
              key={idx}
              x1={outerPoint.x}
              y1={outerPoint.y}
              x2={innerPoint.x}
              y2={innerPoint.y}
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle - sweeps around the arc as needleRotation updates */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <line
            x1={centerX}
            y1={centerY}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="butt"
          />
          {/* Arrow tip */}
          <polygon
            points={arrowPoints}
            fill="#1F2937"
          />
        </motion.g>

        {/* Center pivot - solid filled */}
        <circle cx={centerX} cy={centerY} r="6" fill="#1F2937" />

        {/* Emoji labels */}
        <text
          x="15"
          y="118"
          fontSize="24"
          textAnchor="start"
          dominantBaseline="middle"
        >
          👤
        </text>
        <text
          x="185"
          y="118"
          fontSize="24"
          textAnchor="end"
          dominantBaseline="middle"
        >
          🤖
        </text>
      </svg>

      {/* Percentage display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-bold mt-2"
        style={{ color: getActiveColor(displayValue) }}
      >
        {displayValue}%
      </motion.div>
    </div>
  );
}
