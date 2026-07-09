import type { LucideIcon } from "lucide-react";

export default function StatTile({
  label,
  value,
  icon: Icon,
  accent = "text-foreground",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        <Icon className={`size-4 ${accent}`} aria-hidden="true" />
      </div>
      <div className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${accent}`}>
        {value}
      </div>
    </div>
  );
}
