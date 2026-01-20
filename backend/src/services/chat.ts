import { badRequest } from "../lib/errors";
import { decryptSecret } from "../lib/secrets";
import type { BooksService } from "./books";
import type { ProvidersService } from "./providers";
import type { ChatRequest, ChatResponse } from "@shared/types/api";

const PREVIEW_PAGES = 3;

export type ChatService = {
  reply: (input: ChatRequest) => Promise<ChatResponse>;
};

export function createChatService(deps: {
  books: BooksService;
  providers: ProvidersService;
}): ChatService {
  return {
    async reply(input: ChatRequest): Promise<ChatResponse> {
      const provider = deps.providers.getActive();
      if (!provider) {
        throw badRequest("No active AI provider configured");
      }
      if (provider.provider_type !== "gemini") {
        throw badRequest("Unsupported provider type");
      }

      const apiKey = decryptSecret(provider.api_key_encrypted);
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const sectionTitle = input.sectionTitle?.trim() || null;
      const pages = collectPageContext(deps.books, input.bookId, input.pageNumber);
      const contextText = pages.map((page) => `Page ${page.pageNumber}:\n${page.text}`).join("\n\n");
      const prompt = buildPrompt({
        sectionTitle,
        contextText,
        question: input.message
      });

      const response = await ai.models.generateContent({
        model: provider.model,
        contents: prompt
      });

      return {
        reply: response.text ?? "No response generated.",
        pageNumber: input.pageNumber,
        sectionTitle,
        contextText
      };
    }
  };
}

function collectPageContext(books: BooksService, bookId: string, pageNumber: number) {
  const pages: { pageNumber: number; text: string }[] = [];
  const start = Math.max(1, pageNumber - (PREVIEW_PAGES - 1));
  for (let page = start; page <= pageNumber; page += 1) {
    try {
      const data = books.getPageText(bookId, page);
      pages.push({ pageNumber: data.page_number, text: data.text });
    } catch {
      continue;
    }
  }
  return pages;
}

function buildPrompt(input: {
  sectionTitle: string | null;
  contextText: string;
  question: string;
}): string {
  const section = input.sectionTitle ? `Section: ${input.sectionTitle}\n` : "";
  return [
    "You are a helpful mentor helping a reader understand a technical book.",
    "Use the provided context to answer their question.",
    "If the answer is not in the context, explain what to look for in the reading.",
    "",
    section + "Context:",
    input.contextText,
    "",
    `Question: ${input.question}`
  ].join("\n");
}
