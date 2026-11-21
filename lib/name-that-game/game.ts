import { GAME_QUESTIONS } from "./question-bank";
import {
  GAME_MODE_PLAY_TOGETHER,
  type GameEra,
  type GamePlayMode,
  type GameQuestion,
  type PresentedGame,
} from "./types";

export class InsufficientGameQuestionsError extends Error {
  constructor(
    readonly era: GameEra,
    readonly available: number,
    readonly needed: number,
  ) {
    super(`Not enough ${era} games: need ${needed}, found ${available}.`);
    this.name = "InsufficientGameQuestionsError";
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
  era: GameEra,
  bank: readonly GameQuestion[] = GAME_QUESTIONS,
): GameQuestion[] {
  if (era === "both") return [...bank];
  return bank.filter((question) => question.decade === era);
}

export function plannedGameLength(era: GameEra, mode: GamePlayMode, bank = GAME_QUESTIONS): number {
  const pool = questionsForEra(era, bank).length;
  if (mode === GAME_MODE_PLAY_TOGETHER) return Math.min(10, pool);
  return Math.min(10, Math.floor(pool / 2)) * 2;
}

export function presentQuestion(
  question: GameQuestion,
  rng: () => number,
  pool: readonly GameQuestion[],
): PresentedGame {
  const distractors = shuffle(
    pool.filter((other) => other.title !== question.title),
    rng,
  )
    .slice(0, 3)
    .map((other) => other.title);
  const options = shuffle([question.title, ...distractors], rng);
  return {
    id: question.id,
    title: question.title,
    year: question.year,
    platform: question.platform,
    options,
    correctIndex: options.indexOf(question.title),
  };
}

export function selectGameQuestions(
  era: GameEra,
  count: number,
  rng: () => number = Math.random,
  bank: readonly GameQuestion[] = GAME_QUESTIONS,
): PresentedGame[] {
  const pool = questionsForEra(era, bank);
  if (pool.length < count) {
    throw new InsufficientGameQuestionsError(era, pool.length, count);
  }
  return shuffle(pool, rng)
    .slice(0, count)
    .map((question) => presentQuestion(question, rng, pool));
}
