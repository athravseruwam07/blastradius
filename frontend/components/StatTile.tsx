"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import CountUp from "./CountUp";
import { fadeUp } from "@/lib/motion";

export default function StatTile({
  label,
  value,
  icon: Icon,
  accent = "text-foreground",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        <Icon className={`size-4 ${accent}`} aria-hidden="true" />
      </div>
      <CountUp
        value={value}
        className={`mt-2 block font-mono text-2xl font-semibold tabular-nums ${accent}`}
      />
    </motion.div>
  );
}
