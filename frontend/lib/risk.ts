import { AlertTriangle, AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";
import type { RiskLevel } from "./types";

interface RiskStyle {
  icon: LucideIcon;
  badge: string;
  dot: string;
  bar: string;
  ring: string;
}

const RISK_STYLES: Record<RiskLevel, RiskStyle> = {
  HIGH: {
    icon: AlertTriangle,
    badge:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
    dot: "bg-red-500",
    bar: "bg-red-500",
    ring: "ring-red-500/20",
  },
  MEDIUM: {
    icon: AlertCircle,
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  LOW: {
    icon: CheckCircle2,
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
};

export function riskStyle(level: RiskLevel): RiskStyle {
  return RISK_STYLES[level];
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
