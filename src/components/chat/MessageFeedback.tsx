"use client";

import { MessageFeedback as FeedbackValue } from "@/types";

interface Props {
  messageId: string;
  value: FeedbackValue | undefined;
  onChange: (messageId: string, value: FeedbackValue) => void;
}

export default function MessageFeedback({ messageId, value, onChange }: Props) {
  return (
    <div className="message-feedback">
      <span className="message-feedback-label">Utile ?</span>
      <button
        type="button"
        className={`feedback-btn ${value === "up" ? "active" : ""}`}
        onClick={() => onChange(messageId, "up")}
        aria-label="Réponse utile"
      >
        👍
      </button>
      <button
        type="button"
        className={`feedback-btn ${value === "down" ? "active" : ""}`}
        onClick={() => onChange(messageId, "down")}
        aria-label="Réponse pas utile"
      >
        👎
      </button>
    </div>
  );
}
