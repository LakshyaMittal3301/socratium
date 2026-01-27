import type { ProviderType } from "./providers";

export type ThreadDto = {
  id: string;
  book_id: string;
  title: string | null;
  provider_id: string;
  provider_name: string | null;
  provider_type: ProviderType | null;
  model: string | null;
  created_at: string;
  updated_at: string;
};

export type ThreadListResponse = ThreadDto[];

export type CreateThreadResponse = ThreadDto;

export type UpdateThreadRequest = {
  title: string;
};

export type ChatMessageDto = {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type MessageListResponse = ChatMessageDto[];

export type ThreadUpdate = {
  id: string;
  title?: string | null;
  updated_at?: string;
};

export type ChatSendRequest = {
  threadId: string;
  pageNumber: number;
  message: string;
};

export type ChatSendResponse = {
  message: ChatMessageDto;
  thread_update: ThreadUpdate | null;
};
