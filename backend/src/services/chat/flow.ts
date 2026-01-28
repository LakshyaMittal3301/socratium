import { badRequest } from "../../lib/errors";
import { decryptSecret } from "../../lib/secrets";
import type { ProviderRecord } from "../../repositories/providers";
import type { ProviderType } from "@shared/types/providers";
import type { NormalizedChatRequest, NormalizedChatResponse } from "./types";
import { getChatProvider } from "./providers";

export async function callProvider(
  activeProvider: ProviderRecord,
  request: NormalizedChatRequest
): Promise<NormalizedChatResponse> {
  if (!isProviderType(activeProvider.provider_type)) {
    throw badRequest("Unsupported provider type");
  }
  const apiKey = decryptSecret(activeProvider.api_key_encrypted);
  const handler = getChatProvider(activeProvider.provider_type);
  if (!handler) {
    throw badRequest("Unsupported provider type");
  }
  try {
    return await handler.send({ apiKey, model: activeProvider.model, request });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Provider request failed (${activeProvider.provider_type}): ${message}`);
  }
}

function isProviderType(value: string): value is ProviderType {
  return value === "gemini" || value === "openrouter";
}
