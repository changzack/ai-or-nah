"use client";

import { useRouter } from "next/navigation";
import { DesktopGate } from "@/components/DesktopGate";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <>
      <DesktopGate />

      <div className="min-h-screen bg-gray-50 py-12 px-5">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium mb-6 inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">
              Last updated: January 25, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Overview
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                AI or Nah ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy
                explains what information we collect, how we use it, and your rights regarding your data.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2.1 Information You Provide
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    When you use our Service, you provide:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-base text-gray-700">
                    <li>Instagram usernames or URLs you submit for analysis</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    We do NOT collect: Names, email addresses, passwords, or any personal identification.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2.2 Automatically Collected Information
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-2">
                    We automatically collect:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-base text-gray-700">
                    <li><strong>IP Address:</strong> Used to enforce rate limits (3 checks per day)</li>
                    <li><strong>Usage Data:</strong> Timestamps of when you checked accounts</li>
                    <li><strong>Technical Data:</strong> Browser type, device type (for mobile-only enforcement)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2.3 Publicly Available Data
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    When you submit an Instagram username, we retrieve publicly available information from that
                    Instagram profile using third-party scraping services. This includes profile photos, post images,
                    captions, follower counts, and engagement metrics. We only access data that is publicly visible
                    without authentication.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. How We Use Your Information
              </h2>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                We use collected information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-base text-gray-700">
                <li>Provide and operate the Service (AI-generated image detection)</li>
                <li>Enforce rate limits (3 checks per IP per day)</li>
                <li>Cache analysis results to improve performance and reduce API costs</li>
                <li>Monitor and analyze usage patterns to improve the Service</li>
                <li>Detect and prevent abuse or violations of our Terms of Service</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Data Storage and Retention
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  <strong>Cached Results:</strong> Analysis results are stored in our database and remain accessible
                  until 90 days of inactivity (no views). After 90 days, results are automatically deleted.
                </p>
                <p>
                  <strong>Downloaded Images:</strong> We download and store analyzed Instagram images on our servers
                  to avoid hotlinking. These images are deleted when their associated analysis result expires.
                </p>
                <p>
                  <strong>Rate Limit Data:</strong> IP addresses and check counts are stored only for rate limiting
                  purposes and reset daily at midnight PST.
                </p>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Data Sharing and Third Parties
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">
                  We do NOT sell your data to third parties.
                </p>
                <p>
                  We share data only with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> We use third-party services (Apify for Instagram scraping,
                    Sightengine for AI detection, Supabase for data storage) to operate the Service. These providers
                    may access data necessary to perform their functions.
                  </li>
                  <li>
                    <strong>Public Results:</strong> Analysis results are publicly accessible via shareable URLs
                    (e.g., aiornah.ai/check/username). Anyone with the link can view results.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose information if required by law or in response
                    to valid legal requests.
                  </li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Cookies and Tracking
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                We use minimal cookies for essential functionality (session management, rate limiting). We do NOT
                use tracking cookies for advertising or analytics purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Your Rights
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> View any cached results associated with usernames you've searched</li>
                  <li><strong>Deletion:</strong> Cached results automatically expire after 90 days of inactivity</li>
                  <li><strong>Opt-Out:</strong> Simply don't use the Service if you don't agree with this policy</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  Note: Since we don't collect personal identification (no accounts/emails), we cannot identify
                  or delete data tied to specific individuals beyond IP-based rate limit data.
                </p>
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Security
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                We implement reasonable security measures to protect data from unauthorized access, alteration,
                or disclosure. However, no method of transmission over the internet is 100% secure. We cannot
                guarantee absolute security.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Children's Privacy
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                The Service is not intended for children under 13. We do not knowingly collect information from
                children under 13. If you believe we have collected such information, please contact us.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Changes to This Policy
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with
                an updated "Last updated" date. Your continued use of the Service after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Contact Us
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us through our website.
              </p>
            </section>

            {/* Summary Box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-8">
              <p className="text-sm font-semibold text-indigo-900 mb-2">
                🔒 Privacy Summary
              </p>
              <p className="text-sm text-indigo-800 leading-relaxed">
                We collect minimal data: usernames you search and your IP address (for rate limits). We don't sell
                your data. Results are public via shareable links. Data expires after 90 days of inactivity.
                That's it!
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
