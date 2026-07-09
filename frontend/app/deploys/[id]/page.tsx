"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { fetchDeploy } from "@/lib/api";
import type { Deploy } from "@/lib/types";

export default function DeployDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeploy(id)
      .then(setDeploy)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Deploy #{id}
      </h1>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {!error && deploy === null && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="h-32 animate-pulse rounded-lg bg-surface-hover" />
        </div>
      )}
      {deploy && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <ScoreBreakdown deploy={deploy} />
        </div>
      )}
    </div>
  );
}
