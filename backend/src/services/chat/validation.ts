import { badRequest } from "../../lib/errors";
import type { ChatSendRequest } from "@shared/types/chat";

export type NormalizedChatSendInput = {
  threadId: string;
  pageNumber: number;
  message: string;
};

export function normalizeChatSendInput(input: ChatSendRequest): NormalizedChatSendInput {
  const pageNumber = Number(input.pageNumber);
  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    throw badRequest("Invalid page number");
  }

  const message = input.message.trim();
  if (!message) {
    throw badRequest("Message is required");
  }

  return {
    threadId: input.threadId,
    pageNumber,
    message
  };
}
