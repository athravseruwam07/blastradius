"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { fetchServices } from "@/lib/api";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tracked services
        </h1>
        <p className="mt-1 text-sm text-muted">
          Criticality weights and sensitive-path patterns per service.
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {services === null && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-hover" />
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {services?.map((service) => (
          <Link
            key={service.id}
            href={`/services/${encodeURIComponent(service.name)}`}
            className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/50 hover:bg-surface-hover"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-foreground">{service.name}</h2>
              <ChevronRight
                className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">
                Criticality{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {service.criticalityWeight}/10
                </span>
              </span>
            </div>
            {service.sensitivePathPatterns.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-amber-500" aria-hidden="true" />
                {service.sensitivePathPatterns.map((p) => (
                  <code
                    key={p}
                    className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-xs text-muted"
                  >
                    {p}
                  </code>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted">No sensitive paths configured</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
