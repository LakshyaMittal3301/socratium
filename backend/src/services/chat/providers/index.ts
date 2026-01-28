import type { ProviderType } from "@shared/types/providers";
import type { ChatProvider } from "../types";
import { openrouterProvider } from "./openrouter";

export function getChatProvider(type: ProviderType): ChatProvider | null {
  return type === "openrouter" ? openrouterProvider : null;
}
