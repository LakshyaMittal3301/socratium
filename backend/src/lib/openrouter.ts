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

export function getOpenRouterRequestHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    ...OPENROUTER_HEADERS,
    "Content-Type": "application/json"
  };
}
