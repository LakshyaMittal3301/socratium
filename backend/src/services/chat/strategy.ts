import type {
  ChatContextLoader,
  ChatStrategyInput,
  NormalizedChatRequest
} from "./types";

export type {
  ChatContextLoader,
  ChatMessage,
  ChatMessageRole,
  ChatStrategyInput,
  NormalizedChatRequest,
  NormalizedChatResponse
} from "./types";

export type ChatStrategy = {
  buildRequest: (
    input: ChatStrategyInput,
    loader: ChatContextLoader
  ) => Promise<NormalizedChatRequest>;
};

export { createDefaultChatStrategy } from "./strategy/default";
