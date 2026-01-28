"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DesktopGate } from "@/components/DesktopGate";
import { VerdictHero } from "@/components/results/VerdictHero";
import { ImageGrid } from "@/components/results/ImageGrid";
import { FlagsCard } from "@/components/results/FlagsCard";
import { EducationCard } from "@/components/results/EducationCard";
import { ShareButton } from "@/components/ShareButton";
import { Sticker } from "@/components/ui/Sticker";
import { RateLimitError } from "@/components/RateLimitError";
import { Footer } from "@/components/Footer";
import { MagnifyingGlassLoader } from "@/components/MagnifyingGlassLoader";
import { useHaptic } from "@/hooks/useHaptic";
import { fadeInUp, staggerContainer, springTransition } from "@/lib/animations";
import type { AnalysisResult, RateLimitResult } from "@/lib/types";

// Loading stages configuration
const loadingStages = [
  { label: "Finding profile", emoji: "magnifying glass tilted left", icon: "\uD83D\uDD0D" },
  { label: "Downloading images", emoji: "inbox tray", icon: "\uD83D\uDCE5" },
  { label: "AI scanning faces", emoji: "robot", icon: "\uD83E\uDD16" },
  { label: "Calculating verdict", emoji: "balance scale", icon: "\u2696\uFE0F" },
];

// Helper function to format "time ago" from ISO timestamp
function formatTimeAgo(isoTimestamp: string): string {
  const now = new Date();
  const checked = new Date(isoTimestamp);
  const diffMs = now.getTime() - checked.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

// Animated checkmark component
function AnimatedCheckmark() {
  return (
    <motion.svg
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className="w-5 h-5 text-[#A8D5BA]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

// Loading stage item component
function LoadingStageItem({
  stage,
  status,
  index,
}: {
  stage: (typeof loadingStages)[0];
  status: "pending" | "active" | "complete";
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 1, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
        status === "active"
          ? "bg-[#8B5CF6]/10"
          : status === "complete"
          ? "bg-[#A8D5BA]/20"
          : "bg-[#FDF6E9]"
      }`}
    >
      {/* Status indicator */}
      <div className="w-8 h-8 flex items-center justify-center">
        {status === "complete" ? (
          <AnimatedCheckmark />
        ) : status === "active" ? (
          <motion.div
            className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        )}
      </div>

      {/* Icon */}
      <span className="text-xl">{stage.icon}</span>

      {/* Label */}
      <span
        className={`font-medium ${
          status === "active"
            ? "text-[#8B5CF6]"
            : status === "complete"
            ? "text-[#A8D5BA]"
            : "text-gray-500"
        }`}
      >
        {stage.label}
        {status === "active" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        )}
      </span>
    </motion.div>
  );
}

export default function CheckPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const haptic = useHaptic();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<RateLimitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    analyzeUsername();
  }, [username]);

  const analyzeUsername = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentStage(0);

      // Record start time for minimum duration enforcement
      const startTime = Date.now();
      const MINIMUM_LOADING_DURATION = 5000; // 5 seconds minimum

      // Progress through stages
      const stageInterval = setInterval(() => {
        setCurrentStage((prev) => {
          const next = prev + 1;
          if (next < loadingStages.length) {
            haptic.light();
          }
          return Math.min(next, loadingStages.length - 1);
        });
      }, 4000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      clearInterval(stageInterval);

      // Complete all stages quickly
      for (let i = currentStage; i < loadingStages.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setCurrentStage(i + 1);
      }

      const data = await response.json();

      // Calculate elapsed time and ensure minimum duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_LOADING_DURATION - elapsedTime);

      if (remainingTime > 0) {
        console.log(`[Loading] Adding ${remainingTime}ms delay to meet minimum duration`);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // Small delay before showing results for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if rate limited
      if (data.status === "rate_limited") {
        setRateLimited(data as RateLimitResult);
        setLoading(false);
        return;
      }

      // Check for other errors
      if (!response.ok || data.status === "error") {
        setError(data.message || "Failed to analyze account");
        setLoading(false);
        return;
      }

      // Success
      setResult(data as AnalysisResult);
      setLoading(false);
      haptic.medium();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <DesktopGate />
        <div className="min-h-screen flex items-center justify-center px-5 bg-[#FDF6E9]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <MagnifyingGlassLoader username={username} />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500 text-center mb-8"
            >
              This will only take a few moments
            </motion.p>

            {/* Loading stages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {loadingStages.map((stage, index) => (
                <LoadingStageItem
                  key={index}
                  stage={stage}
                  index={index}
                  status={
                    index < currentStage
                      ? "complete"
                      : index === currentStage
                      ? "active"
                      : "pending"
                  }
                />
              ))}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#8B5CF6] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((currentStage + 1) / loadingStages.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  if (rateLimited) {
    return (
      <>
        <DesktopGate />
        <RateLimitError resetsAt={rateLimited.resetsAt} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <DesktopGate />
        <div className="min-h-screen flex items-center justify-center px-5 bg-[#FDF6E9]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="text-6xl mb-4"
            >
              <span aria-label="warning">&#x26A0;&#xFE0F;</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              couldn't analyze account
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button
              onClick={() => router.push("/")}
              className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-bold hover:bg-[#E85555] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
            >
              Try Another Account
            </motion.button>
          </motion.div>
        </div>
      </>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <>
      <DesktopGate />

      <div className="min-h-screen bg-[#FDF6E9] pb-20 relative">
        {/* Decorative stickers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Sticker emoji="🤖" size="sm" rotation={-10} className="absolute top-24 right-8" />
          <Sticker emoji="💫" size="md" rotation={12} className="absolute top-64 left-4" />
          <Sticker emoji="🚩" size="sm" rotation={-8} className="absolute top-96 right-12" />
        </div>

        <div className="max-w-2xl mx-auto px-5 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <motion.button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              whileHover={{ x: -4 }}
              transition={springTransition}
            >
              <span aria-label="back arrow">&#x2190;</span> Back
            </motion.button>
          </motion.div>

          {/* Verdict Hero */}
          <VerdictHero
            aiLikelihood={result.aiLikelihood}
            verdict={result.verdict}
            username={result.username}
          />

          {/* Staggered content reveal */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Image Analysis Section */}
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-2xl p-6 mb-4"
              style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                <span aria-label="camera">&#x1F4F8;</span> The Images
              </h3>

              <p className="text-base text-gray-700 mb-4">
                {result.imageAnalysis.message}
              </p>

              <ImageGrid
                imageUrls={result.imageUrls}
                imagesAnalyzed={result.imageAnalysis.count}
              />
            </motion.div>

            {/* Profile Flags */}
            <AnimatePresence>
              {result.profileFlags.length > 0 && (
                <motion.div variants={fadeInUp} className="mb-4">
                  <FlagsCard
                    title="Profile Analysis"
                    emoji="👤"
                    flags={result.profileFlags}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Consistency Flags */}
            <AnimatePresence>
              {result.consistencyFlags.length > 0 && (
                <motion.div variants={fadeInUp} className="mb-4">
                  <FlagsCard
                    title="Engagement Pattern Analysis"
                    emoji="🎯"
                    flags={result.consistencyFlags}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Education */}
            <motion.div variants={fadeInUp} className="mb-4">
              <EducationCard verdict={result.verdict} />
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              variants={fadeInUp}
              className="bg-gray-100 rounded-xl p-4 mb-6"
            >
              <p className="text-xs text-gray-600 text-center">
                <span aria-label="warning">&#x26A0;&#xFE0F;</span> This is an automated analysis for entertainment purposes.
                Results are not definitive proof.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="space-y-3">
              {/* Share Button - Primary Action */}
              <ShareButton
                username={result.username}
                aiLikelihood={result.aiLikelihood}
                className="w-full bg-[#FF6B6B] text-white py-4 rounded-full font-bold text-lg hover:bg-[#E85555] transition-colors"
              />

              {/* Check Another - Secondary Action */}
              <motion.button
                onClick={() => router.push("/")}
                className="w-full bg-white text-[#1A1A1A] py-4 rounded-full font-bold text-lg hover:bg-[#FDF6E9] transition-colors border-2 border-[#1A1A1A]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={springTransition}
              >
                Check Another Account
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </>
  );
}
