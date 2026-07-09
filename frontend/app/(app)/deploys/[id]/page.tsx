"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { fetchDeploy } from "@/lib/api";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion";
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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Link>
      </motion.div>
      <motion.h1
        variants={fadeUp}
        className="text-2xl font-semibold tracking-tight text-foreground"
      >
        Deploy #{id}
      </motion.h1>
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
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-border bg-surface p-6"
        >
          <ScoreBreakdown deploy={deploy} />
        </motion.div>
      )}
    </motion.div>
  );
}
