export type ProviderType = "gemini" | "openrouter";

export type ProviderDto = {
  id: string;
  name: string;
  provider_type: ProviderType;
  base_url: string | null;
  model: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProviderListResponse = ProviderDto[];

export type CreateProviderRequest = {
  provider_type: ProviderType;
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string | null;
};

export type ProviderTestRequest = {
  provider_type: ProviderType;
  model: string;
  apiKey: string;
};

export type ProviderTestResponse = {
  ok: boolean;
  message: string;
};

export type OpenRouterModel = {
  id: string;
  name?: string;
  context_length?: number;
};

export type OpenRouterModelsRequest = {
  apiKey: string;
};

export type OpenRouterModelsResponse = {
  models: OpenRouterModel[];
};
