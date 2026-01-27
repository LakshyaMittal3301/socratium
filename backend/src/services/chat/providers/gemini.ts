import { GoogleGenAI } from "@google/genai";
import type { PromptPayload } from "../prompt";
import { buildPromptText } from "../prompt";

export type GeminiChatInput = {
  apiKey: string;
  model: string;
  payload: PromptPayload;
};

export async function sendGeminiChat(input: GeminiChatInput): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const promptText = buildPromptText(input.payload);
  const response = await ai.models.generateContent({
    model: input.model,
    contents: promptText
  });
  return response.text ?? "No response generated.";
}
