import { GoogleGenAI } from "@google/genai";
import type {
  ChatMessage,
  ChatProvider,
  ChatProviderAdapterInput,
  NormalizedChatResponse
} from "../types";

export type GeminiChatInput = ChatProviderAdapterInput;

export async function sendGeminiChat(input: GeminiChatInput): Promise<NormalizedChatResponse> {
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const promptText = buildTextFromMessages(input.request.messages);
  const response = await ai.models.generateContent({
    model: input.model,
    contents: promptText
  });
  const text = response.text ?? "No response generated.";
  const raw =
    typeof (response as { toJSON?: () => unknown }).toJSON === "function"
      ? (response as { toJSON: () => unknown }).toJSON()
      : response;
  return { text, raw };
}

export const geminiProvider: ChatProvider = {
  type: "gemini",
  send: sendGeminiChat
};

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
