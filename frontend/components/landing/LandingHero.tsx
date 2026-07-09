"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function LandingHero() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl"
    >
      <motion.p
        variants={fadeUp}
        className="font-mono text-xs font-medium uppercase tracking-widest text-muted"
      >
        Deployment risk scoring
      </motion.p>

      <motion.h1
        variants={fadeUp}
        className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
      >
        Know which deploys will bite you — before they ship
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-5 max-w-xl text-balance text-muted">
        Six deterministic risk factors, one score, a full breakdown of why.
        Wired into CI so a payment-service change on Friday at 5pm gets
        stopped before it ships — not investigated after.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          View live dashboard
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
        >
          Score a deploy live
        </Link>
      </motion.div>
    </motion.div>
  );
}
