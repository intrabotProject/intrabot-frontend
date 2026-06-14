// --- Ingestion Service (port 8001) ---

export interface IngestResponse {
  status: "done";
  files_processed: number;
  chunks_indexed: number;
  total_in_collection: number;
}

// --- Search Service (port 8002) ---

export interface SearchRequest {
  question: string;
  top_k?: number;
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
  latency_ms: number;
}

// --- Health ---

export interface HealthResponse {
  status: "ok" | "error";
}

// --- UI State ---

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  latency_ms?: number;
  timestamp: Date;
}

export interface ServiceStatus {
  ingestion: "ok" | "error" | "loading";
  search: "ok" | "error" | "loading";
}
