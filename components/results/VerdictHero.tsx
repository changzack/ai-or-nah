"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { VerdictLevel } from "@/lib/types";
import { useCountUp } from "@/hooks/useCountUp";
import { useHaptic } from "@/hooks/useHaptic";
import {
  slamIn,
  fadeInUp,
  triggerConfetti,
  prefersReducedMotion,
} from "@/lib/animations";

interface VerdictHeroProps {
  aiLikelihood: number;
  verdict: VerdictLevel;
  username: string;
}

export function VerdictHero({
  aiLikelihood,
  verdict,
  username,
}: VerdictHeroProps) {
  const [showVerdict, setShowVerdict] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const haptic = useHaptic();

  // Animated percentage counter
  const displayPercent = useCountUp(aiLikelihood, {
    duration: 2000,
    delay: 300,
  });

  // Show verdict label after count completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVerdict(true);
      haptic.heavy();
    }, 2300);
    return () => clearTimeout(timer);
  }, []);

  // Trigger confetti for extreme results
  useEffect(() => {
    if (showVerdict && !hasTriggeredConfetti) {
      const isExtreme = aiLikelihood > 85 || aiLikelihood < 15;
      if (isExtreme && !prefersReducedMotion()) {
        setHasTriggeredConfetti(true);
        triggerConfetti({
          particleCount: 150,
          spread: 90,
        });
      }
    }
  }, [showVerdict, aiLikelihood, hasTriggeredConfetti]);

  const getVerdictColor = () => {
    if (aiLikelihood <= 30) return "text-[#A8D5BA]";
    if (aiLikelihood <= 60) return "text-[#FCD34D]";
    if (aiLikelihood <= 80) return "text-[#FF6B6B]";
    return "text-[#FF6B6B]";
  };

  const getVerdictLabel = () => {
    if (aiLikelihood <= 30) return "Probably Real";
    if (aiLikelihood <= 60) return "Hard to Tell";
    if (aiLikelihood <= 80) return "Likely Fake";
    return "Almost Definitely Fake";
  };

  const getVerdictEmoji = () => {
    if (aiLikelihood <= 30) return <span aria-label="checkmark">&#x2705;</span>;
    if (aiLikelihood <= 60) return <span aria-label="thinking">&#x1F914;</span>;
    if (aiLikelihood <= 80) return <span aria-label="warning">&#x26A0;&#xFE0F;</span>;
    return <span aria-label="robot">&#x1F916;</span>;
  };

  const getVerdictBg = () => {
    if (aiLikelihood <= 30) return "from-[#A8D5BA]/10 to-white";
    if (aiLikelihood <= 60) return "from-[#FCD34D]/10 to-white";
    if (aiLikelihood <= 80) return "from-[#FF6B6B]/10 to-white";
    return "from-[#FF6B6B]/20 to-white";
  };

  const getGlowColor = () => {
    if (aiLikelihood <= 30) return "shadow-[#A8D5BA]/30";
    if (aiLikelihood <= 60) return "shadow-[#FCD34D]/30";
    if (aiLikelihood <= 80) return "shadow-[#FF6B6B]/30";
    return "shadow-[#FF6B6B]/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`bg-gradient-to-b ${getVerdictBg()} rounded-2xl p-8 text-center mb-6 shadow-lg ${getGlowColor()}`}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-600 mb-2"
      >
        @{username}
      </motion.p>

      {/* Animated percentage */}
      <motion.div
        className={`text-7xl font-bold mb-4 ${getVerdictColor()}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
      >
        {displayPercent}%
      </motion.div>

      {/* Verdict label slams in after count completes */}
      {showVerdict && (
        <motion.h2
          variants={slamIn}
          initial="hidden"
          animate="visible"
          className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2"
        >
          {getVerdictEmoji()} {getVerdictLabel()}
        </motion.h2>
      )}

      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate={showVerdict ? "visible" : "hidden"}
        className="text-gray-600"
      >
        AI Likelihood Score
      </motion.p>
    </motion.div>
  );
}
