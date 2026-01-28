export const providerSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    provider_type: { type: "string" },
    model: { type: "string" },
    is_active: { type: "boolean" },
    created_at: { type: "string" },
    updated_at: { type: "string" }
  },
  required: [
    "id",
    "name",
    "provider_type",
    "model",
    "is_active",
    "created_at",
    "updated_at"
  ]
};

export const providerListSchema = {
  type: "array",
  items: providerSchema
};

export const createProviderSchema = {
  type: "object",
  properties: {
    provider_type: { type: "string" },
    name: { type: "string" },
    model: { type: "string" },
    apiKey: { type: "string" }
  },
  required: ["provider_type", "name", "model", "apiKey"]
};

export const providerTestRequestSchema = {
  type: "object",
  properties: {
    provider_type: { type: "string" },
    model: { type: "string" },
    apiKey: { type: "string" }
  },
  required: ["provider_type", "model", "apiKey"]
};

export const providerTestResponseSchema = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    message: { type: "string" }
  },
  required: ["ok", "message"]
};

export const openRouterModelsRequestSchema = {
  type: "object",
  properties: {
    apiKey: { type: "string" }
  },
  required: ["apiKey"]
};

export const openRouterModelSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    context_length: { type: "number" }
  },
  required: ["id"]
};

export const openRouterModelsResponseSchema = {
  type: "object",
  properties: {
    data: {
      type: "array",
      items: openRouterModelSchema
    }
  },
  required: ["data"]
};
