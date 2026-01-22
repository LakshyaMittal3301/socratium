import { useMemo, useState } from "react";
import { Bubble, Sender } from "@ant-design/x";
import { XMarkdown } from "@ant-design/x-markdown";
import { Alert, Typography } from "antd";
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

  async function handleSubmit(message: string) {
    const trimmed = message.trim();
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

  const bubbleRoles = useMemo(
    () => ({
      user: {
        placement: "end"
      },
      assistant: {
        placement: "start"
      }
    }),
    []
  );

  const bubbleItems = useMemo(
    () =>
      messages.map((message) => {
        if (message.role === "assistant") {
          return {
            key: message.id,
            role: message.role,
            content: (
              <div className="chat-panel__message">
                <XMarkdown content={message.content} />
                {message.contextText && (
                  <details className="chat-panel__context">
                    <summary>Page context</summary>
                    <pre>{message.contextText}</pre>
                  </details>
                )}
              </div>
            )
          };
        }
        return {
          key: message.id,
          role: message.role,
          content: message.content
        };
      }),
    [messages]
  );

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <Typography.Title level={5} className="chat-panel__heading">
          Chat
        </Typography.Title>
        <Typography.Text type="secondary" className="chat-panel__meta">
          Page {currentPage} · {sectionTitle ?? "Unknown section"}
        </Typography.Text>
      </div>
      <div className="chat-panel__list">
        {bubbleItems.length === 0 ? (
          <div className="chat-panel__empty">
            <Typography.Text type="secondary">Ask a question to start.</Typography.Text>
          </div>
        ) : (
          <Bubble.List
            className="chat-panel__bubbles"
            classNames={{ scroll: "chat-panel__scroll" }}
            items={bubbleItems}
            role={bubbleRoles}
            autoScroll
          />
        )}
      </div>
      {error && <Alert type="error" showIcon message={error} />}
      <Sender
        className="chat-panel__sender"
        value={input}
        onChange={(value) => setInput(value)}
        onSubmit={handleSubmit}
        loading={sending}
        placeholder="Ask a question about this page…"
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    </div>
  );
}

export default ChatPanel;
