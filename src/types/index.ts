// --- Gateway (orchestrateur :8000) ---

export interface IngestResponse {
  status: "done";
  files_processed: number;
  chunks_indexed: number;
  total_in_collection: number;
}

export type DocumentCategory =
  | "public"
  | "engineering"
  | "rh"
  | "gouvernance"
  | "finance";

export type UserRole = "employee" | "engineer" | "manager" | "rh" | "admin";

export interface AccessCategoryInfo {
  id: DocumentCategory;
  label: string;
}

export interface AccessRoleInfo {
  id: UserRole;
  label: string;
  categories: DocumentCategory[];
}

export interface AccessPolicyResponse {
  roles: AccessRoleInfo[];
  categories: AccessCategoryInfo[];
}

export interface SearchRequest {
  question: string;
  top_k?: number;
  source_filter?: string | null;
  min_score?: number;
}

export interface DocumentListItem {
  source: string;
  chunk_count: number;
  status: "indexed" | "pending";
  category: DocumentCategory;
}

export interface SourceChunk {
  chunk_id: string;
  filename: string;
  excerpt: string;
  similarity_score: number;
}

export interface SearchResponse {
  answer: string;
  sources: SourceChunk[];
  excluded_by_threshold?: SourceChunk[];
  latency_ms: number;
}

export interface GatewayHealthResponse {
  status: string;
  gateway?: string;
  ingestion?: string;
  search?: string;
}

export interface DocumentSummary {
  source: string;
  chunk_count: number;
  status: "indexed" | "pending";
  category: DocumentCategory;
  file_size_bytes: number | null;
}

export interface CollectionStats {
  collection_name: string;
  document_count: number;
  chunk_count: number;
  indexed_document_count: number;
  pending_document_count: number;
}

export interface DeleteDocumentResponse {
  source: string;
  file_deleted: boolean;
  chunks_deleted: number;
}

export interface ReindexDocumentResponse {
  source: string;
  chunks_indexed: number;
  total_in_collection: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface FeedbackStatsResponse {
  total: number;
  positive: number;
  negative: number;
  recent: Array<{
    id: string;
    user_id: string;
    message_id: string;
    value: MessageFeedback;
    question: string | null;
    created_at: string;
  }>;
}

// --- UI State ---

export type MessageFeedback = "up" | "down";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  excluded_by_threshold?: SourceChunk[];
  min_score?: number;
  latency_ms?: number;
  timestamp: Date;
}

export interface ServiceStatus {
  ingestion: "ok" | "error" | "loading";
  search: "ok" | "error" | "loading";
}
