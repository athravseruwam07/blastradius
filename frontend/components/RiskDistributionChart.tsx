"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { Deploy, RiskLevel } from "@/lib/types";
import { riskStyle } from "@/lib/risk";

const LEVELS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];
const BAR_COLOR: Record<RiskLevel, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

function DistTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { level: RiskLevel; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { level, count } = payload[0].payload;
  const { badge } = riskStyle(level);
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-xl">
      <span className={`inline-block rounded px-1.5 py-0.5 font-medium ${badge}`}>
        {level}
      </span>
      <div className="mt-1 font-mono font-semibold text-foreground">
        {count} deploy{count === 1 ? "" : "s"}
      </div>
    </div>
  );
}

/** Real distribution of the currently-loaded deploys across risk bands. */
export default function RiskDistributionChart({ deploys }: { deploys: Deploy[] }) {
  const data = LEVELS.map((level) => ({
    level,
    count: deploys.filter((d) => d.riskLevel === level).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="level"
          tick={{ fill: "var(--color-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <Tooltip content={<DistTooltip />} cursor={{ fill: "var(--color-surface-hover)" }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700}>
          {data.map((d) => (
            <Cell key={d.level} fill={BAR_COLOR[d.level]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
