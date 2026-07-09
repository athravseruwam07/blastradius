"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, Server, TrendingUp } from "lucide-react";
import CountUp from "@/components/CountUp";
import { fadeUp, staggerContainer } from "@/lib/motion";

/** Real numbers pulled server-side from the live API — see app/page.tsx. */
export default function LandingStats({
  totalDeploys,
  avgRisk,
  highRiskCaught,
  servicesTracked,
}: {
  totalDeploys: number;
  avgRisk: number;
  highRiskCaught: number;
  servicesTracked: number;
}) {
  const stats = [
    { label: "Deploys scored", value: totalDeploys, icon: Activity },
    { label: "Avg risk score", value: avgRisk, icon: TrendingUp },
    { label: "High-risk caught", value: highRiskCaught, icon: AlertTriangle },
    { label: "Services tracked", value: servicesTracked, icon: Server },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {stats.map(({ label, value, icon: Icon }) => (
        <motion.div
          key={label}
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface/60 p-4 text-center backdrop-blur-sm"
        >
          <Icon className="mx-auto mb-2 size-4 text-primary" aria-hidden="true" />
          <CountUp
            value={value}
            className="block font-mono text-2xl font-bold tabular-nums text-foreground"
          />
          <div className="mt-1 text-xs text-muted">{label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
