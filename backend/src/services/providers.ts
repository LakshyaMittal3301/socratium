import crypto from "crypto";
import { nowIso } from "../lib/time";
import { encryptSecret } from "../lib/secrets";
import {
  OPENROUTER_BASE_URL,
  createOpenRouterClient,
  getOpenRouterRequestHeaders
} from "../lib/openrouter";
import { badRequest, notFound } from "../lib/errors";
import type { ProvidersRepository, ProviderRecord } from "../repositories/providers";
import type { OpenRouterModel, ProviderDto, ProviderType } from "@shared/types/api";

export type CreateProviderInput = {
  providerType: ProviderType;
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string | null;
};

export type ProvidersService = {
  list: () => ProviderDto[];
  create: (input: CreateProviderInput) => ProviderDto;
  setActive: (id: string) => ProviderDto;
  remove: (id: string) => void;
  getActive: () => ProviderRecord | null;
  testKey: (input: { providerType: ProviderType; model: string; apiKey: string }) => Promise<string>;
  listOpenRouterModels: (apiKey: string) => Promise<OpenRouterModel[]>;
};

const SUPPORTED_PROVIDER_TYPES: ProviderType[] = ["gemini", "openrouter"];

export function createProvidersService(repos: {
  providers: ProvidersRepository;
}): ProvidersService {
  return {
    list(): ProviderDto[] {
      return repos.providers.list().map(toDto);
    },
    create(input: CreateProviderInput): ProviderDto {
      if (!input.name.trim()) {
        throw badRequest("Provider name is required");
      }
      if (!isSupportedProviderType(input.providerType)) {
        throw badRequest("Unsupported provider type");
      }
      if (!input.model.trim()) {
        throw badRequest("Model is required");
      }
      if (!input.apiKey.trim()) {
        throw badRequest("API key is required");
      }

      const now = nowIso();
      const record = repos.providers.insert({
        id: crypto.randomUUID(),
        name: input.name.trim(),
        provider_type: input.providerType,
        base_url:
          input.baseUrl ??
          (input.providerType === "openrouter" ? OPENROUTER_BASE_URL : null),
        model: input.model.trim(),
        api_key_encrypted: encryptSecret(input.apiKey.trim()),
        is_active: 0,
        created_at: now,
        updated_at: now
      });
      if (!repos.providers.getActive()) {
        repos.providers.setActive(record.id);
        const updated = repos.providers.getById(record.id);
        if (updated) {
          return toDto(updated);
        }
      }
      return toDto(record);
    },
    setActive(id: string): ProviderDto {
      const existing = repos.providers.getById(id);
      if (!existing) {
        throw notFound("Provider not found");
      }
      repos.providers.setActive(id);
      const updated = repos.providers.getById(id);
      if (!updated) {
        throw notFound("Provider not found");
      }
      return toDto(updated);
    },
    remove(id: string): void {
      repos.providers.remove(id);
    },
    getActive(): ProviderRecord | null {
      return repos.providers.getActive();
    },
    async testKey(input: {
      providerType: ProviderType;
      model: string;
      apiKey: string;
    }): Promise<string> {
      if (!isSupportedProviderType(input.providerType)) {
        throw badRequest("Unsupported provider type");
      }
      if (!input.model.trim()) {
        throw badRequest("Model is required");
      }
      if (!input.apiKey.trim()) {
        throw badRequest("API key is required");
      }

      if (input.providerType === "openrouter") {
        return testOpenRouter({
          apiKey: input.apiKey.trim(),
          model: input.model.trim()
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: input.apiKey.trim() });
      const response = await ai.models.generateContent({
        model: input.model.trim(),
        contents: "Reply with the single word OK."
      });
      return response.text ?? "OK";
    },
    async listOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
      if (!apiKey.trim()) {
        throw badRequest("API key is required");
      }

      const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        method: "GET",
        headers: getOpenRouterRequestHeaders(apiKey.trim())
      });
      if (!response.ok) {
        throw badRequest(`OpenRouter request failed (${response.status})`);
      }

      const payload = (await response.json()) as unknown;
      return normalizeOpenRouterModels(payload);
    }
  };
}

function toDto(record: ProviderRecord): ProviderDto {
  return {
    id: record.id,
    name: record.name,
    provider_type: record.provider_type as ProviderType,
    base_url: record.base_url ?? null,
    model: record.model,
    is_active: record.is_active === 1,
    created_at: record.created_at,
    updated_at: record.updated_at
  };
}

function isSupportedProviderType(value: string): value is ProviderType {
  return SUPPORTED_PROVIDER_TYPES.includes(value as ProviderType);
}

async function testOpenRouter(input: { apiKey: string; model: string }): Promise<string> {
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

function normalizeOpenRouterModels(payload: unknown): OpenRouterModel[] {
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
