"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps {
  error?: string;
  label?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  readOnly?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    error,
    label,
    className = "",
    onFocus,
    onBlur,
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [prevError, setPrevError] = useState<string | undefined>(undefined);

  // Trigger shake when error appears
  useEffect(() => {
    if (error && error !== prevError) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 400);
      return () => clearTimeout(timer);
    }
    setPrevError(error);
  }, [error, prevError]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <motion.div
        animate={shouldShake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          animate={{
            boxShadow: isFocused
              ? error
                ? "0 0 0 4px rgba(255, 107, 107, 0.1)"
                : "0 0 0 4px rgba(96, 165, 250, 0.1)"
              : "0 0 0 0 rgba(96, 165, 250, 0)",
          }}
          transition={{ duration: 0.2 }}
          className="rounded-lg"
        >
          <input
            ref={ref}
            className={`w-full h-12 px-4 text-base bg-white border rounded-lg transition-colors ${
              error
                ? "border-[#FF6B6B] focus:border-[#E85555]"
                : "border-gray-300 focus:border-[#60A5FA]"
            } focus:outline-none ${className}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </motion.div>
      </motion.div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-sm text-[#FF6B6B]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
