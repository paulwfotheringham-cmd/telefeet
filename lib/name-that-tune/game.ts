import { TUNE_QUESTIONS } from "./question-bank";
import {
  QUESTIONS_PER_GAME,
  type PresentedTune,
  type TuneEra,
  type TuneQuestion,
} from "./types";

export class InsufficientTuneQuestionsError extends Error {
  constructor(
    readonly era: TuneEra,
    readonly available: number,
    readonly needed: number,
  ) {
    super(`Not enough ${era} songs: need ${needed}, found ${available}.`);
    this.name = "InsufficientTuneQuestionsError";
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
  era: TuneEra,
  bank: readonly TuneQuestion[] = TUNE_QUESTIONS,
): TuneQuestion[] {
  if (era === "both") return [...bank];
  return bank.filter((question) => question.decade === era);
}

export function presentQuestion(question: TuneQuestion, rng: () => number): PresentedTune {
  const options = shuffle([question.artist, ...question.distractors], rng);
  const correctIndex = options.indexOf(question.artist);
  return {
    id: question.id,
    title: question.title,
    artist: question.artist,
    year: question.year,
    decade: question.decade,
    options,
    correctIndex,
  };
}

export function selectGameQuestions(
  era: TuneEra,
  count: number = QUESTIONS_PER_GAME,
  rng: () => number = Math.random,
  bank: readonly TuneQuestion[] = TUNE_QUESTIONS,
): PresentedTune[] {
  const pool = questionsForEra(era, bank);
  if (pool.length < count) {
    throw new InsufficientTuneQuestionsError(era, pool.length, count);
  }
  return shuffle(pool, rng)
    .slice(0, count)
    .map((question) => presentQuestion(question, rng));
}
