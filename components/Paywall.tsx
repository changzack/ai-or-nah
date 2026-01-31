"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, springTransition } from "@/lib/animations";
import type { CreditPackId } from "@/lib/constants";
import { track } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

type PaywallProps = {
  onClose?: () => void;
  freeChecksUsed?: number;
  onShowEmailVerification?: () => void;
};

type ProductPack = {
  id: CreditPackId;
  name: string;
  credits: number;
  price: number;
  pricePerCheck: string;
  popular?: boolean;
};

const PACK_DISPLAY_NAMES: Record<string, { name: string; popular: boolean }> = {
  small: { name: "Starter", popular: false },
  medium: { name: "Popular", popular: true },
  large: { name: "Best Value", popular: false },
};

export function Paywall({ onClose, freeChecksUsed, onShowEmailVerification }: PaywallProps) {
  const { isAuthenticated, email } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packs, setPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.status === "success") {
          const formattedPacks = data.products.map((product: any) => ({
            id: product.id,
            name: PACK_DISPLAY_NAMES[product.id]?.name || product.name,
            credits: product.credits,
            price: product.price,
            pricePerCheck: product.pricePerCheck,
            popular: PACK_DISPLAY_NAMES[product.id]?.popular || false,
          }));
          setPacks(formattedPacks);
        }
      } catch (err) {
        console.error("[paywall] Error fetching products:", err);
        setError("Failed to load pricing. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

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
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading pricing...</p>
              </div>
            ) : packs.map((pack) => (
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

          {/* Already purchased / Sign in */}
          {onShowEmailVerification && !isAuthenticated && (
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

          {/* Show signed in status */}
          {isAuthenticated && email && (
            <motion.div variants={fadeInUp} className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ✓ Signed in as <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Select a package above to purchase more credits
              </p>
            </motion.div>
          )}

          {/* Maybe Later button */}
          {onClose && (
            <motion.div variants={fadeInUp} className="mt-4">
              <button
                onClick={onClose}
                className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Maybe Later
              </button>
            </motion.div>
          )}

          {/* Disclaimer */}
          <motion.div variants={fadeInUp} className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Credits never expire. Secure payment via Stripe.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
