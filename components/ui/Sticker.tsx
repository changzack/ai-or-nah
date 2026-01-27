"use client";

import { motion } from "framer-motion";
import { CSSProperties } from "react";

export type StickerEmoji = "👁️" | "✨" | "🔍" | "✅" | "🚩" | "🤖" | "🎭" | "⚡" | "💫";
export type StickerSize = "sm" | "md" | "lg";

interface StickerProps {
  emoji: StickerEmoji;
  size?: StickerSize;
  rotation?: number;
  className?: string;
}

const sizeMap: Record<StickerSize, string> = {
  sm: "text-2xl w-8 h-8",
  md: "text-4xl w-12 h-12",
  lg: "text-6xl w-16 h-16",
};

export function Sticker({
  emoji,
  size = "md",
  rotation = 0,
  className = "",
}: StickerProps) {
  const style: CSSProperties = {
    transform: `rotate(${rotation}deg)`,
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
      style={style}
      initial={{ scale: 0, rotate: rotation }}
      animate={{ scale: 1, rotate: rotation }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: Math.random() * 0.3,
      }}
      whileHover={{
        scale: 1.1,
        rotate: rotation + 5,
        transition: { duration: 0.2 },
      }}
    >
      <span role="img" aria-label={`sticker ${emoji}`}>
        {emoji}
      </span>
    </motion.div>
  );
}
