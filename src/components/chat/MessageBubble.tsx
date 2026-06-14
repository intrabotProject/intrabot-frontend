import { ChatMessage } from "@/types";
import SourceList from "./SourceList";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-avatar">{isUser ? "V" : "IB"}</div>
      <div className="message-body">
        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
          <p className="message-text">{message.content}</p>
        </div>
        {!isUser && message.sources && (
          <SourceList sources={message.sources} />
        )}
        {!isUser && message.latency_ms !== undefined && (
          <p className="message-latency">{message.latency_ms} ms</p>
        )}
      </div>
    </div>
  );
}
