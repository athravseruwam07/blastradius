"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Siren } from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import RiskTrendChart from "@/components/RiskTrendChart";
import { fetchDeploys, fetchIncidents } from "@/lib/api";
import { formatTimestamp } from "@/lib/risk";
import type { Deploy, Incident } from "@/lib/types";
import { fadeUp, staggerContainer } from "@/lib/motion";

const SEVERITY_COLOR: Record<Incident["severity"], string> = {
  LOW: "text-emerald-600 dark:text-emerald-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  HIGH: "text-red-600 dark:text-red-400",
  CRITICAL: "text-red-700 dark:text-red-300",
};

/** Per-service history: risk trend over time plus incidents and rollbacks. */
export default function ServiceHistoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const serviceName = decodeURIComponent(name);
  const [deploys, setDeploys] = useState<Deploy[] | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDeploys({ service: serviceName }),
      fetchIncidents(serviceName),
    ])
      .then(([d, i]) => {
        setDeploys(d);
        setIncidents(i);
      })
      .catch((e: Error) => setError(e.message));
  }, [serviceName]);

  const trend = deploys ? [...deploys].reverse() : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={fadeUp}>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All services
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {serviceName}
        </h1>
      </motion.div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {trend.length > 1 && (
        <motion.section
          variants={fadeUp}
          className="rounded-xl border border-border bg-surface p-6"
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
            Risk trend
          </h2>
          <RiskTrendChart deploys={trend} />
        </motion.section>
      )}

      <motion.section
        variants={fadeUp}
        className="rounded-xl border border-border bg-surface p-6"
      >
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
          Deploy history
        </h2>
        {deploys === null && !error && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        )}
        {deploys && deploys.length === 0 && (
          <p className="text-sm text-muted">No deploys for this service.</p>
        )}
        <ul className="divide-y divide-border/60">
          {deploys?.map((deploy) => (
            <li key={deploy.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-muted">
                {formatTimestamp(deploy.timestamp)} · {deploy.status.replace("_", " ")}
              </span>
              <span className="flex items-center gap-3">
                <RiskBadge level={deploy.riskLevel} score={deploy.riskScore} />
                <Link
                  href={`/deploys/${deploy.id}`}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Details
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="rounded-xl border border-border bg-surface p-6"
      >
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
          Incidents
        </h2>
        {incidents && incidents.length === 0 && (
          <p className="text-sm text-muted">No incidents recorded for this service.</p>
        )}
        <ul className="divide-y divide-border/60">
          {incidents?.map((incident) => (
            <li key={incident.id} className="py-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 font-semibold ${SEVERITY_COLOR[incident.severity]}`}>
                  <Siren className="size-3.5" aria-hidden="true" />
                  {incident.severity}
                </span>
                <span className="text-muted">{formatTimestamp(incident.timestamp)}</span>
              </div>
              {incident.description && (
                <p className="mt-1 text-muted">{incident.description}</p>
              )}
              {incident.linkedDeployId && (
                <Link
                  href={`/deploys/${incident.linkedDeployId}`}
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Linked deploy #{incident.linkedDeployId}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  );
}
