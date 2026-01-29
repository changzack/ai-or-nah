"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

type ChecksRemainingIndicatorProps = {
  type: "credits" | "free";
  remaining: number;
  total?: number;
};

export function ChecksRemainingIndicator({
  type,
  remaining,
  total = 3
}: ChecksRemainingIndicatorProps) {
  if (remaining === 0) {
    return null; // Paywall will handle this
  }

  // Different styling and messaging based on type
  const isCredits = type === "credits";
  const isLow = remaining <= (isCredits ? 5 : 1);

  // Color scheme
  const bgColor = isCredits
    ? (isLow ? "bg-purple-50" : "bg-purple-50")
    : (isLow ? "bg-orange-50" : "bg-blue-50");
  const borderColor = isCredits
    ? (isLow ? "border-purple-300" : "border-purple-200")
    : (isLow ? "border-orange-200" : "border-blue-200");
  const textColor = isCredits
    ? (isLow ? "text-purple-900" : "text-purple-900")
    : (isLow ? "text-orange-900" : "text-blue-900");
  const subTextColor = isCredits
    ? (isLow ? "text-purple-700" : "text-purple-700")
    : (isLow ? "text-orange-700" : "text-blue-700");

  // Icon
  const icon = isCredits ? "💎" : "💎";

  // Messages
  const mainText = isCredits
    ? `${remaining} credit${remaining === 1 ? "" : "s"} remaining`
    : `${remaining} free check${remaining === 1 ? "" : "s"} remaining`;

  const subText = isCredits
    ? (isLow ? "Running low! Purchase more to keep checking" : "Check deducted successfully")
    : (remaining === total
        ? "Try it out before purchasing credits"
        : "Purchase credits for additional checks");

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`${bgColor} border ${borderColor} rounded-xl p-4 mb-4`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {mainText}
          </p>
          <p className={`text-xs ${subTextColor} mt-1`}>
            {subText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
