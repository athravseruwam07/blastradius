"use client";

import { motion } from "framer-motion";
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
    { label: "deploys scored", value: totalDeploys },
    { label: "avg risk score", value: avgRisk },
    { label: "high-risk caught", value: highRiskCaught },
    { label: "services tracked", value: servicesTracked },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/60 pt-6 font-mono text-sm"
    >
      {stats.map(({ label, value }) => (
        <motion.div key={label} variants={fadeUp} className="flex items-baseline gap-2">
          <CountUp value={value} className="font-semibold tabular-nums text-foreground" />
          <span className="text-muted">{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
