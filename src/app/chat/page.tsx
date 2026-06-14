"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { ChatMessage } from "@/types";
import MessageBubble from "@/components/chat/MessageBubble";

function genId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(5);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k: topK }),
      });

      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        latency_ms: data.latency_ms,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content:
          err instanceof Error
            ? `Erreur : ${err.message}`
            : "Une erreur inattendue s'est produite.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
  }

  return (
    <div className="chat-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Recherche documentaire</h1>
          <p className="page-subtitle">
            Posez une question en langage naturel sur la documentation interne.
          </p>
        </div>
        {messages.length > 0 && (
          <button className="btn-ghost" onClick={handleClear}>
            Effacer la conversation
          </button>
        )}
      </header>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">⌕</div>
            <p className="empty-title">Commencez par poser une question</p>
            <p className="empty-sub">
              Exemples : « Quelle est la politique de télétravail ? » ou
              « Comment configurer le pipeline CI/CD ? »
            </p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="message-row assistant">
                <div className="message-avatar">IB</div>
                <div className="message-body">
                  <div className="message-bubble assistant loading-bubble">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <div className="top-k-control">
          <label htmlFor="top-k" className="top-k-label">
            Sources à consulter
          </label>
          <select
            id="top-k"
            className="top-k-select"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
          >
            {[3, 5, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <input
            className="chat-input"
            type="text"
            placeholder="Posez votre question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
            maxLength={2000}
          />
          <button
            className="btn-send"
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Envoyer"
          >
            {loading ? "…" : "→"}
          </button>
        </form>
      </div>
    </div>
  );
}
