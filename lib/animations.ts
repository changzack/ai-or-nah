import type { Variants, Transition } from "framer-motion";

// Check for reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Shared spring transition for tactile feel
export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 12,
};

// Fade in from below
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Fade in with scale
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Slam in effect (for verdict label)
export const slamIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
};

// Stagger children animation container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Fast stagger for items
export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Pop in effect for list items
export const popIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// Blur in effect for images
export const blurIn: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    scale: 1.05,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Shake animation for errors
export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// Pulse animation
export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
    },
  },
};

// Checkmark draw animation
export const checkmarkDraw: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.1 },
    },
  },
};

// Loading stage item
export const loadingStageItem: Variants = {
  pending: {
    opacity: 0.5,
    x: 0,
  },
  active: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  complete: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Button press variants
export const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.95 },
};

// Input focus glow
export const inputGlow: Variants = {
  idle: {
    boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
  },
  focus: {
    boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.1)",
  },
};

// Ripple effect
export const ripple: Variants = {
  start: {
    scale: 0,
    opacity: 0.5,
  },
  end: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Confetti trigger helper
export async function triggerConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
}) {
  if (prefersReducedMotion()) return;

  const confetti = (await import("canvas-confetti")).default;

  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
  };

  confetti({
    ...defaults,
    ...options,
  });
}

// Mini confetti for share button
export async function triggerMiniConfetti(originX: number, originY: number) {
  if (prefersReducedMotion()) return;

  const confetti = (await import("canvas-confetti")).default;

  confetti({
    particleCount: 30,
    spread: 50,
    origin: { x: originX, y: originY },
    colors: ["#FF6B6B", "#E85555", "#FF8787"],
    scalar: 0.8,
  });
}
