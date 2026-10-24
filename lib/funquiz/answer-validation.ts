import { getQuestionByBankId } from "./questions";
import type { QuizQuestionBankItem } from "./question-bank/types";

export type GradedAnswer = {
  bankId: number;
  choiceIndex: number;
  correctIndex: number;
  correct: boolean;
  chosenLabel: string;
  correctLabel: string;
  question: QuizQuestionBankItem;
};

export function normalizeChoiceIndex(raw: unknown): number {
  if (typeof raw === "number" && Number.isInteger(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }
  throw new Error("Invalid answer");
}

export function assertValidChoiceIndex(choiceIndex: number, optionCount: number): void {
  if (choiceIndex < 0 || choiceIndex >= optionCount || !Number.isInteger(choiceIndex)) {
    throw new Error("Invalid answer");
  }
}

/** Single authoritative grading path for scoring, persistence, and client feedback. */
export function gradeAnswer(bankId: number, choiceIndex: number): GradedAnswer {
  const question = getQuestionByBankId(bankId);
  assertValidChoiceIndex(choiceIndex, question.options.length);
  const correctIndex = question.correctIndex;
  const correct = choiceIndex === correctIndex;
  return {
    bankId,
    choiceIndex,
    correctIndex,
    correct,
    chosenLabel: question.options[choiceIndex]!,
    correctLabel: question.options[correctIndex]!,
    question,
  };
}
