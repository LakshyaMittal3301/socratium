import { callOpenRouterModel } from "../../../lib/openrouter";
import type {
  ChatProviderAdapterInput,
  ChatRequestParams,
  NormalizedChatResponse
} from "../types";

export type OpenRouterChatInput = ChatProviderAdapterInput;

export async function sendOpenRouterChat(
  input: OpenRouterChatInput
): Promise<NormalizedChatResponse> {
  const options = buildOpenRouterOptions(input.request.params);
  const result = await callOpenRouterModel({
    apiKey: input.apiKey,
    model: input.model,
    messages: input.request.messages,
    options
  });
  const text = (await result.getText()).trim() || "No response generated.";
  const raw = await result.getResponse();
  return { text, raw };
}

function buildOpenRouterOptions(params?: ChatRequestParams): Record<string, number> {
  if (!params) return {};
  const options: Record<string, number> = {};
  if (params.temperature != null) options.temperature = params.temperature;
  if (params.topP != null) options.top_p = params.topP;
  if (params.topK != null) options.top_k = params.topK;
  if (params.maxOutputTokens != null) options.max_output_tokens = params.maxOutputTokens;
  if (params.presencePenalty != null) options.presence_penalty = params.presencePenalty;
  if (params.frequencyPenalty != null) options.frequency_penalty = params.frequencyPenalty;
  return options;
}
