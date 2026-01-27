import { chatMessageSchema, threadUpdateSchema } from "./threads";

export const chatRequestSchema = {
  type: "object",
  properties: {
    threadId: { type: "string", minLength: 1 },
    pageNumber: { type: "integer", minimum: 1 },
    message: { type: "string", minLength: 1, pattern: "\\S" }
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
