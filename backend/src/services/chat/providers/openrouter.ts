import { createOpenRouterClient } from "../../../lib/openrouter";
import type {
  ChatMessage,
  ChatProviderAdapterInput,
  ChatRequestParams,
  NormalizedChatResponse
} from "../types";

export type OpenRouterChatInput = ChatProviderAdapterInput;

export async function sendOpenRouterChat(
  input: OpenRouterChatInput
): Promise<NormalizedChatResponse> {
  const client = await createOpenRouterClient(input.apiKey);
  const responsesInput = await buildOpenResponsesInput(input.request.messages);
  const options = buildOpenRouterOptions(input.request.params);
  const call = await (client as unknown as { callModel: (args: unknown) => Promise<unknown> })
    .callModel({
    model: input.model,
    input: responsesInput,
    stream: false,
    ...options
  });
  const response = await resolveCallResponse(call);
  const text = extractResponseText(response);
  return { text, raw: response };
}

async function buildOpenResponsesInput(messages: ChatMessage[]): Promise<unknown> {
  const { fromChatMessages } = (await import("@openrouter/sdk")) as {
    fromChatMessages?: (items: { role: string; content: string }[]) => unknown;
  };
  const normalized = messages.map((message) => ({
    role: message.role,
    content: message.content
  }));
  if (typeof fromChatMessages === "function") {
    return fromChatMessages(normalized);
  }
  return normalized;
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

async function resolveCallResponse(call: unknown): Promise<unknown> {
  if (call && typeof call === "object" && "getResponse" in call) {
    const withResponse = call as { getResponse?: () => Promise<unknown> };
    if (typeof withResponse.getResponse === "function") {
      return withResponse.getResponse();
    }
  }
  return call;
}

function extractResponseText(response: unknown): string {
  if (!response || typeof response !== "object") {
    return "No response generated.";
  }
  const payload = response as {
    output_text?: unknown;
    output?: unknown;
    choices?: unknown;
    text?: unknown;
  };

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (Array.isArray(payload.output)) {
    const outputText = payload.output
      .flatMap((item) => {
        if (item && typeof item === "object" && "content" in item) {
          const content = (item as { content?: unknown }).content;
          if (Array.isArray(content)) {
            return content
              .map((part) => (part && typeof part === "object" ? (part as { text?: unknown }).text : null))
              .filter((text): text is string => typeof text === "string");
          }
        }
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          if (typeof text === "string") return [text];
        }
        return [];
      })
      .join("");
    if (outputText.trim()) return outputText;
  }

  if (Array.isArray(payload.choices)) {
    const choice = payload.choices[0] as { message?: { content?: unknown }; text?: unknown } | undefined;
    const messageContent = choice?.message?.content;
    if (typeof messageContent === "string" && messageContent.trim()) {
      return messageContent;
    }
    if (typeof choice?.text === "string" && choice.text.trim()) {
      return choice.text;
    }
  }

  if (typeof payload.text === "string" && payload.text.trim()) {
    return payload.text;
  }

  return "No response generated.";
}
