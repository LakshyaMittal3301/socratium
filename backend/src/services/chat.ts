import crypto from "crypto";
import { badRequest } from "../lib/errors";
import { CHAT_PREVIEW_PAGES, CHAT_RECENT_MESSAGES } from "../lib/config";
import { nowIso } from "../lib/time";
import type { BooksService } from "./books";
import type { ProvidersService } from "./providers";
import type { ThreadsRepository, ThreadRecord } from "../repositories/threads";
import type { MessagesRepository, MessageRecord } from "../repositories/messages";
import type {
  ChatMessageDto,
  ChatMessageMeta,
  ChatSendRequest,
  ChatSendResponse,
  ThreadDto
} from "@shared/types/chat";
import type { ProviderType } from "@shared/types/providers";
import { normalizeChatSendInput } from "./chat/validation";
import {
  createDefaultChatStrategy,
  type ChatStrategyInput
} from "./chat/strategy";
import { createChatContextLoader } from "./chat/context-loader";
import {
  buildChatResponse,
  callProvider,
  loadThreadAndProvider,
  persistAssistantMessage,
  persistUserMessage,
  requireThread
} from "./chat/flow";

const DEFAULT_PREVIEW_PAGES = CHAT_PREVIEW_PAGES;
const DEFAULT_RECENT_MESSAGES = CHAT_RECENT_MESSAGES;

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
  previewPages?: number;
  recentMessages?: number;
  strategy?: ReturnType<typeof createDefaultChatStrategy>;
}): ChatService {
  const previewPages = Math.max(1, deps.previewPages ?? DEFAULT_PREVIEW_PAGES);
  const recentMessages = Math.max(1, deps.recentMessages ?? DEFAULT_RECENT_MESSAGES);
  const strategy = deps.strategy ?? createDefaultChatStrategy();
  const replyDeps = {
    books: deps.books,
    providers: deps.providers,
    threads: deps.threads,
    messages: deps.messages,
    previewPages,
    recentMessages
  };
  const contextLoader = createChatContextLoader({
    books: deps.books,
    messages: deps.messages,
    toMessageDto
  });

  return {
    listThreads(bookId: string): ThreadDto[] {
      deps.books.getMeta(bookId);
      return deps.threads.listByBook(bookId).map(toThreadDto);
    },
    createThread(bookId: string): ThreadDto {
      deps.books.getMeta(bookId);
      const provider = deps.providers.getActiveRecord();
      if (!provider) {
        throw badRequest("No active AI provider configured");
      }

      const now = nowIso();
      const record = deps.threads.insert({
        id: crypto.randomUUID(),
        book_id: bookId,
        title: null,
        provider_id: provider.id,
        created_at: now,
        updated_at: now
      });
      return toThreadDto(record);
    },
    renameThread(threadId: string, title: string): ThreadDto {
      const trimmed = title.trim();
      if (!trimmed) {
        throw badRequest("Title is required");
      }
      const thread = requireThread(deps.threads, threadId);
      deps.threads.updateTitle(thread.id, trimmed, nowIso());
      const updated = requireThread(deps.threads, threadId);
      return toThreadDto(updated);
    },
    removeThread(threadId: string): void {
      requireThread(deps.threads, threadId);
      deps.threads.remove(threadId);
    },
    listMessages(threadId: string): ChatMessageDto[] {
      requireThread(deps.threads, threadId);
      return deps.messages.listByThread(threadId).map(toMessageDto);
    },
    async reply(input: ChatSendRequest): Promise<ChatSendResponse> {
      const { threadId, pageNumber, message } = normalizeChatSendInput(input);
      const { thread, activeProvider } = loadThreadAndProvider(replyDeps, threadId);

      const sectionTitle = deps.books.getSectionTitle(thread.book_id, pageNumber);
      const { now, originalTitle, autoTitle } = persistUserMessage({
        deps: replyDeps,
        thread,
        pageNumber,
        sectionTitle,
        messageText: message
      });

      const request = await strategy.buildRequest(
        {
          threadId: thread.id,
          bookId: thread.book_id,
          pageNumber,
          sectionTitle,
          messageText: message,
          previewPages,
          recentMessages,
          provider: {
            id: activeProvider.id,
            type: activeProvider.provider_type as ProviderType,
            model: activeProvider.model,
            name: activeProvider.name
          }
        } satisfies ChatStrategyInput,
        contextLoader
      );
      if (!request.trace?.promptPayload) {
        throw new Error("Prompt payload missing from chat strategy.");
      }

      const promptPayload = request.trace.promptPayload;
      const promptText = request.trace.promptText ?? "";
      const contextText = request.trace.contextText ?? "";
      const excerptStatus = request.meta?.excerptStatus ?? "missing";

      const providerResponse = await callProvider(activeProvider, request);
      const replyText = providerResponse.text;

      const assistantRecord = persistAssistantMessage({
        deps: replyDeps,
        thread,
        pageNumber,
        sectionTitle,
        reply: replyText,
        contextText,
        excerptStatus,
        promptPayload,
        promptText,
        providerResponseRaw: providerResponse.raw
      });

      return buildChatResponse({
        assistantRecord,
        threadId: thread.id,
        updatedAt: now,
        originalTitle,
        autoTitle,
        toMessageDto
      });
    }
  };
}

function toThreadDto(record: ThreadRecord): ThreadDto {
  return {
    id: record.id,
    book_id: record.book_id,
    title: record.title,
    provider_id: record.provider_id,
    provider_name: record.provider_name,
    provider_type: record.provider_type ? (record.provider_type as ProviderType) : null,
    model: record.model,
    created_at: record.created_at,
    updated_at: record.updated_at
  };
}

function toMessageDto(record: MessageRecord): ChatMessageDto {
  return {
    id: record.id,
    thread_id: record.thread_id,
    role: record.role === "assistant" ? "assistant" : "user",
    content: record.content,
    created_at: record.created_at,
    meta: parseMeta(record.meta_json)
  };
}

function parseMeta(value: string | null): ChatMessageMeta | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as ChatMessageMeta;
  } catch {
    return null;
  }
}
