"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopGate } from "@/components/DesktopGate";
import { VerdictHero } from "@/components/results/VerdictHero";
import { ImageGrid } from "@/components/results/ImageGrid";
import { FlagsCard } from "@/components/results/FlagsCard";
import { BottomLineCard } from "@/components/results/BottomLineCard";
import { EducationCard } from "@/components/results/EducationCard";
import { ShareButton } from "@/components/ShareButton";
import { RateLimitError } from "@/components/RateLimitError";
import { Footer } from "@/components/Footer";
import type { AnalysisResult, ErrorResult, RateLimitResult } from "@/lib/types";

// Helper function to format "time ago" from ISO timestamp
function formatTimeAgo(isoTimestamp: string): string {
  const now = new Date();
  const checked = new Date(isoTimestamp);
  const diffMs = now.getTime() - checked.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

export default function CheckPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<RateLimitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching profile...");

  useEffect(() => {
    analyzeUsername();
  }, [username]);

  const analyzeUsername = async () => {
    try {
      setLoading(true);
      setError(null);

      // Show loading messages
      const messages = [
        "Fetching profile...",
        "Analyzing images...",
        "Checking patterns...",
        "Calculating score...",
      ];

      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 3000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      clearInterval(messageInterval);

      const data = await response.json();

      // Check if rate limited
      if (data.status === "rate_limited") {
        setRateLimited(data as RateLimitResult);
        setLoading(false);
        return;
      }

      // Check for other errors
      if (!response.ok || data.status === "error") {
        setError(data.message || "Failed to analyze account");
        setLoading(false);
        return;
      }

      // Success
      setResult(data as AnalysisResult);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <DesktopGate />
        <div className="min-h-screen flex items-center justify-center px-5 bg-gray-50">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing @{username}
            </h2>
            <p className="text-gray-600">{loadingMessage}</p>
            <p className="text-sm text-gray-500 mt-4">This may take 30-60 seconds</p>
          </div>
        </div>
      </>
    );
  }

  if (rateLimited) {
    return (
      <>
        <DesktopGate />
        <RateLimitError resetsAt={rateLimited.resetsAt} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <DesktopGate />
        <div className="min-h-screen flex items-center justify-center px-5 bg-gray-50">
          <div className="w-full max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Couldn't Analyze Account
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Try Another Account
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <>
      <DesktopGate />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto px-5 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Back
            </button>
          </div>

          {/* Verdict Hero */}
          <VerdictHero
            aiLikelihood={result.aiLikelihood}
            verdict={result.verdict}
            username={result.username}
          />

          {/* Metadata: Last Checked & Cache Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Last checked: {formatTimeAgo(result.checkedAt)}
              </span>
            </div>
            {result.isCached && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                Cached
              </span>
            )}
          </div>

          {/* Image Analysis Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📸 THE IMAGES
            </h3>

            <p className="text-base text-gray-700 mb-4">
              {result.imageAnalysis.message}
            </p>

            <ImageGrid
              imageUrls={result.imageUrls}
              imagesAnalyzed={result.imageAnalysis.count}
            />
          </div>

          {/* Profile Flags */}
          {result.profileFlags.length > 0 && (
            <div className="mb-4">
              <FlagsCard
                title="THE PROFILE"
                emoji="👤"
                flags={result.profileFlags}
              />
            </div>
          )}

          {/* Consistency Flags */}
          {result.consistencyFlags.length > 0 && (
            <div className="mb-4">
              <FlagsCard
                title="THE PATTERN"
                emoji="🎯"
                flags={result.consistencyFlags}
              />
            </div>
          )}

          {/* Bottom Line */}
          <div className="mb-4">
            <BottomLineCard message={result.bottomLine} />
          </div>

          {/* Education */}
          <div className="mb-4">
            <EducationCard verdict={result.verdict} />
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-600 text-center">
              ⚠️ This is an automated analysis for entertainment purposes.
              Results are not definitive proof.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Share Button - Primary Action */}
            <ShareButton
              username={result.username}
              aiLikelihood={result.aiLikelihood}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors shadow-sm"
            />

            {/* Check Another - Secondary Action */}
            <button
              onClick={() => router.push("/")}
              className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
            >
              Check Another Account
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
