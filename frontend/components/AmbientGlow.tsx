"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Decorative animated gradient blobs behind the hero. Pure CSS/motion,
 * pointer-events-none, aria-hidden — carries no information, purely
 * atmospheric (dark-cinematic style per the design-system pass for this
 * page). Motion collapses to a static position under prefers-reduced-motion.
 */
export default function AmbientGlow() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -top-32 left-1/4 size-[36rem] rounded-full bg-primary/25 blur-[120px]"
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 size-[28rem] rounded-full bg-violet-500/20 blur-[120px]"
        animate={
          reducedMotion
            ? undefined
            : { x: [0, -30, 20, 0], y: [0, 30, -20, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-emerald-500/10 blur-[120px]"
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 20, -30, 0], y: [0, -20, 10, 0] }
        }
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      {/* Subtle grid — classic technical-SaaS texture, very low opacity so it reads as texture, not noise. */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}
