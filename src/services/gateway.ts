import { authHeaders } from "@/lib/auth";
import {
  AccessPolicyResponse,
  DocumentListItem,
  GatewayHealthResponse,
  IngestResponse,
  SearchRequest,
  SearchResponse,
  ServiceStatus,
  UsageStatsResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";

async function parseError(res: Response, action: string): Promise<never> {
  const text = await res.text();
  throw new Error(`${action} failed (${res.status}): ${text}`);
}

export async function fetchAccessPolicy(): Promise<AccessPolicyResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/access`, { cache: "no-store" });
  if (!res.ok) await parseError(res, "Access policy");
  return res.json();
}

export async function search(payload: SearchRequest): Promise<SearchResponse> {
  const body: SearchRequest = {
    question: payload.question,
    top_k: payload.top_k ?? 5,
    min_score: payload.min_score ?? 0.35,
  };
  if (payload.source_filter) {
    body.source_filter = payload.source_filter;
  }

  const res = await fetch(`${BASE_URL}/api/v1/search`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) await parseError(res, "Search");
  return res.json();
}

export async function fetchAvailableDocuments(): Promise<DocumentListItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/documents`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res, "Documents");
  return res.json();
}

export async function submitFeedback(payload: {
  message_id: string;
  value: "up" | "down";
  question?: string;
  answer?: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/feedback`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res, "Feedback");
}

export async function fetchUsageStats(): Promise<UsageStatsResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/stats/usage`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await parseError(res, "Usage stats");
  return res.json();
}

export async function triggerIngestion(): Promise<IngestResponse> {
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) await parseError(res, "Ingestion");
  return res.json();
}

export async function checkServicesHealth(): Promise<ServiceStatus> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
    const body = await res.json();
    const data: GatewayHealthResponse = res.ok ? body : body.detail;

    return {
      ingestion: data?.ingestion === "ok" ? "ok" : "error",
      search: data?.search === "ok" ? "ok" : "error",
    };
  } catch {
    return { ingestion: "error", search: "error" };
  }
}
