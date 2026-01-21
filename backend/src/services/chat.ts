import { badRequest } from "../lib/errors";
import { decryptSecret } from "../lib/secrets";
import { createOpenRouterClient } from "../lib/openrouter";
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
      const provider = deps.providers.getActiveRecord();
      if (!provider) {
        throw badRequest("No active AI provider configured");
      }

      const sectionTitle = input.sectionTitle?.trim() || null;
      const pages = collectPageContext(deps.books, input.bookId, input.pageNumber);
      const contextText = pages.map((page) => `Page ${page.pageNumber}:\n${page.text}`).join("\n\n");
      const prompt = buildPrompt({
        sectionTitle,
        contextText,
        question: input.message
      });

      let reply = "No response generated.";
      if (provider.provider_type === "openrouter") {
        const apiKey = decryptSecret(provider.api_key_encrypted);
        const client = await createOpenRouterClient(apiKey);
        const completion = await client.chat.send({
          model: provider.model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          stream: false
        });
        reply = completion.choices?.[0]?.message?.content ?? reply;
      } else if (provider.provider_type === "gemini") {
        const apiKey = decryptSecret(provider.api_key_encrypted);
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: provider.model,
          contents: prompt
        });
        reply = response.text ?? reply;
      } else {
        throw badRequest("Unsupported provider type");
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
