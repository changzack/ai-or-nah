"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptic } from "@/hooks/useHaptic";
import { triggerMiniConfetti, springTransition } from "@/lib/animations";

interface ShareButtonProps {
  username: string;
  aiLikelihood: number;
  className?: string;
}

export function ShareButton({
  username,
  aiLikelihood,
  className = "",
}: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const haptic = useHaptic();

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/check/${username}`;
  const shareTitle = `@${username}: ${aiLikelihood}% Likely AI - AI or Nah`;

  // Generate verdict-specific share text
  const getShareText = (): string => {
    if (aiLikelihood <= 30) {
      return `✅ @${username} checks out as probably real! I verified with AI or Nah`;
    } else if (aiLikelihood <= 60) {
      return `🤔 Is @${username} real or AI? The results are unclear... Check it out`;
    } else if (aiLikelihood <= 80) {
      return `⚠️ @${username} looks sus! ${aiLikelihood}% likely AI according to AI or Nah`;
    } else {
      return `🤖 I just exposed @${username} as ${aiLikelihood}% AI! Check for yourself`;
    }
  };

  const shareText = getShareText();

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    addRipple(e);
    haptic.light();

    // Check if native share is available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        celebrateSuccess(e);
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
          fallbackCopyToClipboard(e);
        }
      }
    } else {
      // Fallback: copy to clipboard
      fallbackCopyToClipboard(e);
    }
  };

  const fallbackCopyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Combine engaging text + URL for clipboard
    const clipboardContent = `${shareText}\n${shareUrl}`;

    try {
      await navigator.clipboard.writeText(clipboardContent);
      celebrateSuccess(e);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Manual fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = clipboardContent;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        celebrateSuccess(e);
      } catch {
        console.error("Manual copy failed");
      }
      document.body.removeChild(textArea);
    }
  };

  const celebrateSuccess = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSuccess(true);
    haptic.medium();
    showToastMessage();

    // Trigger mini confetti from button position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = rect.top / window.innerHeight;
      triggerMiniConfetti(originX, originY);
    }

    // Reset success state after animation
    setTimeout(() => setIsSuccess(false), 1500);
  };

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={handleShare}
        className={`relative flex items-center justify-center gap-2 overflow-hidden ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        transition={springTransition}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Icon with animated transition */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.svg
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="share"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Copied!
            </motion.span>
          ) : (
            <motion.span
              key="share"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Share This Result
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-[#A8D5BA]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </motion.svg>
              <span className="font-medium">Copied! Ready to share</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
