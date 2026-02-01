"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { springTransition } from "@/lib/animations";
import { useHaptic } from "@/hooks/useHaptic";

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "disabled"> {
  variant?: "primary" | "secondary" | "purple";
  size?: "default" | "large";
  fullWidth?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  size = "default",
  fullWidth = false,
  children,
  className = "",
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const haptic = useHaptic();

  const baseClasses =
    "inline-flex items-center justify-center font-bold rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-[#FF6B6B] hover:bg-[#E85555] active:bg-[#D14444] text-white shadow-sm shadow-[#FF6B6B]/20",
    secondary:
      "bg-transparent border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white active:bg-[#000000] text-[#1A1A1A]",
    purple:
      "bg-[#8B5CF6] hover:bg-[#7C3AED] active:bg-[#6D28D9] text-white shadow-sm shadow-[#8B5CF6]/20",
  };

  const sizeClasses = {
    default: "h-12 px-8 text-base",
    large: "h-14 px-10 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      haptic.light();
      onClick?.(e);
    }
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={springTransition}
      {...props}
    >
      {children}
    </motion.button>
  );
}
