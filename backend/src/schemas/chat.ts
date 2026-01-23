import { chatMessageSchema, threadUpdateSchema } from "./threads";

export const chatRequestSchema = {
  type: "object",
  properties: {
    threadId: { type: "string" },
    pageNumber: { type: "number" },
    message: { type: "string" }
  },
  required: ["threadId", "pageNumber", "message"]
};

export const chatResponseSchema = {
  type: "object",
  properties: {
    message: chatMessageSchema,
    thread_update: { anyOf: [threadUpdateSchema, { type: "null" }] }
  },
  required: ["message", "thread_update"]
};
