import { createOpenRouterClient } from "../../../lib/openrouter";
import type { PromptPayload } from "../prompt";
import { buildPromptText } from "../prompt";

export type OpenRouterChatInput = {
  apiKey: string;
  model: string;
  payload: PromptPayload;
};

export async function sendOpenRouterChat(input: OpenRouterChatInput): Promise<string> {
  const client = await createOpenRouterClient(input.apiKey);
  const promptText = buildPromptText(input.payload);
  const completion = await client.chat.send({
    model: input.model,
    messages: [
      {
        role: "user",
        content: promptText
      }
    ],
    stream: false
  });
  return completion.choices?.[0]?.message?.content ?? "No response generated.";
}
