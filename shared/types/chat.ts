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

export type ChatMessageMeta = {
  page_number?: number;
  section_name?: string | null;
  context_text?: string;
  excerpt_status?: "available" | "missing";
};

export type ChatMessageDto = {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  meta: ChatMessageMeta | null;
};

export type MessageListResponse = ChatMessageDto[];

export type ChatSendRequest = {
  threadId: string;
  pageNumber: number;
  sectionTitle: string | null;
  message: string;
};

export type ChatSendResponse = {
  message: ChatMessageDto;
  thread: ThreadDto;
};
