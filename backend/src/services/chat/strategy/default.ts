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
      const { readingContext, contextText, excerptStatus } = await loader.getReadingContext({
        bookId: input.bookId,
        pageNumber: input.pageNumber,
        sectionTitle: input.sectionTitle,
        previewPages: input.previewPages
      });
      const recentMessages = await loader.getRecentMessages(input.threadId, input.recentMessages);
      const promptPayload = buildPromptPayload({
        systemPrompt: SYSTEM_PROMPT,
        readingContext,
        messages: recentMessages,
        meta: {
          pageNumber: input.pageNumber,
          sectionTitle: input.sectionTitle,
          excerptStatus
        }
      });
      const promptText = buildPromptText(promptPayload);

      return {
        messages: [{ role: "user", content: promptText }],
        meta: {
          pageNumber: input.pageNumber,
          sectionTitle: input.sectionTitle,
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
