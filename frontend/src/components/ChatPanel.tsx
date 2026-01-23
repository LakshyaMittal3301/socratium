import { useEffect, useMemo, useState } from "react";
import { Bubble, Sender } from "@ant-design/x";
import { XMarkdown } from "@ant-design/x-markdown";
import {
  Alert,
  Button,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Typography
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ChatMessageDto, ThreadDto } from "@shared/types/chat";
import type { ProviderDto } from "@shared/types/providers";
import {
  createThread,
  deleteThread,
  listMessages,
  listThreads,
  renameThread,
  sendChat
} from "../lib/chat";

type ChatPanelProps = {
  bookId: string;
  currentPage: number;
  sectionTitle: string | null;
  providerRefreshKey?: number;
};

function ChatPanel({ bookId, currentPage, sectionTitle, providerRefreshKey }: ChatPanelProps) {
  const [threads, setThreads] = useState<ThreadDto[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasActiveProvider, setHasActiveProvider] = useState(true);
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;
  const threadProviderMissing = Boolean(activeThread && !activeThread.provider_type);

  useEffect(() => {
    setThreads([]);
    setActiveThreadId(null);
    setMessages([]);
    void loadThreads();
  }, [bookId]);

  useEffect(() => {
    if (providerRefreshKey === undefined) return;
    void loadThreads();
  }, [providerRefreshKey]);

  useEffect(() => {
    void loadProviderStatus();
  }, [bookId, providerRefreshKey]);

  useEffect(() => {
    if (threads.length === 0) {
      setActiveThreadId(null);
      setMessages([]);
      return;
    }
    if (!activeThreadId || !threads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);
    listMessages(activeThreadId)
      .then((data) => {
        if (!cancelled) {
          setMessages(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeThreadId]);

  async function loadThreads() {
    setLoadingThreads(true);
    setError(null);
    try {
      const data = await listThreads(bookId);
      setThreads(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load threads");
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadProviderStatus() {
    try {
      const res = await fetch("/api/providers");
      if (!res.ok) {
        throw new Error(`Failed to load providers (${res.status})`);
      }
      const data = (await res.json()) as ProviderDto[];
      const activeProvider = data.find((provider) => provider.is_active) ?? null;
      setHasActiveProvider(Boolean(activeProvider));
      setActiveProviderId(activeProvider?.id ?? null);
    } catch {
      setHasActiveProvider(false);
      setActiveProviderId(null);
    }
  }

  async function handleCreateThread() {
    setError(null);
    try {
      const thread = await createThread(bookId);
      setThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create thread";
      setError(message);
      if (message.toLowerCase().includes("no active")) {
        setHasActiveProvider(false);
      }
    }
  }

  async function handleRenameThread() {
    if (!activeThread) return;
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setError("Title is required");
      return;
    }
    setError(null);
    try {
      const updated = await renameThread(activeThread.id, nextTitle);
      setThreads((prev) => prev.map((thread) => (thread.id === updated.id ? updated : thread)));
      setRenameOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to rename thread");
    }
  }

  async function handleDeleteThread() {
    if (!activeThread) return;
    setError(null);
    try {
      await deleteThread(activeThread.id);
      setThreads((prev) => prev.filter((thread) => thread.id !== activeThread.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete thread");
    }
  }

  async function handleSubmit(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;

    setError(null);
    setSending(true);
    setInput("");

    let threadId = activeThreadId;
    if (!threadId) {
      try {
        const thread = await createThread(bookId);
        setThreads((prev) => [thread, ...prev]);
        setActiveThreadId(thread.id);
        threadId = thread.id;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create thread";
        setError(msg);
        if (msg.toLowerCase().includes("no active")) {
          setHasActiveProvider(false);
        }
        setSending(false);
        return;
      }
    }

    const optimisticMessage: ChatMessageDto = {
      id: crypto.randomUUID(),
      thread_id: threadId,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
      meta: { page_number: currentPage, section_name: sectionTitle }
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await sendChat({
        threadId,
        pageNumber: currentPage,
        message: trimmed
      });
      setMessages((prev) => [...prev, response.message]);
      if (response.thread_update) {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === response.thread_update?.id
              ? {
                  ...thread,
                  ...(response.thread_update.title !== undefined
                    ? { title: response.thread_update.title }
                    : {}),
                  ...(response.thread_update.updated_at
                    ? { updated_at: response.thread_update.updated_at }
                    : {})
                }
              : thread
          )
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setSending(false);
    }
  }

  const bubbleRoles = useMemo(
    () => ({
      user: { placement: "end" },
      assistant: { placement: "start" }
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
                {message.meta?.context_text && (
                  <details className="chat-panel__context">
                    <summary>Page context</summary>
                    <pre>{message.meta.context_text}</pre>
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

  const providerMismatch =
    Boolean(activeThread && activeProviderId) && activeThread?.provider_id !== activeProviderId;
  const showNoProviderWarning = !hasActiveProvider && !activeThreadId;
  const inputDisabled =
    sending ||
    loadingThreads ||
    loadingMessages ||
    (!activeThreadId && !hasActiveProvider) ||
    threadProviderMissing ||
    providerMismatch;
  const inputPlaceholder = threadProviderMissing
    ? "This thread's provider is missing. Start a new thread."
    : providerMismatch
      ? "Activate the provider used by this thread to continue."
      : !activeThreadId && !hasActiveProvider
        ? "Activate an AI provider to start chatting."
        : "Ask a question about this page…";

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="chat-panel__title">
          <Typography.Title level={5} className="chat-panel__heading">
            Chat
          </Typography.Title>
          <Typography.Text type="secondary" className="chat-panel__meta">
            Page {currentPage} · {sectionTitle ?? "Unknown section"}
          </Typography.Text>
        </div>
        <div className="chat-panel__controls">
          <Select
            value={activeThreadId ?? undefined}
            placeholder={loadingThreads ? "Loading threads…" : "Select thread"}
            options={threads.map((thread) => {
              const label = thread.title || "Untitled chat";
              return {
                value: thread.id,
                label: <span title={label}>{label}</span>
              };
            })}
            onChange={(value) => setActiveThreadId(value)}
            size="middle"
            disabled={loadingThreads || threads.length === 0}
            className="chat-panel__thread-select"
          />
          <Space size="small">
            <Button icon={<PlusOutlined />} onClick={handleCreateThread} disabled={!hasActiveProvider}>
              New
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                if (!activeThread) return;
                setRenameValue(activeThread.title ?? "");
                setRenameOpen(true);
              }}
              disabled={!activeThread}
            />
            <Popconfirm
              title="Delete this thread?"
              description="This will remove all messages in the thread."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={handleDeleteThread}
              disabled={!activeThread}
            >
              <Button icon={<DeleteOutlined />} danger disabled={!activeThread} />
            </Popconfirm>
          </Space>
        </div>
      </div>

      {showNoProviderWarning && (
        <Alert
          type="warning"
          showIcon
          message="No active provider selected. Activate one to start chatting."
        />
      )}
      {threadProviderMissing && (
        <Alert
          type="warning"
          showIcon
          message="This thread's provider was removed. Start a new thread to continue."
        />
      )}
      {providerMismatch && (
        <Alert
          type="warning"
          showIcon
          message="Active provider does not match this thread. Activate the thread's provider or start a new thread."
        />
      )}
      {error && <Alert type="error" showIcon message={error} />}

      <div className="chat-panel__list">
        {loadingMessages ? (
          <div className="chat-panel__empty">
            <Typography.Text type="secondary">Loading messages…</Typography.Text>
          </div>
        ) : bubbleItems.length === 0 ? (
          <div className="chat-panel__empty">
            <Typography.Text type="secondary">
              {activeThreadId ? "Ask a question to start." : "Create a thread to start chatting."}
            </Typography.Text>
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

      <Sender
        className="chat-panel__sender"
        value={input}
        onChange={(value) => setInput(value)}
        onSubmit={handleSubmit}
        loading={sending}
        placeholder={inputPlaceholder}
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={inputDisabled}
      />

      <Modal
        open={renameOpen}
        onCancel={() => setRenameOpen(false)}
        onOk={handleRenameThread}
        okText="Save"
        title="Rename thread"
        destroyOnClose
      >
        <Input
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          placeholder="Thread title"
        />
      </Modal>
    </div>
  );
}

export default ChatPanel;
