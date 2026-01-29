"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DesktopGate } from "@/components/DesktopGate";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function CheckoutCancelledPage() {
  const router = useRouter();

  return (
    <>
      <DesktopGate />
      <div className="min-h-screen flex items-center justify-center px-5 bg-[#FDF6E9]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md text-center"
        >
          <motion.div variants={fadeInUp}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="text-7xl mb-6"
            >
              😅
            </motion.div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            Checkout Cancelled
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-gray-600 mb-8">
            No worries! You can purchase credits anytime you need them.
          </motion.p>

          <motion.div variants={fadeInUp} className="space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-[#8B5CF6] text-white py-4 rounded-full font-bold text-lg hover:bg-[#7C3AED] transition-colors"
            >
              Back to Home
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Changed your mind? You can always purchase credits later from the paywall screen.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
