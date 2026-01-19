import { decrypt } from "./crypto";
import { db } from "./db";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function getProvider() {
  const row = db.prepare("SELECT * FROM provider_config LIMIT 1").get() as any;
  if (!row) return null;
  return {
    name: row.name as string,
    providerType: (row.provider_type as string) || "openai",
    baseUrl: row.base_url as string,
    apiKey: decrypt(row.api_key_enc as string),
    model: row.model as string
  };
}

function buildEndpoint(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/openai")) {
    return `${trimmed}/chat/completions`;
  }
  if (trimmed.endsWith("/v1") || trimmed.endsWith("/v1beta")) {
    return `${trimmed}/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

function buildGeminiEndpoint(baseUrl: string, model: string): string {
  let trimmed = baseUrl.replace(/\/$/, "");
  trimmed = trimmed.replace(/\/openai$/, "");
  if (trimmed.includes(":generateContent")) {
    return trimmed;
  }
  if (trimmed.includes("/models/")) {
    return `${trimmed}:generateContent`;
  }
  return `${trimmed}/models/${model}:generateContent`;
}

function toGeminiContents(messages: ChatMessage[]): { role: string; parts: { text: string }[] }[] {
  const combined = messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");
  return [{ role: "user", parts: [{ text: combined }] }];
}

export async function callChat(messages: ChatMessage[]): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error("No provider configured");
  }

  const endpoint =
    provider.providerType === "gemini"
      ? buildGeminiEndpoint(provider.baseUrl, provider.model)
      : buildEndpoint(provider.baseUrl);
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (provider.providerType === "gemini") {
    headers["x-goog-api-key"] = provider.apiKey;
  } else {
    headers.Authorization = `Bearer ${provider.apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...(provider.providerType === "gemini"
        ? { contents: toGeminiContents(messages) }
        : { model: provider.model, messages })
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Provider error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as any;
  const message =
    provider.providerType === "gemini"
      ? data?.candidates?.[0]?.content?.parts?.[0]?.text
      : data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error("Provider returned no content");
  }

  return message.trim();
}
