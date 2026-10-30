import type { QuizCategoryId } from "../categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE } from "../difficulties";
import type { QuizDifficulty } from "../difficulties";
import { QUIZ_QUESTIONS } from "../question-bank";
import { InsufficientQuestionsError } from "../question-selection";
import { MILLIONAIRE_QUESTION_COUNT } from "./config";

/** Difficulty tier per ladder step (0-based index). */
export const MILLIONAIRE_TIER_DIFFICULTY: QuizDifficulty[] = [
  QUIZ_DIFFICULTY_INTERMEDIATE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
  QUIZ_DIFFICULTY_HARD,
  QUIZ_DIFFICULTY_HARD,
  QUIZ_DIFFICULTY_HARD,
  QUIZ_DIFFICULTY_HARD,
  QUIZ_DIFFICULTY_HARD,
];

function shuffleWithRng<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function poolFor(categoryId: QuizCategoryId, difficulty: QuizDifficulty): number[] {
  return QUIZ_QUESTIONS.filter(
    (q) => q.categoryId === categoryId && q.difficulty === difficulty,
  ).map((q) => q.id);
}

export function selectMillionaireQuestionIds(
  categoryId: QuizCategoryId,
  excludeOrRandom: number[] | (() => number) = [],
  random: () => number = Math.random,
): number[] {
  let excludeBankIds: number[] = [];
  let rng = random;
  if (typeof excludeOrRandom === "function") {
    rng = excludeOrRandom;
  } else {
    excludeBankIds = excludeOrRandom;
  }
  const picked: number[] = [];
  const used = new Set<number>(excludeBankIds);

  for (let step = 0; step < MILLIONAIRE_QUESTION_COUNT; step++) {
    const difficulty = MILLIONAIRE_TIER_DIFFICULTY[step]!;
    let pool = shuffleWithRng(poolFor(categoryId, difficulty), rng).filter(
      (id) => !used.has(id),
    );
    if (pool.length === 0) {
      pool = shuffleWithRng(
        QUIZ_QUESTIONS.filter((q) => q.categoryId === categoryId && !used.has(q.id)).map(
          (q) => q.id,
        ),
        rng,
      );
    }
    if (pool.length === 0) {
      throw new InsufficientQuestionsError(categoryId, difficulty, 0);
    }
    const id = pool[0]!;
    used.add(id);
    picked.push(id);
  }

  return picked;
}

export function replacementQuestionId(
  categoryId: QuizCategoryId,
  stepIndex: number,
  used: Set<number>,
  random: () => number = Math.random,
): number {
  const difficulty = MILLIONAIRE_TIER_DIFFICULTY[stepIndex]!;
  let pool = shuffleWithRng(poolFor(categoryId, difficulty), random).filter(
    (id) => !used.has(id),
  );
  if (pool.length === 0) {
    pool = shuffleWithRng(
      QUIZ_QUESTIONS.filter((q) => q.categoryId === categoryId && !used.has(q.id)).map(
        (q) => q.id,
      ),
      random,
    );
  }
  if (pool.length === 0) {
    throw new InsufficientQuestionsError(categoryId, difficulty, 0);
  }
  return pool[0]!;
}
