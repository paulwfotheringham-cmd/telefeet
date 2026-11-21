import { SHOW_QUESTIONS } from "./question-bank";
import {
  SHOW_MODE_PLAY_TOGETHER,
  type PresentedShow,
  type ShowEra,
  type ShowPlayMode,
  type ShowQuestion,
} from "./types";

export class InsufficientShowQuestionsError extends Error {
  constructor(
    readonly era: ShowEra,
    readonly available: number,
    readonly needed: number,
  ) {
    super(`Not enough ${era} gameshows: need ${needed}, found ${available}.`);
    this.name = "InsufficientShowQuestionsError";
  }
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const current = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = current;
  }
  return arr;
}

export function questionsForEra(
  era: ShowEra,
  bank: readonly ShowQuestion[] = SHOW_QUESTIONS,
): ShowQuestion[] {
  if (era === "both") return [...bank];
  return bank.filter((question) => question.decades.includes(era));
}

export function plannedShowLength(era: ShowEra, mode: ShowPlayMode, bank = SHOW_QUESTIONS): number {
  const pool = questionsForEra(era, bank).length;
  if (mode === SHOW_MODE_PLAY_TOGETHER) return Math.min(8, pool);
  return Math.min(5, Math.floor(pool / 2)) * 2;
}

export function presentQuestion(question: ShowQuestion, rng: () => number): PresentedShow {
  const options = shuffle([question.title, ...question.distractors], rng);
  return {
    id: question.id,
    title: question.title,
    year: question.year,
    options,
    correctIndex: options.indexOf(question.title),
  };
}

export function selectGameQuestions(
  era: ShowEra,
  count: number,
  rng: () => number = Math.random,
  bank: readonly ShowQuestion[] = SHOW_QUESTIONS,
): PresentedShow[] {
  const pool = questionsForEra(era, bank);
  if (pool.length < count) {
    throw new InsufficientShowQuestionsError(era, pool.length, count);
  }
  return shuffle(pool, rng)
    .slice(0, count)
    .map((question) => presentQuestion(question, rng));
}
