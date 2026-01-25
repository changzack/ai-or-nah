"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseInstagramUsername } from "@/lib/username";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DesktopGate } from "@/components/DesktopGate";
import { Footer } from "@/components/Footer";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRateLimitNotice, setShowRateLimitNotice] = useState(false);

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

      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Rate Limit Notice */}
          {showRateLimitNotice && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900 mb-1">
                    Daily limit reached
                  </p>
                  <p className="text-sm text-orange-800">
                    You can still view accounts others have searched!
                    Try entering a popular username.
                  </p>
                </div>
                <button
                  onClick={() => setShowRateLimitNotice(false)}
                  className="text-orange-500 hover:text-orange-700 flex-shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              AI or Nah
            </h1>
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              Check if your IG crush is real
            </p>
            <p className="text-lg text-gray-600">
              Find out in 30 seconds
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {isSubmitting ? "Checking..." : "Check Account"}
            </Button>
          </form>

          {/* Supporting Copy */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-base text-gray-600">
              Don&apos;t get catfished.
            </p>
            <p className="text-base text-gray-600">
              Verify before you slide into DMs.
            </p>
          </div>

          {/* Example */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              <span className="font-medium">Example:</span>{" "}
              @username, instagram.com/username, or paste full URL
            </p>
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
