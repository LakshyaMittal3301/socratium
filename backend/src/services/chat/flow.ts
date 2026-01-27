import crypto from "crypto";
import { badRequest, notFound } from "../../lib/errors";
import { decryptSecret } from "../../lib/secrets";
import { nowIso } from "../../lib/time";
import type { BooksService } from "../books";
import type { ProvidersService } from "../providers";
import type { ThreadsRepository, ThreadRecord } from "../../repositories/threads";
import type { MessagesRepository, MessageRecord } from "../../repositories/messages";
import type { ProviderRecord } from "../../repositories/providers";
import type { ChatMessageDto, ChatSendResponse, ThreadUpdate } from "@shared/types/chat";
import type { ProviderType } from "@shared/types/providers";
import { formatReadingContext, selectContext } from "./context";
import { buildPromptPayload, buildPromptText, SYSTEM_PROMPT } from "./prompt";
import type { ChatProviderAdapter, NormalizedChatRequest, NormalizedChatResponse } from "./types";
import { sendGeminiChat } from "./providers/gemini";
import { sendOpenRouterChat } from "./providers/openrouter";

export type ReplyDeps = {
  books: BooksService;
  providers: ProvidersService;
  threads: ThreadsRepository;
  messages: MessagesRepository;
  previewPages: number;
  recentMessages: number;
};

export function requireThread(threads: ThreadsRepository, threadId: string): ThreadRecord {
  const thread = threads.getById(threadId);
  if (!thread) {
    throw notFound("Thread not found");
  }
  return thread;
}

export function loadThreadAndProvider(
  deps: ReplyDeps,
  threadId: string
): { thread: ThreadRecord; activeProvider: ProviderRecord } {
  const thread = requireThread(deps.threads, threadId);
  const provider = deps.providers.getRecordById(thread.provider_id);
  if (!provider) {
    throw badRequest("Thread provider not found");
  }
  const activeProvider = deps.providers.getActiveRecord();
  if (!activeProvider) {
    throw badRequest("No active AI provider configured");
  }
  if (activeProvider.id !== provider.id) {
    throw badRequest(
      "Active provider does not match this thread. Activate the thread's provider or start a new thread."
    );
  }
  return { thread, activeProvider };
}

export function persistUserMessage(input: {
  deps: ReplyDeps;
  thread: ThreadRecord;
  pageNumber: number;
  sectionTitle: string | null;
  messageText: string;
}): { now: string; originalTitle: string | null; autoTitle: string | null } {
  const { deps, thread, pageNumber, sectionTitle, messageText } = input;
  const now = nowIso();
  const originalTitle = thread.title;
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

  return { now, originalTitle, autoTitle };
}

export function buildChatPrompt(input: {
  deps: ReplyDeps;
  thread: ThreadRecord;
  pageNumber: number;
  sectionTitle: string | null;
  toMessageDto: (record: MessageRecord) => ChatMessageDto;
}): {
  promptPayload: ReturnType<typeof buildPromptPayload>;
  promptText: string;
  contextText: string;
  excerptStatus: "available" | "missing";
} {
  const { deps, thread, pageNumber, sectionTitle, toMessageDto } = input;
  const bookMeta = deps.books.getMeta(thread.book_id);
  const pages = selectContext({
    books: deps.books,
    bookId: thread.book_id,
    pageNumber,
    previewPages: deps.previewPages
  });
  const { contextText, excerptStatus, readingContext } = formatReadingContext({
    bookTitle: bookMeta.title,
    sectionTitle,
    pageNumber,
    pages
  });

  const recent = deps.messages
    .listRecentByThread(thread.id, deps.recentMessages)
    .reverse()
    .map(toMessageDto);

  const promptPayload = buildPromptPayload({
    systemPrompt: SYSTEM_PROMPT,
    readingContext,
    messages: recent,
    meta: {
      pageNumber,
      sectionTitle,
      excerptStatus
    }
  });
  const promptText = buildPromptText(promptPayload);

  return { promptPayload, promptText, contextText, excerptStatus };
}

export async function callProvider(
  activeProvider: ProviderRecord,
  request: NormalizedChatRequest
): Promise<NormalizedChatResponse> {
  if (!isProviderType(activeProvider.provider_type)) {
    throw badRequest("Unsupported provider type");
  }
  const apiKey = decryptSecret(activeProvider.api_key_encrypted);
  const handler = CHAT_HANDLERS[activeProvider.provider_type];
  try {
    return await handler({ apiKey, model: activeProvider.model, request });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Provider request failed (${activeProvider.provider_type}): ${message}`);
  }
}

export function persistAssistantMessage(input: {
  deps: ReplyDeps;
  thread: ThreadRecord;
  pageNumber: number;
  sectionTitle: string | null;
  reply: string;
  contextText: string;
  excerptStatus: "available" | "missing";
  promptPayload: ReturnType<typeof buildPromptPayload>;
  promptText: string;
  providerResponseRaw?: unknown;
}): MessageRecord {
  const {
    deps,
    thread,
    pageNumber,
    sectionTitle,
    reply,
    contextText,
    excerptStatus,
    promptPayload,
    promptText,
    providerResponseRaw
  } = input;
  const promptTrace = {
    system_prompt: promptPayload.systemPrompt,
    reading_context: promptPayload.readingContext,
    messages: promptPayload.messages.map((message) => ({
      role: message.role,
      content: message.content
    })),
    meta: promptPayload.meta
  };
  return deps.messages.insert({
    id: crypto.randomUUID(),
    thread_id: thread.id,
    role: "assistant",
    content: reply,
    meta_json: safeJsonStringify({
      page_number: pageNumber,
      section_name: sectionTitle,
      context_text: contextText,
      excerpt_status: excerptStatus,
      prompt_payload: promptTrace,
      prompt_text: promptText,
      provider_response: reply,
      provider_response_raw: providerResponseRaw ?? null
    }),
    created_at: nowIso()
  });
}

export function buildChatResponse(input: {
  assistantRecord: MessageRecord;
  threadId: string;
  updatedAt: string;
  originalTitle: string | null;
  autoTitle: string | null;
  toMessageDto: (record: MessageRecord) => ChatMessageDto;
}): ChatSendResponse {
  const { assistantRecord, threadId, updatedAt, originalTitle, autoTitle, toMessageDto } = input;
  return {
    message: toMessageDto(assistantRecord),
    thread_update: buildThreadUpdate(threadId, updatedAt, originalTitle, autoTitle)
  };
}

const CHAT_HANDLERS: Record<ProviderType, ChatProviderAdapter> = {
  gemini: sendGeminiChat,
  openrouter: sendOpenRouterChat
};

function isProviderType(value: string): value is ProviderType {
  return value === "gemini" || value === "openrouter";
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

function safeJsonStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_key, current) => {
    if (typeof current === "object" && current !== null) {
      if (seen.has(current)) return "[Circular]";
      seen.add(current);
    }
    if (typeof current === "bigint") return current.toString();
    return current;
  });
}

function buildThreadUpdate(
  threadId: string,
  updatedAt: string,
  originalTitle: string | null,
  nextTitle: string | null
): ThreadUpdate {
  const update: ThreadUpdate = { id: threadId, updated_at: updatedAt };
  if (nextTitle && nextTitle !== originalTitle) {
    update.title = nextTitle;
  }
  return update;
}
