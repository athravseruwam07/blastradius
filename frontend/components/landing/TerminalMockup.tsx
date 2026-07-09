import type { Deploy } from "@/lib/types";

const RISK_TEXT: Record<Deploy["riskLevel"], string> = {
  LOW: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HIGH: "text-red-400",
};

/**
 * Real CLI-style rendering of an actual scored deploy from the live API —
 * not a mockup image, not fabricated copy. The window chrome and prompt are
 * decorative; every line of data below the `$` is a real API response.
 *
 * Colors here are fixed, not theme tokens (text-foreground/bg-surface etc)
 * — this terminal is always dark regardless of the page's light/dark theme,
 * same as a real terminal window would be. Using theme-aware classes made
 * the text invisible in light mode: text-foreground flips to near-black,
 * rendered against this deliberately-always-dark background.
 */
export default function TerminalMockup({ deploy }: { deploy: Deploy }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-black/40 bg-[#0a0e1a] text-left shadow-2xl shadow-black/40">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f56]" />
        <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="size-2.5 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-xs text-slate-400">
          POST /api/deploys/score
        </span>
      </div>
      <div className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
        <div className="text-slate-400">
          <span className="text-emerald-400">$</span> curl -X POST
          /api/deploys/score -d {"{"}"serviceName":"{deploy.serviceName}"{"}"}
        </div>
        <div className="mt-3 text-slate-200">Scoring deploy against 6 factors…</div>
        <div className="mt-2 space-y-1">
          {deploy.breakdown.map((f) => (
            <div key={f.factor} className="flex items-baseline gap-2">
              <span className={f.triggered ? "text-indigo-400" : "text-slate-600"}>
                {f.triggered ? "✓" : "·"}
              </span>
              <span className="w-40 shrink-0 text-slate-400">{f.factor}</span>
              <span
                className={`tabular-nums ${
                  f.triggered ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {f.triggered ? `+${f.points}` : "0"} pts
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-white/10 pt-3">
          <span className="text-slate-400">risk_score: </span>
          <span className={`text-lg font-bold ${RISK_TEXT[deploy.riskLevel]}`}>
            {deploy.riskScore}/100
          </span>
          <span className={`ml-2 ${RISK_TEXT[deploy.riskLevel]}`}>
            ({deploy.riskLevel})
          </span>
        </div>
      </div>
    </div>
  );
}
