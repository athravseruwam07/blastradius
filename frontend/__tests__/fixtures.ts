import type { Deploy } from "@/lib/types";

/**
 * Test fixtures mirroring the shape the backend returns. Used only to render
 * components in isolation — the real app always gets data from the API.
 */
export const highRiskDeploy: Deploy = {
  id: 1,
  serviceName: "payment-service",
  timestamp: "2026-07-10T17:30:00",
  diffSize: 900,
  testProdRatio: 0.06,
  riskScore: 83,
  riskLevel: "HIGH",
  status: "PENDING",
  breakdown: [
    {
      factor: "deploy_timing",
      triggered: true,
      points: 15,
      detail: "Friday at 15:00 or later — worst deploy window → 15 points",
    },
    {
      factor: "diff_size",
      triggered: true,
      points: 18,
      detail: "900 lines changed (1 point per 50 lines, capped at 20) → 18 points",
    },
    {
      factor: "recent_incidents",
      triggered: true,
      points: 5,
      detail: "1 incident(s) for 'payment-service' in the last 30 days → 5 points",
    },
    {
      factor: "sensitive_paths",
      triggered: true,
      points: 10,
      detail: "Touches sensitive path(s) [/payment/gateway/Charge.java] → 10 points",
    },
    {
      factor: "service_criticality",
      triggered: true,
      points: 25,
      detail: "Service 'payment-service' has criticality 10/10 → 25 points",
    },
    {
      factor: "test_ratio",
      triggered: true,
      points: 13,
      detail: "850 prod lines vs 50 test lines (ratio 0.06 < 0.5) → 13 points",
    },
  ],
};

export const lowRiskDeploy: Deploy = {
  id: 2,
  serviceName: "marketing-site",
  timestamp: "2026-07-07T10:00:00",
  diffSize: 40,
  testProdRatio: 1.0,
  riskScore: 5,
  riskLevel: "LOW",
  status: "SHIPPED",
  breakdown: [
    {
      factor: "service_criticality",
      triggered: true,
      points: 5,
      detail: "Service 'marketing-site' has criticality 2/10 → 5 points",
    },
    {
      factor: "diff_size",
      triggered: false,
      points: 0,
      detail: "40 lines changed (1 point per 50 lines, capped at 20) → 0 points",
    },
  ],
};
