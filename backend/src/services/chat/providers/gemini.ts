import { GoogleGenAI } from "@google/genai";

export type GeminiChatInput = {
  apiKey: string;
  model: string;
  prompt: string;
};

export async function sendGeminiChat(input: GeminiChatInput): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const response = await ai.models.generateContent({
    model: input.model,
    contents: input.prompt
  });
  return response.text ?? "No response generated.";
}
