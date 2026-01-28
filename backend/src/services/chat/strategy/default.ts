import { SYSTEM_PROMPT } from "../prompt/system";
import type { ChatStrategy } from "../strategy";
import type { ChatContextLoader, ChatStrategyInput, NormalizedChatRequest } from "../types";

export function createDefaultChatStrategy(): ChatStrategy {
  return {
    async buildRequest(
      input: ChatStrategyInput,
      loader: ChatContextLoader
    ): Promise<NormalizedChatRequest> {
      void loader;
      return {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: input.messageText }
        ]
      };
    }
  };
}
