import crypto from "crypto";
import { badRequest, notFound } from "../lib/errors";
import { decryptSecret } from "../lib/secrets";
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
import { collectPageContext, buildReadingContextBlock } from "./chat/context";
import { buildPrompt, SYSTEM_PROMPT } from "./chat/prompt";
import { sendGeminiChat } from "./chat/providers/gemini";
import { sendOpenRouterChat } from "./chat/providers/openrouter";

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
}): ChatService {
  const previewPages = Math.max(1, deps.previewPages ?? DEFAULT_PREVIEW_PAGES);
  const recentMessages = Math.max(1, deps.recentMessages ?? DEFAULT_RECENT_MESSAGES);

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
      const thread = requireThread(deps.threads, input.threadId);
      const provider = deps.providers.getRecordById(thread.provider_id);
      if (!provider) {
        throw badRequest("Thread provider not found");
      }
      if (!isProviderType(provider.provider_type)) {
        throw badRequest("Unsupported provider type");
      }

      const pageNumber = Number(input.pageNumber);
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw badRequest("Invalid page number");
      }

      const sectionTitle = deps.books.getSectionTitle(thread.book_id, pageNumber);
      const messageText = input.message.trim();
      if (!messageText) {
        throw badRequest("Message is required");
      }

      const now = nowIso();
      deps.messages.insert({
        id: crypto.randomUUID(),
        thread_id: thread.id,
        role: "user",
        content: messageText,
        meta_json: JSON.stringify({
          page_number: pageNumber,
          section_name: sectionTitle
        }),
        created_at: now
      });

      const autoTitle = deriveThreadTitle(thread.title, messageText);
      if (autoTitle) {
        deps.threads.updateTitle(thread.id, autoTitle, now);
      } else {
        deps.threads.touchUpdatedAt(thread.id, now);
      }

      const bookMeta = deps.books.getMeta(thread.book_id);
      const pages = collectPageContext(deps.books, thread.book_id, pageNumber, previewPages);
      const contextText = pages.map((page) => `Page ${page.pageNumber}:\n${page.text}`).join("\n\n");
      const excerptStatus = contextText.trim() ? "available" : "missing";

      const readingContext = buildReadingContextBlock({
        bookTitle: bookMeta.title,
        sectionTitle,
        pageNumber,
        excerptStatus,
        contextText
      });

      const recent = deps.messages
        .listRecentByThread(thread.id, recentMessages)
        .reverse()
        .map(toMessageDto);

      const prompt = buildPrompt({
        systemPrompt: SYSTEM_PROMPT,
        readingContext,
        messages: recent
      });

      const apiKey = decryptSecret(provider.api_key_encrypted);
      const handler = CHAT_HANDLERS[provider.provider_type];
      let reply = "No response generated.";
      try {
        reply = await handler({ apiKey, model: provider.model, prompt });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Provider request failed (${provider.provider_type}): ${message}`);
      }

      const assistantRecord = deps.messages.insert({
        id: crypto.randomUUID(),
        thread_id: thread.id,
        role: "assistant",
        content: reply,
        meta_json: JSON.stringify({
          page_number: pageNumber,
          section_name: sectionTitle,
          context_text: contextText,
          excerpt_status: excerptStatus
        }),
        created_at: nowIso()
      });

      const updatedThread = requireThread(deps.threads, thread.id);
      return {
        message: toMessageDto(assistantRecord),
        thread: toThreadDto(updatedThread)
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

function requireThread(threads: ThreadsRepository, threadId: string): ThreadRecord {
  const thread = threads.getById(threadId);
  if (!thread) {
    throw notFound("Thread not found");
  }
  return thread;
}

function deriveThreadTitle(currentTitle: string | null, message: string): string | null {
  if (currentTitle && currentTitle.trim()) {
    return null;
  }
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return null;
  }
  const sentence = normalized.split(/[.!?]/)[0]?.trim();
  const base = sentence && sentence.length > 0 ? sentence : normalized;
  const words = base.split(" ").filter(Boolean);
  const snippet = words.slice(0, 10).join(" ");
  return snippet.length < base.length ? `${snippet}...` : snippet;
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
