"use client";

import { motion } from "framer-motion";
import type { RedFlag } from "@/lib/types";
import { staggerContainer, popIn } from "@/lib/animations";

interface FlagsCardProps {
  title: string;
  emoji: string;
  flags: RedFlag[];
}

export function FlagsCard({ title, emoji, flags }: FlagsCardProps) {
  if (flags.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl p-6"
      style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {emoji} {title}
      </h3>

      <ul className="list-disc list-inside space-y-3">
        {flags.map((flag, index) => (
          <motion.li
            key={index}
            className="text-base text-gray-700 leading-6"
            variants={popIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
          >
            {flag.message}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
