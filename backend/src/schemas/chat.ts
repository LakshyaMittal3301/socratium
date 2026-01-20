export const chatRequestSchema = {
  type: "object",
  properties: {
    bookId: { type: "string" },
    pageNumber: { type: "number" },
    sectionTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
    message: { type: "string" }
  },
  required: ["bookId", "pageNumber", "message"]
};

export const chatResponseSchema = {
  type: "object",
  properties: {
    reply: { type: "string" },
    pageNumber: { type: "number" },
    sectionTitle: { anyOf: [{ type: "string" }, { type: "null" }] },
    pageText: { type: "string" }
  },
  required: ["reply", "pageNumber", "sectionTitle", "pageText"]
};
