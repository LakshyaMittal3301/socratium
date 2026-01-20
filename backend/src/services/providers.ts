import crypto from "crypto";
import { nowIso } from "../lib/time";
import { encryptSecret } from "../lib/secrets";
import { badRequest, notFound } from "../lib/errors";
import type { ProvidersRepository, ProviderRecord } from "../repositories/providers";
import type { ProviderDto, ProviderType } from "@shared/types/api";

export type CreateProviderInput = {
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
  testKey: (input: { model: string; apiKey: string }) => Promise<string>;
};

const PROVIDER_TYPE: ProviderType = "gemini";

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
        provider_type: PROVIDER_TYPE,
        base_url: input.baseUrl ?? null,
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
    async testKey(input: { model: string; apiKey: string }): Promise<string> {
      if (!input.model.trim()) {
        throw badRequest("Model is required");
      }
      if (!input.apiKey.trim()) {
        throw badRequest("API key is required");
      }
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: input.apiKey.trim() });
      const response = await ai.models.generateContent({
        model: input.model.trim(),
        contents: "Reply with the single word OK."
      });
      return response.text ?? "OK";
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
