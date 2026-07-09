"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function LandingHero() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl text-center"
    >
      <motion.div
        variants={fadeUp}
        className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-medium text-muted backdrop-blur-sm"
      >
        <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
        Rule-based, fully explainable — no ML black box
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
      >
        Know which deploys will{" "}
        <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
          bite you
        </span>{" "}
        — before they ship
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted"
      >
        Blastradius scores every deploy 0–100 against six deterministic risk
        factors, gates the risky ones for human approval, and shows exactly
        why — before a payment-service change ships on a Friday at 5pm.
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/40"
        >
          View live dashboard
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-surface-hover"
        >
          Score a deploy live
        </Link>
      </motion.div>
    </motion.div>
  );
}
