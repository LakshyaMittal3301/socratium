const OPENROUTER_HEADERS = {
  "HTTP-Referer": "http://localhost",
  "X-Title": "Socratium"
} as const;

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export async function createOpenRouterClient(apiKey: string) {
  const { OpenRouter } = await import("@openrouter/sdk");
  return new OpenRouter({
    apiKey,
    defaultHeaders: OPENROUTER_HEADERS
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

type OpenRouterCallModelInput = {
  apiKey: string;
  model: string;
  messages: OpenRouterChatMessage[];
  options?: Record<string, unknown>;
  stream?: boolean;
};

export async function callOpenRouterModel(
  input: OpenRouterCallModelInput
): Promise<OpenRouterModelResult> {
  const client = await createOpenRouterClient(input.apiKey);
  const responsesInput = await buildOpenRouterInput(input.messages);
  const call = await (client as unknown as { callModel: (args: unknown) => Promise<unknown> })
    .callModel({
    model: input.model,
    input: responsesInput,
    stream: input.stream ?? false,
    ...(input.options ?? {})
  });
  return call as OpenRouterModelResult;
}

async function buildOpenRouterInput(messages: OpenRouterChatMessage[]): Promise<unknown> {
  const { fromChatMessages } = (await import("@openrouter/sdk")) as {
    fromChatMessages?: (items: { role: string; content: string }[]) => unknown;
  };
  if (typeof fromChatMessages === "function") {
    return fromChatMessages(messages);
  }
  return messages;
}
