import { createOpenRouterClient } from "../../lib/openrouter";

export type TestOpenRouterKeyInput = {
  apiKey: string;
  model: string;
};

export async function testOpenRouterKey(input: TestOpenRouterKeyInput): Promise<string> {
  const client = await createOpenRouterClient(input.apiKey);
  const completion = await client.chat.send({
    model: input.model,
    messages: [
      {
        role: "user",
        content: "Reply with the single word OK."
      }
    ],
    stream: false
  });
  return completion.choices?.[0]?.message?.content ?? "OK";
}
