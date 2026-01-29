"use client";

import { useRouter } from "next/navigation";
import { DesktopGate } from "@/components/DesktopGate";

export default function TermsPage() {
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
              Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                By accessing and using AI or Nah ("the Service"), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            {/* Entertainment Purposes */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Entertainment Purposes Only
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  <strong>AI or Nah is provided for entertainment purposes only.</strong> The Service analyzes
                  publicly available Instagram profiles and provides an automated assessment of the likelihood
                  that images may be AI-generated.
                </p>
                <p className="font-semibold text-gray-900">
                  ⚠️ Important Disclaimers:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Results are <strong>not definitive proof</strong> of whether an account is real or fake</li>
                  <li>This is not a professional verification service</li>
                  <li>Results should not be used for legal, financial, or other serious decisions</li>
                  <li>AI detection technology is not 100% accurate and may produce false positives or false negatives</li>
                  <li>The Service does not verify the identity of account owners</li>
                </ul>
              </div>
            </section>

            {/* No Guarantees */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. No Warranties or Guarantees
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  The Service is provided "as is" without warranties of any kind, either express or implied, including
                  but not limited to warranties of accuracy, reliability, or fitness for a particular purpose.
                </p>
                <p>
                  We do not guarantee that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Service will be uninterrupted or error-free</li>
                  <li>Results will be accurate or complete</li>
                  <li>Any errors or defects will be corrected</li>
                  <li>The Service will meet your specific requirements</li>
                </ul>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Acceptable Use
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service to harass, defame, or harm others</li>
                  <li>Attempt to circumvent rate limits or security measures</li>
                  <li>Use automated tools (bots, scrapers) to access the Service</li>
                  <li>Misrepresent results or use them for fraudulent purposes</li>
                  <li>Attempt to reverse engineer or copy the Service</li>
                  <li>Use the Service for any illegal purpose</li>
                </ul>
              </div>
            </section>

            {/* Free Tier and Credits */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Free Tier and Credits
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  <strong>Free Tier:</strong> Every user receives 3 free lifetime checks per device. Free checks are
                  tracked using browser fingerprinting and localStorage tokens. Once exhausted, you must purchase
                  credits to continue.
                </p>
                <p>
                  <strong>Credits:</strong> Credits can be purchased in packs ($2.99/5, $6.99/15, $14.99/50).
                  Each successful analysis consumes 1 credit. Credits never expire and are tied to your email address.
                </p>
                <p>
                  <strong>Deduction Policy:</strong> Credits are ONLY deducted when an analysis succeeds. Failed
                  analyses (account not found, private account, scraping errors, etc.) do not consume credits.
                </p>
              </div>
            </section>

            {/* Refund Policy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Refund Policy
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  Due to the instant, digital nature of our service, we generally do not offer refunds for credit
                  purchases. All sales are final once credits are delivered to your account.
                </p>
                <p>
                  However, we will provide refunds or credit adjustments in the following cases:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Technical errors that prevented you from using purchased credits</li>
                  <li>Duplicate charges or billing errors</li>
                  <li>Service outages that consumed credits without providing results</li>
                </ul>
                <p>
                  To request a refund or credit adjustment, contact us with your purchase details within 7 days
                  of the transaction.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Limitation of Liability
              </h2>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  To the maximum extent permitted by law, AI or Nah and its operators shall not be liable for any
                  direct, indirect, incidental, special, consequential, or punitive damages arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use or inability to use the Service</li>
                  <li>Any inaccuracies or errors in results</li>
                  <li>Decisions made based on results from the Service</li>
                  <li>Any harm or damages arising from using the Service</li>
                  <li>Unauthorized access to or use of our servers</li>
                </ul>
                <p className="font-semibold text-gray-900 mt-4">
                  You use this Service entirely at your own risk.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Third-Party Services
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                The Service uses third-party APIs and services (including Instagram scraping and AI detection services).
                We are not responsible for the availability, accuracy, or actions of these third-party services.
                Your use of the Service may also be subject to Instagram's Terms of Service.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Intellectual Property
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                All content, features, and functionality of the Service (excluding user-submitted content and
                third-party content) are owned by AI or Nah and are protected by copyright, trademark, and other
                intellectual property laws.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Changes to Terms
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective
                immediately upon posting. Your continued use of the Service after changes constitutes acceptance
                of the modified terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Termination
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend access to the Service immediately, without prior
                notice, for any reason, including violation of these Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                12. Governing Law
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States,
                without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                13. Contact
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                If you have questions about these Terms, please contact us through our website.
              </p>
            </section>

            {/* Summary Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                📋 Summary (Not Legal Advice)
              </p>
              <p className="text-sm text-orange-800 leading-relaxed">
                Use AI or Nah for fun and entertainment. Don't make serious decisions based on results.
                We're not responsible for inaccuracies or any consequences of using the Service.
                Be respectful and don't abuse the platform. That's it!
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
