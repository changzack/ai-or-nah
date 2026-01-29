"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DesktopGate } from "@/components/DesktopGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";

export default function ContactPage() {
  const router = useRouter();

  useEffect(() => {
    track('Viewed Contact');
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
              Contact Us
            </h1>
            <p className="text-gray-600">
              Get in touch with the AI or Nah team
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                We'd Love to Hear From You
              </h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                Have questions, feedback, or need support? Reach out to us directly via email.
              </p>
              <div className="bg-[#8B5CF6]/10 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Email us at:</p>
                <a
                  href="mailto:zack@aiornah.xyz"
                  className="text-2xl font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
                >
                  zack@aiornah.xyz
                </a>
              </div>
            </div>

            {/* What to Contact About */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                What Can We Help With?
              </h2>
              <ul className="space-y-2 text-base text-gray-700 leading-relaxed">
                <li>• General questions about AI or Nah</li>
                <li>• Technical issues or bugs</li>
                <li>• Billing and payment support</li>
                <li>• Feature requests and feedback</li>
                <li>• Partnership inquiries</li>
                <li>• Press and media inquiries</li>
              </ul>
            </div>

            {/* Response Time */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Response Time
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                We typically respond within 24-48 hours during business days. For urgent issues related to billing or account access, please mention "URGENT" in your subject line.
              </p>
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
