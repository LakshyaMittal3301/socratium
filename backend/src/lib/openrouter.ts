export async function createOpenRouterClient(apiKey: string) {
  const { OpenRouter } = await import("@openrouter/sdk");
  return new OpenRouter({
    apiKey
  });
}

export type OpenRouterChatMessage = {
  role: string;
  content: string;
};

export type OpenRouterModelResult = {
  getText: () => Promise<string>;
  getResponse: () => Promise<unknown>;
};

export type OpenRouterInput = string | OpenRouterChatMessage[];

type OpenRouterCallModelInput = {
  apiKey: string;
  model: string;
  input: OpenRouterInput;
};

export async function callOpenRouterModel(
  input: OpenRouterCallModelInput
): Promise<OpenRouterModelResult> {
  const client = await createOpenRouterClient(input.apiKey);
  const call = await (client as unknown as { callModel: (args: unknown) => Promise<unknown> })
    .callModel({
    model: input.model,
    input: input.input
  });
  return call as OpenRouterModelResult;
}
