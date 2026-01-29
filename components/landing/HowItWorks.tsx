"use client";

import { motion } from "framer-motion";

const steps = [
  {
    icon: "🔍",
    title: "Profile Analysis",
    description: "We scan posts, bio, and engagement patterns",
  },
  {
    icon: "🤖",
    title: "AI Detection",
    description: "Each image is checked for AI-generated signs",
  },
  {
    icon: "📊",
    title: "Your Verdict",
    description: "Get a clear score with detailed breakdown",
  },
];

export function HowItWorks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mt-12 mb-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl mb-2">{step.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
