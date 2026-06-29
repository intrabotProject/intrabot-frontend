"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { ChatMessage, MessageFeedback } from "@/types";
import MessageBubble from "@/components/chat/MessageBubble";
import { search, submitFeedback } from "@/services/gateway";
import { ROLE_LABELS } from "@/lib/access";
import { AuthUser, getCurrentUser } from "@/lib/auth";
import {
  clearChatHistory,
  loadChatHistory,
  loadMessageFeedback,
  saveChatHistory,
  saveMessageFeedback,
} from "@/lib/chatHistory";

function genId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<Record<string, MessageFeedback>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(5);
  const [hydrated, setHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) return;

    setUser(current);
    setMessages(loadChatHistory(current.id));
    setFeedback(loadMessageFeedback(current.id));
    setInput("");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !user) return;
    saveChatHistory(user.id, messages);
  }, [messages, hydrated, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleFeedback(messageId: string, value: MessageFeedback) {
    if (!user) return;

    const assistantMsg = messages.find((msg) => msg.id === messageId);
    const msgIndex = messages.findIndex((msg) => msg.id === messageId);
    const question =
      msgIndex > 0 && messages[msgIndex - 1]?.role === "user"
        ? messages[msgIndex - 1].content
        : undefined;

    setFeedback((prev) => {
      const next = { ...prev, [messageId]: value };
      saveMessageFeedback(user.id, next);
      return next;
    });

    submitFeedback({
      message_id: messageId,
      value,
      question,
      answer: assistantMsg?.content,
    }).catch(() => {
      /* le retour local reste affiché même si l'envoi serveur échoue */
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading || !user) return;

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
      const data = await search({
        question,
        top_k: topK,
      });

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
    if (!user) return;
    setMessages([]);
    clearChatHistory(user.id);
  }

  if (!hydrated || !user) {
    return (
      <div className="chat-page">
        <p className="admin-loading">Chargement de la conversation…</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Recherche documentaire</h1>
          <p className="page-subtitle">
            Connecté en tant que{" "}
            <strong>{ROLE_LABELS[user.role]}</strong> ({user.email}) — accès
            limité à votre profil.
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
              Votre historique est sauvegardé pour ce compte dans ce navigateur.
            </p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                feedback={feedback[msg.id]}
                onFeedback={msg.role === "assistant" ? handleFeedback : undefined}
              />
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
        <div className="chat-controls">
          <div className="chat-control">
            <label htmlFor="top-k" className="top-k-label">
              Sources
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
