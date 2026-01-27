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

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
      >
        {flags.map((flag, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3"
            variants={popIn}
          >
            <motion.span
              className="text-xl flex-shrink-0 mt-0.5"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
                delay: index * 0.1,
              }}
            >
              {flag.type === "negative" ? (
                <span aria-label="red flag">&#x274C;</span>
              ) : (
                <span aria-label="green check">&#x2705;</span>
              )}
            </motion.span>
            <p className="text-base text-gray-700 leading-relaxed">
              {flag.message}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
