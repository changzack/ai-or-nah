"use client";

import { useRouter } from "next/navigation";
import { DesktopGate } from "@/components/DesktopGate";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function FAQPage() {
  const router = useRouter();

  const faqs = [
    {
      question: "How does AI or Nah work?",
      answer: "We analyze Instagram accounts using AI image detection technology. Our system examines profile photos and posts to detect patterns common in AI-generated images, then combines this with profile analysis to give you a verdict.",
    },
    {
      question: "How many free checks do I get?",
      answer: "Every user gets 3 free lifetime checks per device. After that, you can purchase credit packs to continue checking accounts.",
    },
    {
      question: "What happens to my free checks if I clear my browser data?",
      answer: "Free checks are tied to your device fingerprint and a local storage token. If you clear your browser data, you may lose your free check history. Consider purchasing credits if you want a permanent account.",
    },
    {
      question: "Do I need an account to use AI or Nah?",
      answer: "No account is needed for your 3 free checks. If you purchase credits, you'll use passwordless email authentication to access them from any device.",
    },
    {
      question: "How do credits work?",
      answer: "Credits let you check Instagram accounts. Each successful analysis uses 1 credit. Credits never expire and are only deducted when an analysis succeeds.",
    },
    {
      question: "What if an analysis fails?",
      answer: "If an analysis fails (account not found, private account, etc.), you are NOT charged a credit. Credits are only deducted for successful analyses.",
    },
    {
      question: "Can I share my credits with someone else?",
      answer: "No, credits are tied to your email address and cannot be transferred.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Due to the nature of the service (instant API access), we generally don't offer refunds. However, if you experience technical issues or billing errors, contact us and we'll make it right.",
    },
    {
      question: "How accurate is the AI detection?",
      answer: "Our AI detection system is highly accurate but not perfect. Results should be used for entertainment purposes only, not as definitive proof. Many factors can influence the score.",
    },
    {
      question: "What if the result seems wrong?",
      answer: "AI detection technology can produce false positives (real people flagged as AI) and false negatives (AI flagged as real). Heavy filters, professional photography, or unusual lighting can affect results. Use the results as one data point, not absolute truth.",
    },
    {
      question: "Do you store my data?",
      answer: "We cache analysis results for 90 days to improve performance. We don't store personal information beyond your email (if you purchase credits) and device fingerprint (for free tier). See our Privacy Policy for details.",
    },
    {
      question: "Can I check private Instagram accounts?",
      answer: "No. We can only analyze public Instagram accounts. Private accounts will return an error and won't use your credit.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards via Stripe. Your payment information is processed securely by Stripe - we never see your card details.",
    },
    {
      question: "I purchased credits but don't see them. What should I do?",
      answer: "First, make sure you're signed in with the same email you used at checkout. Credits can take a few moments to appear. If you still don't see them after refreshing, the webhook might be delayed - wait a minute and refresh again.",
    },
  ];

  return (
    <>
      <DesktopGate />
      <Header showAuth={false} />

      <div className="min-h-screen bg-gray-50 py-12 md:py-16 lg:py-20 px-5 md:px-8 lg:px-12">
        <div className="max-w-3xl lg:max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Everything you need to know about AI or Nah
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {faq.question}
                </h2>
                <p className="text-base text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-8 bg-[#8B5CF6]/10 rounded-xl p-6 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-gray-700">
              We're here to help! Reach out through our contact form.
            </p>
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
