import type { ProviderType } from "@shared/types/providers";
import type { ChatProvider } from "../types";
import { geminiProvider } from "./gemini";
import { openrouterProvider } from "./openrouter";

const PROVIDERS: ChatProvider[] = [geminiProvider, openrouterProvider];

export function getChatProvider(type: ProviderType): ChatProvider | null {
  return PROVIDERS.find((provider) => provider.type === type) ?? null;
}
