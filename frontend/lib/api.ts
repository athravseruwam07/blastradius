import type { Deploy, Incident, ScoreRequest, Service } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export function fetchDeploys(params?: {
  service?: string;
  riskLevel?: string;
}): Promise<Deploy[]> {
  const search = new URLSearchParams();
  if (params?.service) search.set("service", params.service);
  if (params?.riskLevel) search.set("riskLevel", params.riskLevel);
  const qs = search.toString();
  return request<Deploy[]>(`/api/deploys${qs ? `?${qs}` : ""}`);
}

export function fetchDeploy(id: string | number): Promise<Deploy> {
  return request<Deploy>(`/api/deploys/${id}`);
}

export function fetchServices(): Promise<Service[]> {
  return request<Service[]>("/api/services");
}

export function fetchIncidents(service: string): Promise<Incident[]> {
  return request<Incident[]>(
    `/api/incidents?service=${encodeURIComponent(service)}`
  );
}

export function scoreDeploy(body: ScoreRequest): Promise<Deploy> {
  return request<Deploy>("/api/deploys/score", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
