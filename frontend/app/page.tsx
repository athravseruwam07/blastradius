import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AmbientGlow from "@/components/AmbientGlow";
import Logo from "@/components/Logo";
import LandingHero from "@/components/landing/LandingHero";
import LandingStats from "@/components/landing/LandingStats";
import LandingChartTeaser from "@/components/landing/LandingChartTeaser";
import TerminalMockup from "@/components/landing/TerminalMockup";
import CapabilitySnippets from "@/components/landing/CapabilitySnippet";
import type { Deploy, Service } from "@/lib/types";

// force-dynamic: this page fetches live data on every request. Without it,
// Next tries to prerender "/" at build time — and a build running outside
// docker (no "backend" hostname to resolve) hangs on that fetch instead of
// failing fast, since fetch() has no default timeout.
export const dynamic = "force-dynamic";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL ?? "http://backend:8080";

async function getLandingData(): Promise<{ deploys: Deploy[]; services: Service[] }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const [deploysRes, servicesRes] = await Promise.all([
      fetch(`${BACKEND_INTERNAL_URL}/api/deploys`, { cache: "no-store", signal: controller.signal }),
      fetch(`${BACKEND_INTERNAL_URL}/api/services`, { cache: "no-store", signal: controller.signal }),
    ]);
    clearTimeout(timeout);
    if (!deploysRes.ok || !servicesRes.ok) return { deploys: [], services: [] };
    return { deploys: await deploysRes.json(), services: await servicesRes.json() };
  } catch {
    return { deploys: [], services: [] };
  }
}

export default async function LandingPage() {
  const { deploys, services } = await getLandingData();

  const totalDeploys = deploys.length;
  const avgRisk = totalDeploys
    ? Math.round(deploys.reduce((sum, d) => sum + d.riskScore, 0) / totalDeploys)
    : 0;
  const highRiskCaught = deploys.filter((d) => d.riskLevel === "HIGH").length;
  const servicesTracked = services.length;

  const trend = [...deploys].reverse().slice(-14);
  // Prefer a deploy with a non-trivial breakdown for the hero mockup — most
  // recent HIGH/MEDIUM one, falling back to whatever exists.
  const mockupDeploy =
    deploys.find((d) => d.riskLevel !== "LOW") ?? deploys[0] ?? null;

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Logo className="size-5" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Blastradius
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/services"
              className="hidden text-sm text-muted hover:text-foreground sm:block"
            >
              Services
            </Link>
            <Link
              href="/submit"
              className="hidden text-sm text-muted hover:text-foreground sm:block"
            >
              Score a deploy
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Dashboard
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 py-20 sm:py-28">
          <AmbientGlow />
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <LandingHero />
              <LandingStats
                totalDeploys={totalDeploys}
                avgRisk={avgRisk}
                highRiskCaught={highRiskCaught}
                servicesTracked={servicesTracked}
              />
            </div>
            {mockupDeploy && (
              <div className="lg:pl-4">
                <TerminalMockup deploy={mockupDeploy} />
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-border/60 px-6 py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Every claim above, in the actual source
            </h2>
            <p className="mt-2 text-muted">
              Real excerpts from this repository — not paraphrased, not
              illustrated with icons.
            </p>
          </div>
          <CapabilitySnippets />
        </section>

        {trend.length > 1 && (
          <section className="mx-auto max-w-6xl border-t border-border/60 px-6 py-20">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Live risk trend
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Real scores from real deploys, most recent {trend.length} shown.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View full dashboard
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-surface/60 p-6">
              <LandingChartTeaser deploys={trend} />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-4xl border-t border-border/60 px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Stop finding out about risky deploys after they ship.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Wire it into your pipeline, or just try it by hand first.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Score a deploy live
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
            >
              Browse the dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Logo className="size-4" />
            <span>Blastradius — deployment risk scoring, explained.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/services" className="hover:text-foreground">
              Services
            </Link>
            <Link href="/submit" className="hover:text-foreground">
              Score a deploy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
