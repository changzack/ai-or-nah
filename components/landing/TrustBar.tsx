"use client";

import { motion } from "framer-motion";

export function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="flex items-center justify-center gap-3 text-sm text-gray-500 mt-4"
    >
      <span className="flex items-center gap-1">
        <span>🔒</span>
        <span>Private</span>
      </span>
      <span className="text-gray-300">·</span>
      <span className="flex items-center gap-1">
        <span>⚡</span>
        <span>10 seconds</span>
      </span>
      <span className="text-gray-300">·</span>
      <span className="flex items-center gap-1">
        <span>✨</span>
        <span>Free</span>
      </span>
    </motion.div>
  );
}
