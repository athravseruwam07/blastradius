"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, RotateCcw, TrendingUp } from "lucide-react";
import DeployTable from "@/components/DeployTable";
import StatTile from "@/components/StatTile";
import { fetchDeploys } from "@/lib/api";
import type { Deploy, RiskLevel } from "@/lib/types";

const RISK_FILTERS: (RiskLevel | "ALL")[] = ["ALL", "HIGH", "MEDIUM", "LOW"];

function TableSkeleton() {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-hover" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [allDeploys, setAllDeploys] = useState<Deploy[] | null>(null);
  const [filter, setFilter] = useState<RiskLevel | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeploys()
      .then(setAllDeploys)
      .catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!allDeploys) return null;
    return filter === "ALL" ? allDeploys : allDeploys.filter((d) => d.riskLevel === filter);
  }, [allDeploys, filter]);

  const stats = useMemo(() => {
    if (!allDeploys || allDeploys.length === 0) return null;
    const avg = Math.round(
      allDeploys.reduce((sum, d) => sum + d.riskScore, 0) / allDeploys.length
    );
    const highCount = allDeploys.filter((d) => d.riskLevel === "HIGH").length;
    const rolledBack = allDeploys.filter((d) => d.status === "ROLLED_BACK").length;
    return { total: allDeploys.length, avg, highCount, rolledBack };
  }, [allDeploys]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Recent deploys
        </h1>
        <p className="mt-1 text-sm text-muted">
          Every deploy scored by the risk engine, ranked by risk.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total deploys" value={stats.total} icon={Activity} />
          <StatTile
            label="Avg risk score"
            value={stats.avg}
            icon={TrendingUp}
            accent={stats.avg >= 70 ? "text-red-500" : stats.avg >= 40 ? "text-amber-500" : "text-emerald-500"}
          />
          <StatTile
            label="High risk"
            value={stats.highCount}
            icon={AlertTriangle}
            accent="text-red-500"
          />
          <StatTile
            label="Rolled back"
            value={stats.rolledBack}
            icon={RotateCcw}
            accent="text-muted"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1 text-sm">
          {RISK_FILTERS.map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`cursor-pointer rounded-md px-3 py-1 font-medium transition-colors ${
                filter === level
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          Failed to load deploys: {error}
        </p>
      )}
      <div className="rounded-xl border border-border bg-surface p-4">
        {!error && filtered === null && <TableSkeleton />}
        {filtered !== null && <DeployTable deploys={filtered} />}
      </div>
    </div>
  );
}
