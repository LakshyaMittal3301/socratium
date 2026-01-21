export type PromptInput = {
  sectionTitle: string | null;
  contextText: string;
  question: string;
};

export function buildPrompt(input: PromptInput): string {
  const section = input.sectionTitle ? `Section: ${input.sectionTitle}\n` : "";
  return [
    "You are a helpful mentor helping a reader understand a technical book.",
    "Use the provided context to answer their question.",
    "If the answer is not in the context, explain what to look for in the reading.",
    "",
    section + "Context:",
    input.contextText,
    "",
    `Question: ${input.question}`
  ].join("\n");
}
