import { callOpenRouterModel } from "../../../lib/openrouter";
import type {
  ChatProvider,
  ChatProviderAdapterInput,
  NormalizedChatResponse
} from "../types";

export type OpenRouterChatInput = ChatProviderAdapterInput;

export async function sendOpenRouterChat(
  input: OpenRouterChatInput
): Promise<NormalizedChatResponse> {
  const result = await callOpenRouterModel({
    apiKey: input.apiKey,
    model: input.model,
    messages: input.request.messages
  });
  const text = (await result.getText()).trim() || "No response generated.";
  const raw = await result.getResponse();
  return { text, raw };
}

export const openrouterProvider: ChatProvider = {
  type: "openrouter",
  send: sendOpenRouterChat
};
