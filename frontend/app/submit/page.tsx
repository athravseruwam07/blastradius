"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { fetchServices, scoreDeploy } from "@/lib/api";
import type { Deploy, Service } from "@/lib/types";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

/** Manual test-drive form: submit deploy metadata, see it scored live by the engine. */
export default function SubmitDeployPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [diffLines, setDiffLines] = useState(200);
  const [prodLines, setProdLines] = useState(150);
  const [testLines, setTestLines] = useState(50);
  const [paths, setPaths] = useState("");
  const [result, setResult] = useState<Deploy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        setServices(list);
        if (list.length > 0) setServiceName(list[0].name);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const deploy = await scoreDeploy({
        serviceName,
        diffLinesChanged: diffLines,
        prodLinesChanged: prodLines,
        testLinesChanged: testLines,
        changedPaths: paths
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
      });
      setResult(deploy);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Score a test deploy
        </h1>
        <p className="mt-1 text-sm text-muted">
          Submit deploy metadata and see it scored live by the real engine.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-surface p-6"
        >
          <label className="block text-sm">
            <span className="font-medium text-foreground">Service</span>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className={inputClass}
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} (criticality {s.criticalityWeight}/10)
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-foreground">Total lines changed</span>
            <input
              type="number"
              min={0}
              value={diffLines}
              onChange={(e) => setDiffLines(Number(e.target.value))}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium text-foreground">Prod lines</span>
              <input
                type="number"
                min={0}
                value={prodLines}
                onChange={(e) => setProdLines(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-foreground">Test lines</span>
              <input
                type="number"
                min={0}
                value={testLines}
                onChange={(e) => setTestLines(Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>
          <p className="text-xs text-muted">
            Test coverage below half of prod changes raises the risk score.
          </p>

          <label className="block text-sm">
            <span className="font-medium text-foreground">Changed paths (one per line)</span>
            <textarea
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              rows={4}
              placeholder="/payment/gateway/Charge.java"
              className={`${inputClass} font-mono text-xs`}
            />
            <span className="mt-1 block text-xs text-muted">
              Paths matching a service&apos;s sensitive-path patterns add risk points.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !serviceName}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Scoring…
              </>
            ) : (
              <>
                <Sparkles className="size-4" aria-hidden="true" />
                Score deploy
              </>
            )}
          </button>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </p>
          )}
        </form>

        <div>
          {result ? (
            <div className="rounded-xl border border-border bg-surface p-6">
              <ScoreBreakdown deploy={result} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
              <Sparkles className="size-5 text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">
                Submit the form to see a live score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
