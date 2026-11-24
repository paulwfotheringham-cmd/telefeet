import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE, type QuizCategoryId } from "../categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE } from "../difficulties";
import type { QuizDifficulty } from "../difficulties";
import { QUIZ_QUESTIONS } from "../question-bank";
import { isTooEasyForHardQuestion } from "../question-bank/difficulty-quality";
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

function tierForStep(step: number, roomDifficulty: QuizDifficulty): QuizDifficulty {
  if (roomDifficulty === QUIZ_DIFFICULTY_HARD) return QUIZ_DIFFICULTY_HARD;
  return MILLIONAIRE_TIER_DIFFICULTY[step]!;
}

function inCategory(
  q: (typeof QUIZ_QUESTIONS)[number],
  categoryId: QuizCategoryId,
): boolean {
  if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
    return Boolean(q.generalKnowledgeSubjects && q.generalKnowledgeSubjects.length > 0);
  }
  return q.categoryId === categoryId;
}

function poolFor(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
  skipTrivia: boolean,
): number[] {
  return QUIZ_QUESTIONS.filter((q) => {
    if (q.estimate) return false;
    if (!inCategory(q, categoryId) || q.difficulty !== difficulty) return false;
    if (skipTrivia && isTooEasyForHardQuestion(q)) return false;
    return true;
  }).map((q) => q.id);
}

export function selectMillionaireQuestionIds(
  categoryId: QuizCategoryId,
  excludeOrRandom: number[] | (() => number) = [],
  random: () => number = Math.random,
  roomDifficulty: QuizDifficulty = QUIZ_DIFFICULTY_INTERMEDIATE,
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
    const difficulty = tierForStep(step, roomDifficulty);
    let pool = shuffleWithRng(poolFor(categoryId, difficulty, true), rng).filter(
      (id) => !used.has(id),
    );
    if (pool.length === 0) {
      pool = shuffleWithRng(poolFor(categoryId, difficulty, false), rng).filter(
        (id) => !used.has(id),
      );
    }
    if (pool.length === 0) {
      pool = shuffleWithRng(
        QUIZ_QUESTIONS.filter((q) => inCategory(q, categoryId) && !used.has(q.id)).map(
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
  let pool = shuffleWithRng(poolFor(categoryId, difficulty, true), random).filter(
    (id) => !used.has(id),
  );
  if (pool.length === 0) {
    pool = shuffleWithRng(poolFor(categoryId, difficulty, false), random).filter(
      (id) => !used.has(id),
    );
  }
  if (pool.length === 0) {
    pool = shuffleWithRng(
      QUIZ_QUESTIONS.filter((q) => inCategory(q, categoryId) && !used.has(q.id)).map(
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
