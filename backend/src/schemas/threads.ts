export const threadSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    book_id: { type: "string" },
    title: { anyOf: [{ type: "string" }, { type: "null" }] },
    provider_id: { type: "string" },
    provider_name: { anyOf: [{ type: "string" }, { type: "null" }] },
    provider_type: { anyOf: [{ type: "string" }, { type: "null" }] },
    model: { anyOf: [{ type: "string" }, { type: "null" }] },
    created_at: { type: "string" },
    updated_at: { type: "string" }
  },
  required: ["id", "book_id", "title", "provider_id", "provider_name", "provider_type", "model", "created_at", "updated_at"]
};

export const threadListSchema = {
  type: "array",
  items: threadSchema
};

export const updateThreadSchema = {
  type: "object",
  properties: {
    title: { type: "string" }
  },
  required: ["title"]
};

export const chatMessageMetaSchema = {
  type: "object",
  properties: {
    page_number: { type: "number" },
    section_name: { anyOf: [{ type: "string" }, { type: "null" }] },
    context_text: { type: "string" },
    excerpt_status: { type: "string", enum: ["available", "missing"] }
  }
};

export const chatMessageSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    thread_id: { type: "string" },
    role: { type: "string" },
    content: { type: "string" },
    created_at: { type: "string" },
    meta: { anyOf: [chatMessageMetaSchema, { type: "null" }] }
  },
  required: ["id", "thread_id", "role", "content", "created_at", "meta"]
};

export const chatMessageListSchema = {
  type: "array",
  items: chatMessageSchema
};
