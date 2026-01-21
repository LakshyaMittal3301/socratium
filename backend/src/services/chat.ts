import { badRequest } from "../lib/errors";
import { decryptSecret } from "../lib/secrets";
import type { BooksService } from "./books";
import type { ProvidersService } from "./providers";
import type { ChatRequest, ChatResponse } from "@shared/types/api";
import type { ProviderType } from "@shared/types/providers";
import { collectPageContext } from "./chat/context";
import { buildPrompt } from "./chat/prompt";
import { sendGeminiChat } from "./chat/providers/gemini";
import { sendOpenRouterChat } from "./chat/providers/openrouter";

const DEFAULT_PREVIEW_PAGES = 3;

export type ChatService = {
  reply: (input: ChatRequest) => Promise<ChatResponse>;
};

export function createChatService(deps: {
  books: BooksService;
  providers: ProvidersService;
  previewPages?: number;
}): ChatService {
  const previewPages = Math.max(1, deps.previewPages ?? DEFAULT_PREVIEW_PAGES);
  return {
    async reply(input: ChatRequest): Promise<ChatResponse> {
      const provider = deps.providers.getActiveRecord();
      if (!provider) {
        throw badRequest("No active AI provider configured");
      }

      if (!isProviderType(provider.provider_type)) {
        throw badRequest("Unsupported provider type");
      }

      const sectionTitle = input.sectionTitle?.trim() || null;
      const pages = collectPageContext(
        deps.books,
        input.bookId,
        input.pageNumber,
        previewPages
      );
      const contextText = pages.map((page) => `Page ${page.pageNumber}:\n${page.text}`).join("\n\n");
      const prompt = buildPrompt({
        sectionTitle,
        contextText,
        question: input.message
      });

      const apiKey = decryptSecret(provider.api_key_encrypted);
      const handler = CHAT_HANDLERS[provider.provider_type];
      let reply = "No response generated.";
      try {
        reply = await handler({
          apiKey,
          model: provider.model,
          prompt
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Provider request failed (${provider.provider_type}): ${message}`);
      }

      return {
        reply,
        pageNumber: input.pageNumber,
        sectionTitle,
        contextText
      };
    }
  };
}

const CHAT_HANDLERS: Record<
  ProviderType,
  (input: { apiKey: string; model: string; prompt: string }) => Promise<string>
> = {
  gemini: sendGeminiChat,
  openrouter: sendOpenRouterChat
};

function isProviderType(value: string): value is ProviderType {
  return value === "gemini" || value === "openrouter";
}
