"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { parseInstagramUsername } from "@/lib/username";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sticker } from "@/components/ui/Sticker";
import { DesktopGate } from "@/components/DesktopGate";
import { Header } from "@/components/Header";
import { FreeChecksIndicator } from "@/components/FreeChecksIndicator";
import { Footer } from "@/components/Footer";
import { TrustBar } from "@/components/landing/TrustBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";
import { fadeInUp, staggerContainer, springTransition, float } from "@/lib/animations";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { fingerprint, deviceToken, isLoading: deviceLoading } = useDeviceIdentity();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRateLimitNotice, setShowRateLimitNotice] = useState(false);
  const [freeChecksRemaining, setFreeChecksRemaining] = useState<number | null>(null);

  // Check if user was redirected due to rate limit
  useEffect(() => {
    if (searchParams.get("rate_limited") === "true") {
      setShowRateLimitNotice(true);
      // Auto-hide after 10 seconds
      const timeout = setTimeout(() => {
        setShowRateLimitNotice(false);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams]);

  // Fetch free checks remaining for anonymous users
  const fetchFreeChecks = async () => {
    if (isAuthenticated || authLoading || deviceLoading) {
      return;
    }

    if (fingerprint) {
      try {
        const response = await fetch("/api/device/checks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint, deviceToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setFreeChecksRemaining(data.freeChecksRemaining);
        }
      } catch (error) {
        console.error("Error fetching free checks:", error);
      }
    }
  };

  useEffect(() => {
    fetchFreeChecks();
  }, [isAuthenticated, authLoading, deviceLoading, fingerprint, deviceToken]);

  // Refresh free checks when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isAuthenticated) {
        fetchFreeChecks();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, fingerprint, deviceToken, authLoading, deviceLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate input
    if (!input.trim()) {
      setError("Please enter an Instagram username or URL");
      return;
    }

    // Parse username
    const username = parseInstagramUsername(input);

    if (!username) {
      setError("Invalid Instagram username or URL. Try again.");
      return;
    }

    // Navigate to check page
    setIsSubmitting(true);
    router.push(`/check/${username}`);
  };

  return (
    <>
      <DesktopGate />
      <Header />

      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5 md:px-8 lg:px-12 py-6 md:py-8 lg:py-12 relative">
          {/* Decorative stickers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              variants={float}
              initial="initial"
              animate="animate"
              className="absolute top-24 left-6 md:left-12 lg:left-20"
              style={{ transform: 'scaleX(-1)' }}
            >
              <Sticker emoji="👁️" size="md" rotation={-8} />
            </motion.div>
            <motion.div
              variants={float}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
              className="absolute top-40 right-12 md:right-20 lg:right-32"
            >
              <Sticker emoji="🔍" size="md" rotation={8} />
            </motion.div>
            <motion.div
              variants={float}
              initial="initial"
              animate="animate"
              transition={{ delay: 1 }}
              className="absolute bottom-40 left-12 md:left-20 lg:left-32"
            >
              <Sticker emoji="💫" size="md" rotation={15} />
            </motion.div>
            <motion.div
              variants={float}
              initial="initial"
              animate="animate"
              transition={{ delay: 1.5 }}
              className="absolute bottom-32 right-8 md:right-16 lg:right-24"
            >
              <Sticker emoji="🚩" size="md" rotation={-8} />
            </motion.div>
          </div>

          <motion.div
            className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Rate Limit Notice */}
            <AnimatePresence>
              {showRateLimitNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-[#FF6B6B] flex-shrink-0 mt-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1A1A1A] mb-1">
                        Daily limit reached
                      </p>
                      <p className="text-sm text-[#1A1A1A]/80">
                        You can still view accounts others have searched! Try
                        entering a popular username.
                      </p>
                    </div>
                    <motion.button
                      onClick={() => setShowRateLimitNotice(false)}
                      className="text-[#FF6B6B] hover:text-[#E85555] flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Free Checks Indicator (for anonymous users) */}
            {!authLoading && !isAuthenticated && freeChecksRemaining !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <FreeChecksIndicator remaining={freeChecksRemaining} />
              </motion.div>
            )}

            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center mb-10">
              {/* Hero Logo */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image
                  src="/ai_or_nah_logo_no_bg.png"
                  alt="AI or Nah logo - AI detection tool"
                  width={400}
                  height={400}
                  priority
                />
              </motion.div>

              <motion.h1
                className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 -mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Detect AI-Generated
                <br className="md:hidden" /> Instagram Accounts
              </motion.h1>
              <motion.p
                className="text-lg text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Check if your IG crush is real — find out in seconds
              </motion.p>
            </motion.div>

            {/* Input Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Input
                type="text"
                placeholder="@username or instagram.com/username"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                error={error}
                disabled={isSubmitting}
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.span
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.span
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Checking...
                  </motion.span>
                ) : (
                  "Let's Check 'Em"
                )}
              </Button>
            </motion.form>

            {/* Trust Signals */}
            <TrustBar />

            {/* Supporting Copy */}
            <motion.div
              className="mt-8 mb-8 text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-base text-gray-600">
                Don&apos;t get catfished.
              </p>
              <p className="text-base text-gray-600">
                Verify before you slide into DMs.
              </p>
              <p className="text-base text-gray-600">
                Check before you subscribe.
              </p>
            </motion.div>

            {/* How It Works */}
            <HowItWorks />
          </motion.div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-3 border-[#8B5CF6] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
