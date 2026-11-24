import { MOVIE_QUESTIONS } from "./question-bank";
import {
  QUESTIONS_PER_GAME,
  type MovieDifficulty,
  type MovieQuestion,
  type PresentedQuestion,
} from "./types";

export class InsufficientMovieQuestionsError extends Error {
  constructor(
    readonly difficulty: MovieDifficulty,
    readonly available: number,
    readonly needed: number,
  ) {
    super(
      `Not enough ${difficulty} movie questions: need ${needed}, found ${available}.`,
    );
    this.name = "InsufficientMovieQuestionsError";
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

export function questionsForDifficulty(
  difficulty: MovieDifficulty,
  bank: readonly MovieQuestion[] = MOVIE_QUESTIONS,
): MovieQuestion[] {
  return bank.filter((q) => q.difficulty === difficulty);
}

export function presentQuestion(
  question: MovieQuestion,
  rng: () => number,
): PresentedQuestion {
  const options = shuffle([question.film, ...question.distractors], rng);
  const correctIndex = options.indexOf(question.film);
  return {
    id: question.id,
    quote: question.quote,
    film: question.film,
    image: question.image,
    difficulty: question.difficulty,
    category: question.category,
    options,
    correctIndex,
  };
}

export function selectGameQuestions(
  difficulty: MovieDifficulty,
  count: number = QUESTIONS_PER_GAME,
  rng: () => number = Math.random,
  bank: readonly MovieQuestion[] = MOVIE_QUESTIONS,
): PresentedQuestion[] {
  const pool = questionsForDifficulty(difficulty, bank);
  if (pool.length < count) {
    throw new InsufficientMovieQuestionsError(difficulty, pool.length, count);
  }
  return shuffle(pool, rng)
    .slice(0, count)
    .map((question) => presentQuestion(question, rng));
}

export function isCorrectChoice(
  question: PresentedQuestion,
  choiceIndex: number,
): boolean {
  return choiceIndex === question.correctIndex;
}

export function tallyScore(correctFlags: readonly boolean[]): {
  score: number;
  total: number;
  percentage: number;
} {
  const score = correctFlags.reduce((sum, correct) => sum + (correct ? 1 : 0), 0);
  const total = correctFlags.length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percentage };
}
