const OPENROUTER_HEADERS = {
  "HTTP-Referer": "http://localhost",
  "X-Title": "Socratium"
} as const;

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

import type { OpenRouterModel } from "@shared/types/providers";

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

export function normalizeOpenRouterModels(payload: unknown): OpenRouterModel[] {
  const rawList = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : [];

  const models: OpenRouterModel[] = [];
  for (const item of rawList) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === "string" ? item.id : null;
    if (!id) continue;
    const name = typeof item.name === "string" ? item.name : undefined;
    const contextLength =
      typeof item.context_length === "number" ? item.context_length : undefined;
    models.push({
      id,
      name,
      context_length: contextLength
    });
  }

  return models.sort((a, b) => a.id.localeCompare(b.id));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
