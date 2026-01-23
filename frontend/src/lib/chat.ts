import type {
  ChatSendRequest,
  ChatSendResponse,
  MessageListResponse,
  ThreadListResponse,
  ThreadDto,
  ChatMessageDto
} from "@shared/types/chat";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data as { error?: { message?: string } })?.error?.message;
    throw new Error(message || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function listThreads(bookId: string): Promise<ThreadDto[]> {
  return requestJson<ThreadListResponse>(`/api/books/${bookId}/threads`);
}

export async function createThread(bookId: string): Promise<ThreadDto> {
  return requestJson<ThreadDto>(`/api/books/${bookId}/threads`, { method: "POST" });
}

export async function renameThread(threadId: string, title: string): Promise<ThreadDto> {
  return requestJson<ThreadDto>(`/api/threads/${threadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
}

export async function deleteThread(threadId: string): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/threads/${threadId}`, { method: "DELETE" });
}

export async function listMessages(threadId: string): Promise<ChatMessageDto[]> {
  return requestJson<MessageListResponse>(`/api/threads/${threadId}/messages`);
}

export async function sendChat(payload: ChatSendRequest): Promise<ChatSendResponse> {
  return requestJson<ChatSendResponse>("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
