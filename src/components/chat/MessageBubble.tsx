"use client";

import { ChatMessage, MessageFeedback as FeedbackValue } from "@/types";
import MessageFeedback from "./MessageFeedback";
import SourceList from "./SourceList";

interface Props {
  message: ChatMessage;
  feedback?: FeedbackValue;
  onFeedback?: (messageId: string, value: FeedbackValue) => void;
}

export default function MessageBubble({
  message,
  feedback,
  onFeedback,
}: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-avatar">{isUser ? "V" : "IB"}</div>
      <div className="message-body">
        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
          <p className="message-text">{message.content}</p>
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} />
        )}
        {!isUser && (
          <div className="message-meta">
            {message.latency_ms !== undefined && (
              <p className="message-latency">{message.latency_ms} ms</p>
            )}
            {onFeedback && (
              <MessageFeedback
                messageId={message.id}
                value={feedback}
                onChange={onFeedback}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
