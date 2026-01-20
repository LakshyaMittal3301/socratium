import { useState } from "react";
import type { FormEvent } from "react";
import type { ChatRequest, ChatResponse } from "@shared/types/api";

type ChatPanelProps = {
  bookId: string;
  currentPage: number;
  sectionTitle: string | null;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  contextText?: string;
};

function ChatPanel({ bookId, currentPage, sectionTitle }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);
    setSending(true);
    setInput("");
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    };
    setMessages((prev) => [...prev, userMessage]);

    const body: ChatRequest = {
      bookId,
      pageNumber: currentPage,
      sectionTitle,
      message: trimmed
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Chat failed (${res.status})`);
      }
      const data = (await res.json()) as ChatResponse;
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        contextText: data.contextText
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <h2>Chat</h2>
        <p className="muted">
          Page {currentPage} · {sectionTitle ?? "Unknown section"}
        </p>
      </div>
      <div className="chat-panel__messages">
        {messages.length === 0 && <p className="muted">Ask a question to start.</p>}
        {messages.map((message) => (
          <div key={message.id} className={`chat-message chat-message--${message.role}`}>
            <p className="chat-message__role">
              {message.role === "user" ? "You" : "Socratium"}
            </p>
            <p className="chat-message__content">{message.content}</p>
            {message.contextText && (
              <details className="chat-message__context">
                <summary>Page context</summary>
                <pre>{message.contextText}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="chat-panel__form">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question about this page…"
          rows={3}
        />
        <button type="submit" disabled={sending}>
          {sending ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
