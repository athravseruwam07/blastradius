import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AmbientGlow from "@/components/AmbientGlow";
import Logo from "@/components/Logo";
import LandingHero from "@/components/landing/LandingHero";
import LandingStats from "@/components/landing/LandingStats";
import LandingChartTeaser from "@/components/landing/LandingChartTeaser";
import FeatureCard from "@/components/landing/FeatureCard";
import RiskFactorPills from "@/components/landing/RiskFactorPills";
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

// icon is a lookup key, not a component reference — see FeatureCard for why
// (Server -> Client Component props can't carry functions).
const FEATURES = [
  {
    icon: "SlidersHorizontal" as const,
    title: "Deterministic scoring",
    description:
      "Six weighted factors, every one commented in code with the reasoning behind its weight. No black box, no ML — just rules you can read and argue with.",
  },
  {
    icon: "GitBranch" as const,
    title: "CI-native, not typed-in",
    description:
      "Jenkins and GitHub Actions pipelines compute real diff stats from real commits and post them straight to the scoring engine. No manual numbers pretending to be data.",
  },
  {
    icon: "Boxes" as const,
    title: "Kubernetes-native rollout",
    description:
      "Builds push to a real registry, kubectl rolls out the new image, and a risk gate pauses for human approval above your threshold — before it ships, not after.",
  },
  {
    icon: "ClipboardList" as const,
    title: "Full audit trail",
    description:
      "Every deploy, every factor that fired, every point it contributed, and what actually happened afterward — shipped clean or rolled back.",
  },
];

export default async function LandingPage() {
  const { deploys, services } = await getLandingData();

  const totalDeploys = deploys.length;
  const avgRisk = totalDeploys
    ? Math.round(deploys.reduce((sum, d) => sum + d.riskScore, 0) / totalDeploys)
    : 0;
  const highRiskCaught = deploys.filter((d) => d.riskLevel === "HIGH").length;
  const servicesTracked = services.length;

  const trend = [...deploys].reverse().slice(-14);

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Logo className="size-6" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Blastradius
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/services"
              className="hidden text-sm font-medium text-muted hover:text-foreground sm:block"
            >
              Services
            </Link>
            <Link
              href="/submit"
              className="hidden text-sm font-medium text-muted hover:text-foreground sm:block"
            >
              Score a deploy
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Live dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
          <AmbientGlow />
          <LandingHero />
          <LandingStats
            totalDeploys={totalDeploys}
            avgRisk={avgRisk}
            highRiskCaught={highRiskCaught}
            servicesTracked={servicesTracked}
          />
        </section>

        <RiskFactorPills />

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built like a real deploy gate, not a demo
            </h2>
            <p className="mt-3 text-muted">
              Every piece below is wired to something real — a running scoring
              engine, a real CI pipeline, a real Kubernetes cluster.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} index={i} {...feature} />
            ))}
          </div>
        </section>

        {trend.length > 1 && (
          <section className="mx-auto max-w-6xl px-6 py-20">
            <div className="rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm sm:p-10">
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
              <LandingChartTeaser deploys={trend} />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Stop finding out about risky deploys after they ship.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Wire it into your pipeline, or just try it by hand first.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Score a deploy live
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
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
