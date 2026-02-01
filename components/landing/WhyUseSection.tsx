"use client";

import { motion } from "framer-motion";

const benefits = [
  {
    icon: "🛡️",
    title: "Avoid Catfishing",
    description: "Don't get fooled by AI-generated fake accounts",
  },
  {
    icon: "✅",
    title: "Verify First",
    description: "Check profiles before sliding into DMs",
  },
  {
    icon: "💰",
    title: "Protect Your Wallet",
    description: "Verify before subscribing to content",
  },
];

export function WhyUseSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-10 mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Why Use AI or Nah?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
            className="text-center"
          >
            <div className="text-4xl mb-3">{benefit.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {benefit.title}
            </h3>
            <p className="text-sm text-gray-600">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
