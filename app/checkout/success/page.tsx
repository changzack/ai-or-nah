"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DesktopGate } from "@/components/DesktopGate";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { track } from "@/lib/analytics";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    // Create session and poll for credits
    const initSession = async () => {
      try {
        console.log("[checkout-success] Creating session from Stripe session:", sessionId);

        // Step 1: Create authenticated session
        const sessionResponse = await fetch("/api/auth/stripe-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const sessionData = await sessionResponse.json();
        console.log("[checkout-success] Session creation response:", sessionData);

        if (sessionData.status !== "success") {
          setError(sessionData.message || "Failed to verify payment");
          setLoading(false);
          return;
        }

        // Check if credits are already present (webhook processed quickly)
        if (sessionData.credits && sessionData.credits > 0) {
          console.log("[checkout-success] Credits already present from session creation:", sessionData.credits);
          setCredits(sessionData.credits);
          setLoading(false);
          return;
        }

        console.log("[checkout-success] No credits yet, starting to poll...");

        // Step 2: Poll for credits (webhook might have delay)
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = 1000; // 1 second

        const pollForCredits = async () => {
          try {
            console.log(`[checkout-success] Polling for credits (attempt ${attempts + 1}/${maxAttempts})...`);

            const balanceResponse = await fetch("/api/credits/balance");
            const balanceData = await balanceResponse.json();
            console.log("[checkout-success] Balance response:", balanceData);

            if (balanceData.status === "success" && balanceData.credits > 0) {
              console.log("[checkout-success] Credits found:", balanceData.credits);
              setCredits(balanceData.credits);
              setLoading(false);
              return;
            }

            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollForCredits, pollInterval);
            } else {
              console.log("[checkout-success] Max polling attempts reached, webhook may be delayed");
              // Webhook delayed but payment succeeded - show success anyway
              setCredits(0);
              setLoading(false);
            }
          } catch (err) {
            console.error("[checkout-success] Error polling for credits:", err);
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollForCredits, pollInterval);
            } else {
              setError("Failed to verify payment. Please refresh the page.");
              setLoading(false);
            }
          }
        };

        pollForCredits();
      } catch (err) {
        console.error("[checkout-success] Error creating session:", err);
        setError("Failed to verify payment. Please try again.");
        setLoading(false);
      }
    };

    initSession();
  }, [sessionId]);

  // Track successful purchase
  useEffect(() => {
    if (!loading && !error && credits !== null) {
      track('Completed Purchase', {
        credits,
        source: 'checkout_redirect'
      });
    }
  }, [loading, error, credits]);

  // Single return with conditional rendering
  return (
    <>
      <DesktopGate />
      <div className="min-h-screen flex items-center justify-center px-5 md:px-8 lg:px-12 bg-[#FDF6E9]">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing your payment...
              </h2>
              <p className="text-gray-600">This will only take a moment</p>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md md:max-w-lg lg:max-w-xl text-center"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-bold hover:bg-[#E85555] transition-colors"
              >
                Back to Home
              </button>
            </motion.div>
          )}

          {!loading && !error && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md md:max-w-lg lg:max-w-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="text-7xl mb-6"
              >
                🎉
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Payment Successful!
              </h1>

              <p className="text-gray-600 mb-8">
                {credits !== null && credits > 0
                  ? `You now have ${credits} credit${credits === 1 ? "" : "s"} available.`
                  : "Your credits will be available shortly."}
              </p>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-[#8B5CF6] text-white py-4 rounded-full font-bold text-lg hover:bg-[#7C3AED] transition-colors"
              >
                Start Checking Accounts
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-5 md:px-8 lg:px-12 bg-[#FDF6E9]">
        <div className="text-6xl">⏳</div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
