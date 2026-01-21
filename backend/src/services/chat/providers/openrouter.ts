import { createOpenRouterClient } from "../../../lib/openrouter";

export type OpenRouterChatInput = {
  apiKey: string;
  model: string;
  prompt: string;
};

export async function sendOpenRouterChat(input: OpenRouterChatInput): Promise<string> {
  const client = await createOpenRouterClient(input.apiKey);
  const completion = await client.chat.send({
    model: input.model,
    messages: [
      {
        role: "user",
        content: input.prompt
      }
    ],
    stream: false
  });
  return completion.choices?.[0]?.message?.content ?? "No response generated.";
}
