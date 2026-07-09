import type { Variants } from "framer-motion";

// Shared timing so every entrance animation in the app feels like the same
// system rather than ad-hoc per-component durations.
export const EASE = [0.16, 1, 0.3, 1] as const; // expo-out — premium, decisive settle

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
};
