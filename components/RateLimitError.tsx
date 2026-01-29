"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RateLimitErrorProps {
  resetsAt: string; // ISO timestamp for midnight PST
  showBackButton?: boolean;
}

export function RateLimitError({ resetsAt, showBackButton = true }: RateLimitErrorProps) {
  const router = useRouter();
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const reset = new Date(resetsAt);
      const diffMs = reset.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeUntilReset("Ready to reset!");
        return;
      }

      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);

      if (hours > 0) {
        setTimeUntilReset(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilReset(`${minutes}m`);
      }
    };

    // Update immediately and then every minute
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [resetsAt]);

  return (
    <div className="min-h-screen flex items-center justify-center px-5 md:px-8 lg:px-12 bg-[#FDF6E9]">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-[#FF6B6B]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          daily limit reached
        </h2>

        {/* Main Message */}
        <p className="text-lg text-gray-700 mb-2">
          You've used your <strong>3 daily checks</strong>.
        </p>

        {/* Reset Info */}
        <p className="text-base text-gray-600 mb-6">
          Results reset at midnight PST
          {timeUntilReset && (
            <span className="block mt-1 text-[#FF6B6B] font-bold">
              Resets in {timeUntilReset}
            </span>
          )}
        </p>

        {/* Suggestion Box */}
        <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-2xl p-4 mb-6">
          <p className="text-sm text-[#1A1A1A] font-bold mb-2">
            💡 Tip
          </p>
          <p className="text-sm text-[#1A1A1A]/80">
            You can still view accounts others have already searched!
            Cached results don't count against your limit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showBackButton && (
            <>
              <button
                onClick={() => router.push("/?rate_limited=true")}
                className="w-full bg-[#FF6B6B] text-white py-4 rounded-full font-bold text-lg hover:bg-[#E85555] transition-colors"
              >
                Back to Home
              </button>

              <button
                onClick={() => router.back()}
                className="w-full bg-white text-[#1A1A1A] py-3 rounded-full font-bold text-base hover:bg-gray-50 transition-colors border-2 border-[#1A1A1A]"
              >
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
