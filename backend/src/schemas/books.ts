export const bookSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    source_filename: { type: "string" },
    pdf_path: { type: "string" },
    created_at: { type: "string" }
  },
  required: ["id", "title", "source_filename", "pdf_path", "created_at"]
};

export const uploadResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" }
  },
  required: ["id"]
};

export const bookMetaSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    source_filename: { type: "string" },
    pdf_path: { type: "string" },
    created_at: { type: "string" },
    has_text: { type: "boolean" },
    has_outline: { type: "boolean" }
  },
  required: ["id", "title", "source_filename", "pdf_path", "created_at", "has_text", "has_outline"]
};

export const textSampleSchema = {
  type: "object",
  properties: {
    text: { type: "string" }
  },
  required: ["text"]
};

export const outlineResponseSchema = {
  type: "object",
  properties: {
    outline: {
      anyOf: [{ type: "array", items: { type: "object" } }, { type: "null" }]
    }
  },
  required: ["outline"]
};
