import Link from "next/link";
import { Inbox, ArrowUpRight } from "lucide-react";
import type { Deploy } from "@/lib/types";
import { formatTimestamp, riskStyle } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

const STATUS_STYLE: Record<Deploy["status"], string> = {
  PENDING: "text-muted",
  SHIPPED: "text-emerald-600 dark:text-emerald-400",
  ROLLED_BACK: "text-red-600 dark:text-red-400",
};

/**
 * Presentational dashboard table. Receives deploys already fetched, renders them
 * sorted by risk score (highest first), color-coded by risk level.
 */
export default function DeployTable({ deploys }: { deploys: Deploy[] }) {
  const sorted = [...deploys].sort((a, b) => b.riskScore - a.riskScore);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-hover">
          <Inbox className="size-5 text-muted" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No deploys recorded yet</p>
          <p className="mt-1 text-sm text-muted">
            Score your first deploy to see it appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-medium uppercase tracking-wide text-muted">
            <th className="py-2.5 pr-4 font-medium">Service</th>
            <th className="py-2.5 pr-4 font-medium">When</th>
            <th className="py-2.5 pr-4 font-medium">Diff</th>
            <th className="py-2.5 pr-4 font-medium">Risk</th>
            <th className="py-2.5 pr-4 font-medium">Status</th>
            <th className="py-2.5" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((deploy) => {
            const { bar } = riskStyle(deploy.riskLevel);
            return (
              <tr
                key={deploy.id}
                data-testid="deploy-row"
                className="group border-b border-border/60 last:border-0 hover:bg-surface-hover"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-4 w-1 shrink-0 rounded-full ${bar}`} aria-hidden="true" />
                    <span className="font-medium text-foreground">{deploy.serviceName}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted">
                  {formatTimestamp(deploy.timestamp)}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap font-mono tabular-nums text-muted">
                  {deploy.diffSize} lines
                </td>
                <td className="py-3 pr-4">
                  <RiskBadge level={deploy.riskLevel} score={deploy.riskScore} />
                </td>
                <td className={`py-3 pr-4 whitespace-nowrap text-xs font-semibold uppercase tracking-wide ${STATUS_STYLE[deploy.status]}`}>
                  {deploy.status.replace("_", " ")}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/deploys/${deploy.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary hover:underline group-hover:text-primary"
                  >
                    Details
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
