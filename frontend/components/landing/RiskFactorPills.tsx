"use client";

import { motion } from "framer-motion";
import {
  Clock,
  FlaskConical,
  Gauge,
  GitCommitHorizontal,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const FACTORS = [
  { label: "Service criticality", icon: Gauge },
  { label: "Diff size", icon: GitCommitHorizontal },
  { label: "Test coverage ratio", icon: FlaskConical },
  { label: "Deploy timing", icon: Clock },
  { label: "Recent incidents", icon: Siren },
  { label: "Sensitive paths", icon: ShieldAlert },
];

/** The six real scoring factors, shown as proof this isn't a vague pitch. */
export default function RiskFactorPills() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="border-y border-border/60 bg-surface/40 py-6"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2.5 px-6">
        {FACTORS.map(({ label, icon: Icon }) => (
          <motion.span
            key={label}
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted"
          >
            <Icon className="size-3.5 text-primary" aria-hidden="true" />
            {label}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
