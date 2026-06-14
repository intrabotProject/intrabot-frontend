import { NextResponse } from "next/server";
import { checkIngestionHealth } from "@/services/ingestion";
import { checkSearchHealth } from "@/services/search";

export async function GET() {
  const [ingestion, search] = await Promise.allSettled([
    checkIngestionHealth(),
    checkSearchHealth(),
  ]);

  return NextResponse.json({
    ingestion: ingestion.status === "fulfilled" ? "ok" : "error",
    search: search.status === "fulfilled" ? "ok" : "error",
  });
}
