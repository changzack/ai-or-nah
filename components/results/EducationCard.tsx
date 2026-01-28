"use client";

import { motion } from "framer-motion";
import type { VerdictLevel } from "@/lib/types";
import { staggerContainer, popIn } from "@/lib/animations";

interface EducationCardProps {
  verdict: VerdictLevel;
}

export function EducationCard({ verdict }: EducationCardProps) {
  const getEducationContent = () => {
    if (verdict === "real") {
      return {
        title: "Signs this appears real:",
        emoji: "\u2705",
        tips: [
          "Natural skin texture and imperfections",
          "Consistent facial features across photos",
          "Varied photo settings and backgrounds",
          "Normal engagement patterns",
        ],
      };
    }

    return {
      title: "Red flags to spot yourself:",
      emoji: "\uD83D\uDEA9",
      tips: [
        "Perfect, poreless skin in every photo",
        "Identical facial features despite different angles",
        "Backgrounds that don't quite make sense",
        "Generic captions or repetitive language",
        "New account with massive followers",
        "OnlyFans links + very high AI scores",
      ],
    };
  };

  const content = getEducationContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {content.emoji} {content.title}
      </h3>
      <ul className="list-disc list-inside space-y-3">
        {content.tips.map((tip, index) => (
          <motion.li
            key={index}
            className="text-base text-gray-700 leading-6"
            variants={popIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
          >
            {tip}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
