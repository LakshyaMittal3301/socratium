import { CHAT_PREVIEW_PAGES, CHAT_RECENT_MESSAGES } from "../../../lib/config";
import { formatReadingContext, selectContext } from "../context";
import { buildPromptPayload, buildPromptText } from "../prompt/build";
import { SYSTEM_PROMPT } from "../prompt/system";
import type { ChatStrategy } from "../strategy";
import type { ChatContextLoader, ChatStrategyInput, NormalizedChatRequest } from "../types";

export function createDefaultChatStrategy(): ChatStrategy {
  return {
    async buildRequest(
      input: ChatStrategyInput,
      loader: ChatContextLoader
    ): Promise<NormalizedChatRequest> {
      const previewPages = CHAT_PREVIEW_PAGES;
      const recentMessagesLimit = CHAT_RECENT_MESSAGES;
      const [bookMeta, sectionTitle] = await Promise.all([
        loader.getBookMeta(input.bookId),
        loader.getSectionTitle(input.bookId, input.pageNumber)
      ]);
      const pages = await selectContext({
        pageNumber: input.pageNumber,
        previewPages,
        getPageText: (page) => loader.getPageText(input.bookId, page)
      });
      const { readingContext, contextText, excerptStatus } = formatReadingContext({
        bookTitle: bookMeta.title,
        sectionTitle,
        pageNumber: input.pageNumber,
        pages
      });
      const recentMessages = await loader.getRecentMessages(input.threadId, recentMessagesLimit);
      const promptPayload = buildPromptPayload({
        systemPrompt: SYSTEM_PROMPT,
        readingContext,
        messages: recentMessages,
        meta: {
          pageNumber: input.pageNumber,
          sectionTitle,
          excerptStatus
        }
      });
      const promptText = buildPromptText(promptPayload);

      return {
        messages: [{ role: "user", content: promptText }],
        meta: {
          pageNumber: input.pageNumber,
          sectionTitle,
          excerptStatus
        },
        trace: {
          promptPayload,
          promptText,
          readingContext,
          contextText,
          excerptStatus
        }
      };
    }
  };
}
