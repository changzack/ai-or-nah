"use client";

import { motion } from "framer-motion";

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

export function GaugePreview() {
  const centerX = 100;
  const centerY = 100;
  const radius = 70;
  const strokeWidth = 12;
  const needleLength = radius - strokeWidth / 2;

  // Static value for preview - 87% (in the red zone)
  const previewValue = 87;
  const needleRotation = (previewValue / 100) * 180 - 90;
  const needleAngle = needleRotation + 90;
  const needleEnd = polarToCartesian(centerX, centerY, needleLength, needleAngle);

  // Arrow points
  const arrowSize = 6;
  const arrowWidth = 5;
  const arrowTip = polarToCartesian(centerX, centerY, needleLength + arrowSize, needleAngle);
  const arrowLeft = polarToCartesian(centerX, centerY, needleLength - 1, needleAngle - arrowWidth);
  const arrowRight = polarToCartesian(centerX, centerY, needleLength - 1, needleAngle + arrowWidth);
  const arrowPoints = `${arrowTip.x},${arrowTip.y} ${arrowLeft.x},${arrowLeft.y} ${arrowRight.x},${arrowRight.y}`;

  // Arc segments aligned with tick marks
  const segments = [
    { start: 0, end: 45, color: "#A8D5BA" },
    { start: 45, end: 90, color: "#FCD34D" },
    { start: 90, end: 135, color: "#FF8B5A" },
    { start: 135, end: 180, color: "#FF6B6B" },
  ];

  const tickAngles = [0, 45, 90, 135, 180];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="relative mx-auto max-w-[200px]"
    >
      {/* Blur overlay for teaser effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />

      <div className="flex flex-col items-center opacity-80">
        <svg viewBox="0 0 200 130" className="w-full max-w-[180px]">
          {/* Background arc */}
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
            const outerPoint = polarToCartesian(centerX, centerY, radius + strokeWidth / 2 + 2, angle);
            const innerPoint = polarToCartesian(centerX, centerY, radius + strokeWidth / 2 + 8, angle);
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

          {/* Needle */}
          <g>
            <line
              x1={centerX}
              y1={centerY}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="butt"
            />
            <polygon points={arrowPoints} fill="#1F2937" />
          </g>

          {/* Center pivot */}
          <circle cx={centerX} cy={centerY} r="6" fill="#1F2937" />

          {/* Emoji labels */}
          <text x="15" y="118" fontSize="24" textAnchor="start" dominantBaseline="middle">
            👤
          </text>
          <text x="185" y="118" fontSize="24" textAnchor="end" dominantBaseline="middle">
            🤖
          </text>
        </svg>

        <div className="text-2xl font-bold text-[#FF6B6B] -mt-1">
          {previewValue}%
        </div>

        <p className="text-xs text-gray-500 mt-1 text-center">
          See what you'll get
        </p>
      </div>
    </motion.div>
  );
}
