import type { ProviderType } from "@shared/types/providers";

export type ChatMessageRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

export type NormalizedChatRequest = {
  messages: ChatMessage[];
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

export type ChatProvider = {
  type: ProviderType;
  send: ChatProviderAdapter;
};

export type ChatStrategyInput = {
  messageText: string;
};

export type ChatContextLoader = {};
