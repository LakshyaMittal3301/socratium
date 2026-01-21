import { GoogleGenAI } from "@google/genai";

export type TestGeminiKeyInput = {
  apiKey: string;
  model: string;
};

export async function testGeminiKey(input: TestGeminiKeyInput): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const response = await ai.models.generateContent({
    model: input.model,
    contents: "Reply with the single word OK."
  });
  return response.text ?? "OK";
}
