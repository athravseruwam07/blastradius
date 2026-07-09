import { NextRequest, NextResponse } from "next/server";

// Server-side only — never sent to the browser. The API key must not be
// embedded in client bundles (which is what would happen if this proxy
// didn't exist and the frontend called the backend's write endpoint
// directly with a NEXT_PUBLIC_* secret).
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL ?? "http://backend:8080";
const API_KEY = process.env.BLASTRADIUS_API_KEY ?? "dev-local-only-change-me";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const res = await fetch(`${BACKEND_INTERNAL_URL}/api/deploys/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body,
  });
  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
