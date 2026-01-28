import { badRequest } from "../../lib/errors";
import { decryptSecret } from "../../lib/secrets";
import { callOpenRouterModel } from "../../lib/openrouter";
import type { ProviderRecord } from "../../repositories/providers";
import type { ProviderType } from "@shared/types/providers";
import type { NormalizedChatRequest, NormalizedChatResponse } from "./types";

export async function callProvider(
  activeProvider: ProviderRecord,
  request: NormalizedChatRequest
): Promise<NormalizedChatResponse> {
  if (!isProviderType(activeProvider.provider_type)) {
    throw badRequest("Unsupported provider type");
  }
  const apiKey = decryptSecret(activeProvider.api_key_encrypted);
  try {
    const result = await callOpenRouterModel({
      apiKey,
      model: activeProvider.model,
      input: request.messages
    });
    const text = (await result.getText()).trim() || "No response generated.";
    const raw = await result.getResponse();
    return { text, raw };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Provider request failed (${activeProvider.provider_type}): ${message}`);
  }
}

function isProviderType(value: string): value is ProviderType {
  return value === "openrouter";
}
