"use client";

import { motion } from "framer-motion";

export function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-6"
    >
      <span className="flex items-center gap-1">
        <span>⚡</span>
        <span>Results in seconds</span>
      </span>
      <span className="hidden sm:inline text-gray-300">•</span>
      <span className="flex items-center gap-1">
        <span>🔒</span>
        <span>100% private</span>
      </span>
      <span className="hidden sm:inline text-gray-300">•</span>
      <span className="flex items-center gap-1">
        <span>✨</span>
        <span>No account needed</span>
      </span>
    </motion.div>
  );
}
