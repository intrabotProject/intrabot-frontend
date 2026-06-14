import { SearchRequest, SearchResponse, HealthResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_SEARCH_URL ?? "http://localhost:8002";

export async function search(payload: SearchRequest): Promise<SearchResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function checkSearchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Search service unreachable");
  return res.json();
}
