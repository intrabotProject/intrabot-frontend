import { authHeaders } from "@/lib/auth";
import { DocumentCategory, StagingDocumentSummary } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";

async function parseError(res: Response, action: string): Promise<never> {
  const text = await res.text();
  throw new Error(`${action} failed (${res.status}): ${text}`);
}

export async function submitDocument(
  file: File,
  category: DocumentCategory = "public"
): Promise<StagingDocumentSummary> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const res = await fetch(`${BASE_URL}/user/documents/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (res.status === 401) throw new Error("Connexion requise.");
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Catégorie non autorisée pour votre profil.");
  }
  if (!res.ok) await parseError(res, "Soumission");
  return res.json();
}
