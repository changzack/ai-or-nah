"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

type FreeChecksIndicatorProps = {
  remaining: number;
  total?: number;
};

export function FreeChecksIndicator({ remaining, total = 3 }: FreeChecksIndicatorProps) {
  if (remaining === 0) {
    return null; // Paywall will handle this
  }

  // Change color based on remaining checks
  const isLow = remaining <= 1;
  const bgColor = isLow ? "bg-red-50" : "bg-blue-50";
  const borderColor = isLow ? "border-red-300" : "border-blue-200";
  const textColor = isLow ? "text-red-900" : "text-blue-900";
  const subTextColor = isLow ? "text-red-700" : "text-blue-700";

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`${bgColor} border ${borderColor} rounded-xl p-4 mb-4 sticky top-4 z-20`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">💎</div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {remaining} free check{remaining === 1 ? "" : "s"} remaining
          </p>
          <p className={`text-xs ${subTextColor} mt-1`}>
            {remaining === total
              ? "Try it out before purchasing credits"
              : "Purchase credits for additional checks"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
