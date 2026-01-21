import crypto from "crypto";
import { nowIso } from "../lib/time";
import { encryptSecret } from "../lib/secrets";
import {
  OPENROUTER_BASE_URL,
  getOpenRouterRequestHeaders,
  normalizeOpenRouterModels
} from "../lib/openrouter";
import { badRequest, notFound } from "../lib/errors";
import type { ProviderInsert, ProvidersRepository, ProviderRecord } from "../repositories/providers";
import type { OpenRouterModel, ProviderDto, ProviderType } from "@shared/types/providers";
import { testGeminiKey } from "./providers/gemini";
import { testOpenRouterKey } from "./providers/openrouter";

export type CreateProviderInput = {
  providerType: ProviderType;
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string | null;
};

export type TestProviderInput = {
  providerType: ProviderType;
  model: string;
  apiKey: string;
};

export type ProvidersService = {
  list: () => ProviderDto[];
  create: (input: CreateProviderInput) => ProviderDto;
  setActive: (id: string) => ProviderDto;
  remove: (id: string) => void;
  getActiveRecord: () => ProviderRecord | null;
  getActiveDto: () => ProviderDto | null;
  testKey: (input: TestProviderInput) => Promise<string>;
  listOpenRouterModels: (apiKey: string) => Promise<OpenRouterModel[]>;
};

const SUPPORTED_PROVIDER_TYPES: ProviderType[] = ["gemini", "openrouter"];
const TEST_KEY_HANDLERS: Record<
  ProviderType,
  (input: { apiKey: string; model: string }) => Promise<string>
> = {
  gemini: testGeminiKey,
  openrouter: testOpenRouterKey
};

export function createProvidersService(repos: {
  providers: ProvidersRepository;
}): ProvidersService {
  return {
    list(): ProviderDto[] {
      return repos.providers.list().map(toDto);
    },
    create(input: CreateProviderInput): ProviderDto {
      const providerType = requireSupportedProviderType(input.providerType);
      const name = requireNonEmpty(input.name, "Provider name");
      const model = requireNonEmpty(input.model, "Model");
      const apiKey = requireNonEmpty(input.apiKey, "API key");

      const now = nowIso();
      const record = repos.providers.insert(
        toProviderInsert({
          id: crypto.randomUUID(),
          name,
          providerType,
          model,
          apiKey,
          baseUrl: input.baseUrl ?? null,
          now
        })
      );
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
    getActiveRecord(): ProviderRecord | null {
      return repos.providers.getActive();
    },
    getActiveDto(): ProviderDto | null {
      const record = repos.providers.getActive();
      return record ? toDto(record) : null;
    },
    async testKey(input: TestProviderInput): Promise<string> {
      const providerType = requireSupportedProviderType(input.providerType);
      const model = requireNonEmpty(input.model, "Model");
      const apiKey = requireNonEmpty(input.apiKey, "API key");
      const handler = TEST_KEY_HANDLERS[providerType];
      return handler({ apiKey, model });
    },
    async listOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
      const resolvedKey = requireNonEmpty(apiKey, "API key");

      const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
        method: "GET",
        headers: getOpenRouterRequestHeaders(resolvedKey)
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

function requireSupportedProviderType(value: ProviderType): ProviderType {
  if (!isSupportedProviderType(value)) {
    throw badRequest("Unsupported provider type");
  }
  return value;
}

function requireNonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw badRequest(`${label} is required`);
  }
  return trimmed;
}

type ProviderInsertInput = {
  id: string;
  name: string;
  providerType: ProviderType;
  model: string;
  apiKey: string;
  baseUrl: string | null;
  now: string;
};

function toProviderInsert(input: ProviderInsertInput): ProviderInsert {
  return {
    id: input.id,
    name: input.name,
    provider_type: input.providerType,
    base_url:
      input.baseUrl ?? (input.providerType === "openrouter" ? OPENROUTER_BASE_URL : null),
    model: input.model,
    api_key_encrypted: encryptSecret(input.apiKey),
    is_active: 0,
    created_at: input.now,
    updated_at: input.now
  };
}
