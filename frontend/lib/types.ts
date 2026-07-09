export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type DeployStatus = "PENDING" | "SHIPPED" | "ROLLED_BACK";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface FactorScore {
  factor: string;
  triggered: boolean;
  points: number;
  detail: string;
}

export interface Deploy {
  id: number;
  serviceName: string;
  timestamp: string;
  diffSize: number;
  testProdRatio: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: DeployStatus;
  breakdown: FactorScore[];
}

export interface Service {
  id: number;
  name: string;
  criticalityWeight: number;
  sensitivePathPatterns: string[];
}

export interface Incident {
  id: number;
  serviceName: string;
  timestamp: string;
  severity: Severity;
  description: string | null;
  linkedDeployId: number | null;
}

export interface ScoreRequest {
  serviceName: string;
  diffLinesChanged: number;
  prodLinesChanged: number;
  testLinesChanged: number;
  changedPaths: string[];
  timestamp?: string;
}
