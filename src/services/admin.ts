import { adminHeaders } from "@/lib/auth";
import {
  AdminUserListItem,
  CollectionStats,
  DeleteDocumentResponse,
  DocumentCategory,
  DocumentSummary,
  FeedbackStatsResponse,
  UserRole,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".html",
  ".md",
  ".txt",
];

async function parseError(res: Response, action: string): Promise<never> {
  const text = await res.text();
  throw new Error(`${action} failed (${res.status}): ${text}`);
}

export function isSupportedDocument(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export async function fetchCollectionStats(): Promise<CollectionStats> {
  const res = await fetch(`${BASE_URL}/admin/collection/stats`, {
    headers: adminHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Collection stats");
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentSummary[]> {
  const res = await fetch(`${BASE_URL}/admin/documents`, {
    headers: adminHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Documents");
  return res.json();
}

export async function uploadDocument(
  file: File,
  category: DocumentCategory = "public"
): Promise<DocumentSummary> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const res = await fetch(`${BASE_URL}/admin/documents/upload`, {
    method: "POST",
    headers: adminHeaders(),
    body: formData,
  });
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Upload");
  return res.json();
}

export async function updateDocumentCategory(
  source: string,
  category: DocumentCategory
): Promise<DocumentSummary> {
  const res = await fetch(
    `${BASE_URL}/admin/documents/${encodeURIComponent(source)}/category`,
    {
      method: "PATCH",
      headers: adminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ category }),
    }
  );
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Update category");
  return res.json();
}

export async function deleteDocument(
  source: string
): Promise<DeleteDocumentResponse> {
  const res = await fetch(
    `${BASE_URL}/admin/documents/${encodeURIComponent(source)}`,
    {
      method: "DELETE",
      headers: adminHeaders({ "Content-Type": "application/json" }),
    }
  );
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Delete");
  return res.json();
}

export async function fetchUsers(): Promise<AdminUserListItem[]> {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: adminHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Users");
  return res.json();
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/admin/users/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      headers: adminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ role }),
    }
  );
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Update user role");
}

export async function fetchFeedbackStats(): Promise<FeedbackStatsResponse> {
  const res = await fetch(`${BASE_URL}/admin/feedback/stats`, {
    headers: adminHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("Accès administrateur requis.");
  if (!res.ok) await parseError(res, "Feedback stats");
  return res.json();
}
