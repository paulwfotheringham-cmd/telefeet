import type { QuizCategoryId } from "../categories";
import { buildQuestionBank } from "./assemble";
import type { QuizQuestionBankItem } from "./types";

export const QUIZ_QUESTIONS: QuizQuestionBankItem[] = buildQuestionBank();

export const QUIZ_QUESTION_COUNT = QUIZ_QUESTIONS.length;

const BY_ID = new Map(QUIZ_QUESTIONS.map((q) => [q.id, q]));

export function getQuestionByBankId(bankId: number): QuizQuestionBankItem {
  const q = BY_ID.get(bankId);
  if (!q) throw new Error(`Unknown question id ${bankId}`);
  return q;
}

export function countQuestionsByCategory(): Record<QuizCategoryId, number> {
  const counts = {} as Record<QuizCategoryId, number>;
  for (const q of QUIZ_QUESTIONS) {
    counts[q.categoryId] = (counts[q.categoryId] ?? 0) + 1;
  }
  const gkEligible = QUIZ_QUESTIONS.filter(
    (q) => q.generalKnowledgeSubjects && q.generalKnowledgeSubjects.length > 0,
  ).length;
  counts.general_knowledge = gkEligible;
  return counts;
}

export type { QuizQuestionBankItem } from "./types";
