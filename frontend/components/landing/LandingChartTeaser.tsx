"use client";

import RiskTrendChart from "@/components/RiskTrendChart";
import type { Deploy } from "@/lib/types";

/** Thin client wrapper — RiskTrendChart itself needs "use client" for Recharts. */
export default function LandingChartTeaser({ deploys }: { deploys: Deploy[] }) {
  return <RiskTrendChart deploys={deploys} minimal />;
}
