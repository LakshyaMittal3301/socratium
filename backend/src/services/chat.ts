import crypto from "crypto";
import { badRequest } from "../lib/errors";
import { nowIso } from "../lib/time";
import type { BooksService } from "./books";
import type { ProvidersService } from "./providers";
import type { ThreadsRepository } from "../repositories/threads";
import type { MessagesRepository } from "../repositories/messages";
import type {
  ChatMessageDto,
  ChatSendRequest,
  ChatSendResponse,
  ThreadDto
} from "@shared/types/chat";
import { normalizeChatSendInput } from "./chat/validation";
import { createDefaultChatStrategy, type ChatStrategy } from "./chat/strategy";
import { createChatContextLoader } from "./chat/context-loader";
import { callProvider } from "./chat/flow";

export type ChatService = {
  listThreads: (bookId: string) => ThreadDto[];
  createThread: (bookId: string) => ThreadDto;
  renameThread: (threadId: string, title: string) => ThreadDto;
  removeThread: (threadId: string) => void;
  listMessages: (threadId: string) => ChatMessageDto[];
  reply: (input: ChatSendRequest) => Promise<ChatSendResponse>;
};

export function createChatService(deps: {
  books: BooksService;
  providers: ProvidersService;
  threads: ThreadsRepository;
  messages: MessagesRepository;
  strategy?: ChatStrategy;
}): ChatService {
  const strategy = deps.strategy ?? createDefaultChatStrategy();
  const contextLoader = createChatContextLoader();

  return {
    listThreads(bookId: string): ThreadDto[] {
      void bookId;
      return [];
    },
    createThread(bookId: string): ThreadDto {
      const now = nowIso();
      return {
        id: crypto.randomUUID(),
        book_id: bookId,
        title: null,
        provider_id: "",
        provider_name: null,
        provider_type: null,
        model: null,
        created_at: now,
        updated_at: now
      };
    },
    renameThread(threadId: string, title: string): ThreadDto {
      const now = nowIso();
      return {
        id: threadId,
        book_id: "",
        title,
        provider_id: "",
        provider_name: null,
        provider_type: null,
        model: null,
        created_at: now,
        updated_at: now
      };
    },
    removeThread(threadId: string): void {
      void threadId;
    },
    listMessages(threadId: string): ChatMessageDto[] {
      void threadId;
      return [];
    },
    async reply(input: ChatSendRequest): Promise<ChatSendResponse> {
      const { threadId, message } = normalizeChatSendInput(input);
      const activeProvider = deps.providers.getActiveRecord();
      if (!activeProvider) {
        throw badRequest("No active AI provider configured");
      }

      const request = await strategy.buildRequest(
        {
          messageText: message
        },
        contextLoader
      );
      const providerResponse = await callProvider(activeProvider, request);
      const now = nowIso();
      const assistantMessage: ChatMessageDto = {
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: "assistant",
        content: providerResponse.text,
        created_at: now
      };

      return {
        message: assistantMessage,
        thread_update: null
      };
    }
  };
}
