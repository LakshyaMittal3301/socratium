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
