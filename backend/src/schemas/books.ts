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
      anyOf: [{ type: "array", items: { $ref: "outlineNode#" } }, { type: "null" }]
    }
  },
  required: ["outline"]
};

export const outlineNodeSchema = {
  $id: "outlineNode",
  type: "object",
  properties: {
    title: { type: "string" },
    pageNumber: { anyOf: [{ type: "number" }, { type: "null" }] },
    children: { type: "array", items: { $ref: "outlineNode#" } }
  },
  required: ["title", "pageNumber", "children"]
};

export const pageMapEntrySchema = {
  type: "object",
  properties: {
    page_number: { type: "number" },
    start_offset: { type: "number" },
    end_offset: { type: "number" }
  },
  required: ["page_number", "start_offset", "end_offset"]
};

export const pageMapResponseSchema = {
  type: "object",
  properties: {
    entries: { type: "array", items: pageMapEntrySchema }
  },
  required: ["entries"]
};

export const pageTextResponseSchema = {
  type: "object",
  properties: {
    page_number: { type: "number" },
    text: { type: "string" }
  },
  required: ["page_number", "text"]
};
