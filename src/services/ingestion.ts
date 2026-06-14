import { IngestResponse, HealthResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_INGESTION_URL ?? "http://localhost:8001";

export async function triggerIngestion(): Promise<IngestResponse> {
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ingestion failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function checkIngestionHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Ingestion service unreachable");
  return res.json();
}
