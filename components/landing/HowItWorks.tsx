"use client";

import { motion } from "framer-motion";

const steps = [
  {
    icon: "🔍",
    title: "Profile Analysis",
    description: "We scan their posts, bio, and engagement patterns",
  },
  {
    icon: "🤖",
    title: "AI Detection",
    description: "Advanced AI checks each image for generated content",
  },
  {
    icon: "📊",
    title: "Detailed Verdict",
    description: "Get a clear percentage score with full breakdown",
  },
];

export function HowItWorks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        How It Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
            className="text-center"
          >
            <div className="text-4xl mb-3">{step.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
