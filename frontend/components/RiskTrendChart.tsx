"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Deploy } from "@/lib/types";
import { formatShortDate, riskStyle } from "@/lib/risk";

interface Point {
  index: number;
  score: number;
  deploy: Deploy;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
}) {
  if (!active || !payload?.length) return null;
  const { deploy, score } = payload[0].payload;
  const { badge } = riskStyle(deploy.riskLevel);
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-xl">
      <div className="font-mono font-semibold text-foreground">
        {score}
        <span className="text-muted">/100</span>
      </div>
      <div className="mt-0.5 text-muted">{deploy.serviceName}</div>
      <div className={`mt-1 inline-block rounded px-1.5 py-0.5 font-medium ${badge}`}>
        {deploy.riskLevel}
      </div>
    </div>
  );
}

/**
 * Real chart (Recharts), not a decorative sparkline — used on both the
 * per-service history page and the landing page's live-data teaser, sharing
 * the exact same rendering so the teaser is never allowed to diverge from
 * what the app actually shows.
 */
export default function RiskTrendChart({
  deploys,
  minimal = false,
}: {
  deploys: Deploy[];
  /** Strip axes/grid for a decorative teaser context (landing page). */
  minimal?: boolean;
}) {
  const data: Point[] = deploys.map((deploy, index) => ({
    index,
    score: deploy.riskScore,
    deploy,
  }));

  return (
    <ResponsiveContainer width="100%" height={minimal ? 160 : 220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: minimal ? -32 : 0 }}>
        <defs>
          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {!minimal && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
        )}
        {!minimal && (
          <XAxis
            dataKey="index"
            tickFormatter={(i) => formatShortDate(data[i]?.deploy.timestamp ?? "")}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
        )}
        {!minimal && (
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
        )}
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#riskFill)"
          isAnimationActive={true}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
