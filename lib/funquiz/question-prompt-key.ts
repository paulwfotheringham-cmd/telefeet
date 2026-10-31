import type { QuizQuestionBankItem } from "./question-bank/types";

/** Normalized prompt text for de-duplication across bank IDs. */
export function normalizeQuizPrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Stable key so flag/outline items with identical prompts are not treated as duplicates. */
export function questionDedupeKey(
  q: Pick<QuizQuestionBankItem, "prompt" | "outlineAssetId" | "flagIso2">,
): string {
  if (q.outlineAssetId) return `outline:${q.outlineAssetId}`;
  if (q.flagIso2) return `flag:${q.flagIso2.toLowerCase()}`;
  return normalizeQuizPrompt(q.prompt);
}
