import type { BookMetaResponse, PageTextResponse } from "@shared/types/api";
import type { ProviderType } from "@shared/types/providers";
import type { PromptPayload } from "./prompt";

export type ChatMessageRole = "system" | "user" | "assistant" | "developer";

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

export type ChatProviderContext = {
  id: string;
  type: ProviderType;
  model: string | null;
  name?: string | null;
};

export type ChatRequestParams = {
  temperature?: number | null;
  topP?: number | null;
  topK?: number | null;
  maxOutputTokens?: number | null;
  presencePenalty?: number | null;
  frequencyPenalty?: number | null;
};

export type ChatRequestMeta = {
  pageNumber?: number;
  sectionTitle?: string | null;
  excerptStatus?: "available" | "missing";
};

export type ChatPromptTrace = {
  promptText?: string;
  promptPayload?: PromptPayload;
  readingContext?: string;
  contextText?: string;
  excerptStatus?: "available" | "missing";
};

export type NormalizedChatRequest = {
  messages: ChatMessage[];
  params?: ChatRequestParams;
  meta?: ChatRequestMeta;
  trace?: ChatPromptTrace;
};

export type NormalizedChatResponse = {
  text: string;
  raw?: unknown;
};

export type ChatProviderAdapterInput = {
  apiKey: string;
  model: string;
  request: NormalizedChatRequest;
};

export type ChatProviderAdapter = (
  input: ChatProviderAdapterInput
) => Promise<NormalizedChatResponse>;

export type ChatStrategyInput = {
  threadId: string;
  bookId: string;
  pageNumber: number;
  messageText: string;
  provider: ChatProviderContext;
};

export type ChatContextLoader = {
  getRecentMessages: (
    threadId: string,
    limit: number
  ) => ChatMessage[] | Promise<ChatMessage[]>;
  getBookMeta: (bookId: string) => BookMetaResponse | Promise<BookMetaResponse>;
  getSectionTitle: (
    bookId: string,
    pageNumber: number
  ) => string | null | Promise<string | null>;
  getPageText: (
    bookId: string,
    pageNumber: number
  ) => PageTextResponse | null | Promise<PageTextResponse | null>;
};
