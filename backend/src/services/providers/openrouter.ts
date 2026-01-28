import { callOpenRouterModel } from "../../lib/openrouter";

export type TestOpenRouterKeyInput = {
  apiKey: string;
  model: string;
};

export async function testOpenRouterKey(input: TestOpenRouterKeyInput): Promise<string> {
  const result = await callOpenRouterModel({
    apiKey: input.apiKey,
    model: input.model,
    input: [{ role: "user", content: "Reply with the single word OK." }]
  });
  const text = await result.getText();
  return text.trim() || "OK";
}
