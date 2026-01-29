"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DesktopGate } from "@/components/DesktopGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    track('Viewed About');
  }, []);

  return (
    <>
      <DesktopGate />
      <Header showAuth={false} />

      <div className="min-h-screen bg-gray-50 py-12 md:py-16 lg:py-20 px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl lg:max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              About AI or Nah
            </h1>
            <p className="text-gray-600">
              The truth about that IG account you're crushing on
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* What is AI or Nah */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                What is AI or Nah?
              </h2>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                AI or Nah is a free tool that helps you verify whether Instagram accounts feature real people or AI-generated models. Using advanced AI detection technology, we analyze profile photos and post images to detect telltale signs of artificial generation.
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                In a world where AI-generated influencers are increasingly common, AI or Nah gives you clarity about who you're actually following and interacting with online.
              </p>
            </div>

            {/* Why We Built This */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Why We Built This
              </h2>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                The rise of AI-generated Instagram accounts has created a new challenge: distinguishing between real people and sophisticated fake profiles. These accounts often use AI-generated images that look remarkably realistic, making it difficult to spot the difference.
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                We created AI or Nah to help people protect themselves from deceptive accounts, particularly in contexts like OnlyFans scams, catfishing, and other fraudulent schemes that exploit AI-generated personas.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                How It Works
              </h2>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                Our analysis process involves several steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-base text-gray-700 leading-relaxed mb-3">
                <li><strong>Profile Retrieval:</strong> We fetch public information from the Instagram account</li>
                <li><strong>Image Analysis:</strong> We analyze profile photos and recent posts using AI detection models</li>
                <li><strong>Pattern Detection:</strong> We look for common characteristics of AI-generated images</li>
                <li><strong>Profile Assessment:</strong> We examine engagement patterns and profile metadata</li>
                <li><strong>Verdict Generation:</strong> We combine all signals to produce a confidence score</li>
              </ol>
              <p className="text-base text-gray-700 leading-relaxed">
                The entire process takes just a few seconds and provides you with a detailed breakdown of our findings.
              </p>
            </div>

            {/* Important Disclaimers */}
            <div className="bg-[#FF6B6B]/10 rounded-xl p-6 border-2 border-[#FF6B6B]/30">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                ⚠️ Important Disclaimers
              </h2>
              <ul className="space-y-2 text-base text-gray-700 leading-relaxed">
                <li>
                  <strong>Not Definitive Proof:</strong> Our analysis provides probabilistic assessments for informational purposes only. Results are not definitive proof of AI generation or authenticity.
                </li>
                <li>
                  <strong>Entertainment Purpose:</strong> This tool should be used for entertainment and informational purposes. Do not use results to make serious decisions about individuals or accounts.
                </li>
                <li>
                  <strong>False Positives/Negatives:</strong> Like all AI detection systems, our tool can produce false positives (real people flagged as AI) and false negatives (AI flagged as real). Factors like heavy filters, professional photography, or unusual lighting can affect accuracy.
                </li>
                <li>
                  <strong>Not Affiliated:</strong> AI or Nah is not affiliated with, endorsed by, or connected to Instagram, Meta Platforms, Inc., or any Instagram accounts analyzed through our service.
                </li>
                <li>
                  <strong>No Guarantee:</strong> We make no guarantees about the accuracy, completeness, or reliability of our analysis results.
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-[#8B5CF6]/10 rounded-xl p-6 text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Questions or Feedback?
              </h2>
              <p className="text-gray-700 mb-3">
                We'd love to hear from you. Whether you have questions, feedback, or need support, reach out to us.
              </p>
              <a
                href="mailto:zack@aiornah.xyz"
                className="inline-block text-[#8B5CF6] hover:text-[#7C3AED] font-medium underline"
              >
                zack@aiornah.xyz
              </a>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
