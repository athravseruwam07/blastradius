import type { RiskLevel } from "@/lib/types";
import { riskStyle } from "@/lib/risk";

export default function RiskBadge({
  level,
  score,
}: {
  level: RiskLevel;
  score?: number;
}) {
  const { icon: Icon, badge } = riskStyle(level);
  return (
    <span
      data-testid="risk-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {level}
      {score !== undefined && (
        <span className="font-mono tabular-nums opacity-80">{score}</span>
      )}
    </span>
  );
}
