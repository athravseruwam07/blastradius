import type { Deploy } from "@/lib/types";
import { formatTimestamp, riskBarColor } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

/**
 * Presentational deploy detail: headline score plus the factor-by-factor
 * explanation returned by the scoring engine.
 */
export default function ScoreBreakdown({ deploy }: { deploy: Deploy }) {
  return (
    <div data-testid="score-breakdown" className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold">{deploy.serviceName}</h2>
          <p className="text-sm text-gray-500">
            {formatTimestamp(deploy.timestamp)} · {deploy.diffSize} lines ·{" "}
            {deploy.status}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold" data-testid="risk-score">
            {deploy.riskScore}
          </div>
          <RiskBadge level={deploy.riskLevel} />
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
        <div
          className={`h-full ${riskBarColor(deploy.riskLevel)}`}
          style={{ width: `${deploy.riskScore}%` }}
        />
      </div>

      <ul className="space-y-3">
        {deploy.breakdown.map((factor) => (
          <li
            key={factor.factor}
            data-testid="factor-row"
            className={`rounded-lg border p-3 ${
              factor.triggered
                ? "border-gray-200 bg-white"
                : "border-gray-100 bg-gray-50 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium">
                {factor.factor}
              </span>
              <span
                className={`text-sm font-semibold ${
                  factor.triggered ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {factor.triggered ? `+${factor.points}` : "0"} pts
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{factor.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
