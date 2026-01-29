"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { springTransition } from "@/lib/animations";

export function CreditBadge() {
  const { isAuthenticated, email, credits, logout, isLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleBuyMore = () => {
    // Navigate to home and trigger paywall
    window.location.href = "/";
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-[#8B5CF6] text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#7C3AED] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={springTransition}
      >
        <span>💎</span>
        <span>{credits} credit{credits === 1 ? "" : "s"}</span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
            >
              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
              </div>

              <div className="mb-3 pb-3 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Balance</p>
                <p className="text-lg font-bold text-gray-900">
                  {credits} credit{credits === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleBuyMore}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-900 transition-colors"
                >
                  💳 Buy More Credits
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
