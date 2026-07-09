import { Check, Minus } from "lucide-react";
import type { Deploy } from "@/lib/types";
import { formatTimestamp, riskStyle } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

const STATUS_LABEL: Record<Deploy["status"], string> = {
  PENDING: "Pending",
  SHIPPED: "Shipped",
  ROLLED_BACK: "Rolled back",
};

/**
 * Presentational deploy detail: headline score plus the factor-by-factor
 * explanation returned by the scoring engine.
 */
export default function ScoreBreakdown({ deploy }: { deploy: Deploy }) {
  const { bar } = riskStyle(deploy.riskLevel);

  return (
    <div data-testid="score-breakdown" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{deploy.serviceName}</h2>
          <p className="mt-1 text-sm text-muted">
            {formatTimestamp(deploy.timestamp)} ·{" "}
            <span className="font-mono tabular-nums">{deploy.diffSize} lines</span> ·{" "}
            {STATUS_LABEL[deploy.status]}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
          <div
            className="font-mono text-5xl font-bold tabular-nums text-foreground"
            data-testid="risk-score"
          >
            {deploy.riskScore}
          </div>
          <RiskBadge level={deploy.riskLevel} />
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full rounded-full ${bar} transition-all duration-500`}
          style={{ width: `${deploy.riskScore}%` }}
        />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Score breakdown
        </h3>
        <ul className="space-y-2">
          {deploy.breakdown.map((factor) => (
            <li
              key={factor.factor}
              data-testid="factor-row"
              className={`rounded-lg border p-3 transition-colors ${
                factor.triggered
                  ? "border-border bg-surface"
                  : "border-border/50 bg-transparent opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {factor.triggered ? (
                    <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <Minus className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
                  )}
                  <span className="font-mono text-sm font-medium text-foreground">
                    {factor.factor}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
                    factor.triggered ? "text-foreground" : "text-muted"
                  }`}
                >
                  {factor.triggered ? `+${factor.points}` : "0"} pts
                </span>
              </div>
              <p className="mt-1.5 pl-6 text-sm text-muted">{factor.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
