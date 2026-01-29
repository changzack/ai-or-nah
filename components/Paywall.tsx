"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, springTransition } from "@/lib/animations";
import { CREDIT_PACKS } from "@/lib/constants";
import type { CreditPackId } from "@/lib/constants";
import { track } from "@/lib/analytics";

type PaywallProps = {
  onClose?: () => void;
  freeChecksUsed?: number;
  onShowEmailVerification?: () => void;
};

const packs = [
  {
    id: "small" as CreditPackId,
    name: "Starter",
    credits: CREDIT_PACKS.SMALL.credits,
    price: CREDIT_PACKS.SMALL.priceCents / 100,
    pricePerCheck: (CREDIT_PACKS.SMALL.priceCents / CREDIT_PACKS.SMALL.credits / 100).toFixed(2),
    popular: false,
  },
  {
    id: "medium" as CreditPackId,
    name: "Popular",
    credits: CREDIT_PACKS.MEDIUM.credits,
    price: CREDIT_PACKS.MEDIUM.priceCents / 100,
    pricePerCheck: (CREDIT_PACKS.MEDIUM.priceCents / CREDIT_PACKS.MEDIUM.credits / 100).toFixed(2),
    popular: true,
  },
  {
    id: "large" as CreditPackId,
    name: "Best Value",
    credits: CREDIT_PACKS.LARGE.credits,
    price: CREDIT_PACKS.LARGE.priceCents / 100,
    pricePerCheck: (CREDIT_PACKS.LARGE.priceCents / CREDIT_PACKS.LARGE.credits / 100).toFixed(2),
    popular: false,
  },
];

export function Paywall({ onClose, freeChecksUsed, onShowEmailVerification }: PaywallProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track paywall view on mount
  useEffect(() => {
    track('Viewed Paywall', {
      trigger: freeChecksUsed ? 'no_credits' : 'upgrade',
      creditsRemaining: 0,
    });
  }, []);

  const handlePurchase = async (packId: CreditPackId) => {
    setPurchasing(true);
    setError(null);

    const selectedPack = packs.find(p => p.id === packId);
    if (selectedPack) {
      track('Selected Package', {
        package: packId,
        price: selectedPack.price,
        credits: selectedPack.credits,
      });
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packId }),
      });

      const data = await response.json();

      if (data.status === "success" && data.url) {
        // Track checkout start
        const selectedPack = packs.find(p => p.id === packId);
        if (selectedPack) {
          track('Started Checkout', {
            package: packId,
            price: selectedPack.price,
          });
        }
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to create checkout session");
        setPurchasing(false);
        track('Failed Purchase', {
          package: packId,
          errorType: 'checkout_creation_failed',
        });
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setPurchasing(false);
      track('Failed Purchase', {
        package: packId,
        errorType: 'network_error',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={springTransition}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-6">
            <div className="text-5xl mb-3">🔓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {freeChecksUsed ? "Free Checks Used" : "Get More Checks"}
            </h2>
            <p className="text-gray-600">
              {freeChecksUsed
                ? "You've used all 3 free lifetime checks. Purchase credits to keep checking accounts."
                : "Purchase credits to continue verifying accounts."}
            </p>
          </motion.div>

          {/* Credit Packs */}
          <motion.div variants={fadeInUp} className="space-y-3 mb-6">
            {packs.map((pack) => (
              <motion.button
                key={pack.id}
                onClick={() => handlePurchase(pack.id)}
                disabled={purchasing}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${
                  pack.popular
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                    : "border-gray-200 hover:border-[#8B5CF6]"
                } ${purchasing ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                whileHover={!purchasing ? { scale: 1.02 } : {}}
                whileTap={!purchasing ? { scale: 0.98 } : {}}
              >
                {pack.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#8B5CF6] text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {pack.credits} Checks
                    </div>
                    <div className="text-sm text-gray-600">
                      ${pack.pricePerCheck} per check
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#8B5CF6]">
                      ${pack.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
              >
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Already purchased */}
          {onShowEmailVerification && (
            <motion.div variants={fadeInUp} className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Already purchased credits?</p>
              <button
                onClick={onShowEmailVerification}
                className="text-[#8B5CF6] font-medium text-sm hover:underline"
              >
                Sign in with email
              </button>
            </motion.div>
          )}

          {/* Disclaimer */}
          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Credits never expire. Secure payment via Stripe.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
