import { formatPopulation, parsePopulationGuess, populationWithinTolerance } from "./population";
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

export function describeScoredAnswer(
  question: QuizQuestionBankItem,
  choice: number,
): { chosenLabel: string; correctLabel: string; distance?: number } {
  if (question.estimate) {
    return {
      chosenLabel: formatPopulation(choice),
      correctLabel: formatPopulation(question.estimate.value),
      distance: Math.abs(choice - question.estimate.value),
    };
  }
  return {
    chosenLabel: question.options[choice] ?? "",
    correctLabel: question.options[question.correctIndex] ?? "",
  };
}

/** Players.answer is limited to 0–3. Population guesses are stored on the answer log. */
export function persistedPlayerAnswer(question: QuizQuestionBankItem, choice: number): number {
  return question.estimate ? 0 : choice;
}

/** Single authoritative grading path for scoring, persistence, and client feedback. */
export function gradeAnswer(bankId: number, choiceIndex: number): GradedAnswer {
  const question = getQuestionByBankId(bankId);
  if (question.estimate) {
    const guess = choiceIndex;
    if (!Number.isInteger(guess) || guess < 0) {
      throw new Error("Enter a whole number, like 1,000,000");
    }
    const labels = describeScoredAnswer(question, guess);
    return {
      bankId,
      choiceIndex: guess,
      correctIndex: 0,
      correct: populationWithinTolerance(guess, question.estimate.value, question.estimate.tolerance),
      chosenLabel: labels.chosenLabel,
      correctLabel: labels.correctLabel,
      question,
    };
  }
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

export function choiceFromSubmission(bankId: number, raw: unknown): number {
  const question = getQuestionByBankId(bankId);
  if (question.estimate) return parsePopulationGuess(raw);
  const choice = normalizeChoiceIndex(raw);
  assertValidChoiceIndex(choice, question.options.length);
  return choice;
}
