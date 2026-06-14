import { NextResponse } from "next/server";
import { triggerIngestion } from "@/services/ingestion";

export async function POST() {
  try {
    const result = await triggerIngestion();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
