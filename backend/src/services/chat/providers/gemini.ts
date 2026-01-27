import { GoogleGenAI } from "@google/genai";
import type {
  ChatMessage,
  ChatProviderAdapterInput,
  ChatRequestParams,
  NormalizedChatResponse
} from "../types";

export type GeminiChatInput = ChatProviderAdapterInput;

export async function sendGeminiChat(input: GeminiChatInput): Promise<NormalizedChatResponse> {
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const promptText =
    input.request.trace?.promptText ?? buildTextFromMessages(input.request.messages);
  const generationConfig = buildGeminiGenerationConfig(input.request.params);
  const response = await ai.models.generateContent({
    model: input.model,
    contents: promptText,
    ...(generationConfig ? { generationConfig } : {})
  });
  const text = response.text ?? "No response generated.";
  const raw =
    typeof (response as { toJSON?: () => unknown }).toJSON === "function"
      ? (response as { toJSON: () => unknown }).toJSON()
      : response;
  return { text, raw };
}

function buildTextFromMessages(messages: ChatMessage[]): string {
  if (messages.length === 0) return "";
  if (messages.length === 1) return messages[0]?.content ?? "";
  return messages
    .map((message) => {
      const label =
        message.role === "assistant" ? "Assistant" : message.role === "system" ? "System" : "User";
      return `${label}: ${message.content}`;
    })
    .join("\n");
}

function buildGeminiGenerationConfig(
  params?: ChatRequestParams
): Record<string, number> | undefined {
  if (!params) return undefined;
  const config: Record<string, number> = {};
  if (params.temperature != null) config.temperature = params.temperature;
  if (params.topP != null) config.topP = params.topP;
  if (params.topK != null) config.topK = params.topK;
  if (params.maxOutputTokens != null) config.maxOutputTokens = params.maxOutputTokens;
  if (params.presencePenalty != null) config.presencePenalty = params.presencePenalty;
  if (params.frequencyPenalty != null) config.frequencyPenalty = params.frequencyPenalty;
  return Object.keys(config).length > 0 ? config : undefined;
}
