"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { fadeInUp, staggerContainer, springTransition } from "@/lib/animations";

type EmailVerificationProps = {
  onClose?: () => void;
  onSuccess?: () => void;
};

export function EmailVerification({ onClose, onSuccess }: EmailVerificationProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setStep("code");
      } else {
        if (data.retryAfter) {
          setRetryAfter(data.retryAfter);
          setError(`Please wait ${Math.ceil(data.retryAfter / 60)} minutes before requesting another code.`);
        } else {
          setError(data.message || "Failed to send code");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(email, code);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (!domain) return email;
    const masked = localPart.charAt(0) + "***" + (localPart.length > 1 ? localPart.charAt(localPart.length - 1) : "");
    return `${masked}@${domain}`;
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
        className="bg-white rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-6">
            <div className="text-5xl mb-3">✉️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === "email" ? "Sign In" : "Enter Code"}
            </h2>
            <p className="text-gray-600">
              {step === "email"
                ? "We'll send you a verification code"
                : `Code sent to ${maskEmail(email)}`}
            </p>
          </motion.div>

          {/* Email Step */}
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8B5CF6] text-white py-3 rounded-lg font-bold hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>
              </motion.form>
            )}

            {/* Code Step */}
            {step === "code" && (
              <motion.form
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyCode}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-[#8B5CF6] text-white py-3 rounded-lg font-bold hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Use a different email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Close button */}
          {onClose && (
            <motion.button
              variants={fadeInUp}
              onClick={onClose}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
