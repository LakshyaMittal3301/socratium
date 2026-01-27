import type { ChatMessageDto } from "@shared/types/chat";

export type PromptPayloadMeta = {
  pageNumber: number;
  sectionTitle: string | null;
  excerptStatus: "available" | "missing";
};

export type PromptPayload = {
  systemPrompt: string;
  readingContext: string;
  messages: ChatMessageDto[];
  meta: PromptPayloadMeta;
};

export type BuildPromptPayloadInput = {
  systemPrompt: string;
  readingContext: string;
  messages: ChatMessageDto[];
  meta: PromptPayloadMeta;
};

export function buildPromptPayload(input: BuildPromptPayloadInput): PromptPayload {
  return {
    systemPrompt: input.systemPrompt,
    readingContext: input.readingContext,
    messages: input.messages,
    meta: input.meta
  };
}

export function buildPromptText(payload: PromptPayload): string {
  const transcript = payload.messages
    .map((message) => {
      const label = message.role === "assistant" ? "Assistant" : "User";
      return `${label}: ${message.content}`;
    })
    .join("\n");

  return [payload.systemPrompt.trim(), "", payload.readingContext.trim(), "", transcript]
    .filter(Boolean)
    .join("\n");
}
