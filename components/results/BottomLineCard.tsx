"use client";

import { motion } from "framer-motion";

interface BottomLineCardProps {
  message: string;
}

export function BottomLineCard({ message }: BottomLineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#8B5CF6]/10 rounded-2xl p-6 border-2 border-[#8B5CF6]/30"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        The Bottom Line
      </h3>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-lg font-medium text-gray-900 leading-relaxed"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
