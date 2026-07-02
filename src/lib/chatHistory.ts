import { ChatMessage, MessageFeedback } from "@/types";

const HISTORY_PREFIX = "intrabot_chat_history";
const FEEDBACK_PREFIX = "intrabot_chat_feedback";

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatMessage["sources"];
  excluded_by_threshold?: ChatMessage["excluded_by_threshold"];
  min_score?: number;
  latency_ms?: number;
  timestamp: string;
}

function historyKey(userId: string): string {
  return `${HISTORY_PREFIX}_${userId}`;
}

function feedbackKey(userId: string): string {
  return `${FEEDBACK_PREFIX}_${userId}`;
}

export function loadChatHistory(userId: string): ChatMessage[] {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const raw = localStorage.getItem(historyKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredMessage[];
    return parsed.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch {
    return [];
  }
}

export function saveChatHistory(userId: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined" || !userId) return;

  const stored: StoredMessage[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    sources: msg.sources,
    excluded_by_threshold: msg.excluded_by_threshold,
    min_score: msg.min_score,
    latency_ms: msg.latency_ms,
    timestamp: msg.timestamp.toISOString(),
  }));

  localStorage.setItem(historyKey(userId), JSON.stringify(stored));
}

export function clearChatHistory(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  localStorage.removeItem(historyKey(userId));
}

export function loadMessageFeedback(
  userId: string
): Record<string, MessageFeedback> {
  if (typeof window === "undefined" || !userId) return {};

  try {
    const raw = localStorage.getItem(feedbackKey(userId));
    return raw ? (JSON.parse(raw) as Record<string, MessageFeedback>) : {};
  } catch {
    return {};
  }
}

export function saveMessageFeedback(
  userId: string,
  feedback: Record<string, MessageFeedback>
): void {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(feedbackKey(userId), JSON.stringify(feedback));
}
