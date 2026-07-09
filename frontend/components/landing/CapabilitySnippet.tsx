"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/**
 * Real excerpts copied verbatim from this repo's actual source — the weight
 * comment in CriticalityFactor.java, a real Jenkinsfile stage, a real
 * kubectl invocation from the Deploy stage, the real Deploy JSON shape.
 * Shown as code, not described with an icon and a paragraph, because the
 * code is the actual proof.
 */
const SNIPPETS = [
  {
    file: "CriticalityFactor.java",
    label: "Every weight is a comment, not a magic number",
    lines: [
      { t: "comment", c: "// WEIGHT RATIONALE: largest single factor (25 of 100)" },
      { t: "comment", c: "// because the same change is more dangerous on a" },
      { t: "comment", c: "// payment service than a marketing page." },
      { t: "code", c: "public static final int MAX_POINTS = 25;" },
    ],
  },
  {
    file: "Jenkinsfile",
    label: "Real diff stats, not typed-in numbers",
    lines: [
      { t: "code", c: "DIFF_LINES=$(git diff --shortstat $RANGE ...)" },
      { t: "code", c: "curl -X POST $BLASTRADIUS_URL/api/deploys/score \\" },
      { t: "code", c: '  -H "X-Api-Key: $API_KEY" -d @score-request.json' },
    ],
  },
  {
    file: "deploy stage",
    label: "Gates on the score it just computed",
    lines: [
      { t: "code", c: "if (env.RISK_SCORE as int) > (env.RISK_THRESHOLD as int)" },
      { t: "code", c: '  input message: "Score exceeds threshold. Approve?"' },
      { t: "code", c: "kubectl rollout status deployment/backend --timeout=180s" },
    ],
  },
  {
    file: "GET /api/deploys/{id}",
    label: "The whole record, forever, not just pass/fail",
    lines: [
      { t: "code", c: '"riskScore": 82, "riskLevel": "HIGH",' },
      { t: "code", c: '"status": "ROLLED_BACK",' },
      { t: "code", c: '"breakdown": [ { "factor": "diff_size", "points": 18 } ]' },
    ],
  },
];

export default function CapabilitySnippets() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SNIPPETS.map((s, i) => (
        <motion.div
          key={s.file}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: i * 0.06 }}
          className="overflow-hidden rounded-lg border border-black/40 bg-[#0a0e1a] shadow-lg shadow-black/20"
        >
          {/* Fixed (not theme-aware) colors throughout: this card is always
              a dark code block regardless of page theme, same reasoning as
              TerminalMockup — text-foreground etc would flip to dark-on-dark
              in light mode. */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
            <span className="font-mono text-xs text-slate-400">{s.file}</span>
          </div>
          <div className="px-4 py-3 font-mono text-xs leading-relaxed">
            {s.lines.map((line, j) => (
              <div key={j} className={line.t === "comment" ? "text-slate-500" : "text-slate-200"}>
                {line.c}
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 px-4 py-2.5 text-xs text-slate-400">
            {s.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
