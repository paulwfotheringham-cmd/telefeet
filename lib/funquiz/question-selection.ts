import {
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  type QuizCategoryId,
} from "./categories";
import type { QuizDifficulty } from "./difficulties";
import { QUESTIONS_PER_GAME } from "./constants";
import { QUIZ_QUESTIONS } from "./question-bank";
import type { GeneralKnowledgeSubject } from "./question-bank/types";

export class InsufficientQuestionsError extends Error {
  constructor(
    readonly categoryId: QuizCategoryId,
    readonly difficulty: QuizDifficulty,
    readonly available: number,
  ) {
    super(
      `Not enough questions for category "${categoryId}" at "${difficulty}" difficulty: need ${QUESTIONS_PER_GAME}, found ${available}.`,
    );
    this.name = "InsufficientQuestionsError";
  }
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function eligibleForCategoryAndDifficulty(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
): number[] {
  if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
    return QUIZ_QUESTIONS.filter(
      (q) =>
        q.difficulty === difficulty &&
        q.generalKnowledgeSubjects &&
        q.generalKnowledgeSubjects.length > 0,
    ).map((q) => q.id);
  }
  return QUIZ_QUESTIONS.filter(
    (q) => q.categoryId === categoryId && q.difficulty === difficulty,
  ).map((q) => q.id);
}

const GK_SUBJECTS: GeneralKnowledgeSubject[] = [
  "science",
  "space",
  "history",
  "geography",
  "military",
  "culture",
  "technology",
];

function selectBalancedGeneralKnowledge(pool: number[]): number[] {
  const bySubject = new Map<GeneralKnowledgeSubject, number[]>();
  for (const id of pool) {
    const q = QUIZ_QUESTIONS.find((x) => x.id === id)!;
    for (const subject of q.generalKnowledgeSubjects ?? []) {
      if (!bySubject.has(subject)) bySubject.set(subject, []);
      bySubject.get(subject)!.push(id);
    }
  }
  for (const list of bySubject.values()) shuffleInPlace(list);

  const picked = new Set<number>();
  let guard = 0;
  while (picked.size < QUESTIONS_PER_GAME && guard < QUESTIONS_PER_GAME * 20) {
    guard++;
    for (const subject of GK_SUBJECTS) {
      if (picked.size >= QUESTIONS_PER_GAME) break;
      const list = bySubject.get(subject);
      if (!list?.length) continue;
      const next = list.shift();
      if (next !== undefined && !picked.has(next)) picked.add(next);
    }
  }
  if (picked.size < QUESTIONS_PER_GAME) {
    const rest = shuffleInPlace(pool.filter((id) => !picked.has(id)));
    for (const id of rest) {
      if (picked.size >= QUESTIONS_PER_GAME) break;
      picked.add(id);
    }
  }
  return shuffleInPlace([...picked]).slice(0, QUESTIONS_PER_GAME);
}

export function selectQuestionIdsForCategory(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
): number[] {
  const pool = eligibleForCategoryAndDifficulty(categoryId, difficulty);
  if (pool.length < QUESTIONS_PER_GAME) {
    throw new InsufficientQuestionsError(categoryId, difficulty, pool.length);
  }
  if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
    return selectBalancedGeneralKnowledge(pool);
  }
  return shuffleInPlace([...pool]).slice(0, QUESTIONS_PER_GAME);
}

export function categoryDifficultyCapacity(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
): number {
  return eligibleForCategoryAndDifficulty(categoryId, difficulty).length;
}

export function countQuestionsByCategoryAndDifficulty(): Record<
  string,
  Record<QuizDifficulty, number>
> {
  const out = {} as Record<string, Record<QuizDifficulty, number>>;
  for (const q of QUIZ_QUESTIONS) {
    if (!out[q.categoryId]) {
      out[q.categoryId] = { intermediate: 0, hard: 0 };
    }
    out[q.categoryId]![q.difficulty]++;
  }
  const gk = { intermediate: 0, hard: 0 };
  for (const q of QUIZ_QUESTIONS) {
    if (q.generalKnowledgeSubjects && q.generalKnowledgeSubjects.length > 0) {
      gk[q.difficulty]++;
    }
  }
  out[QUIZ_CATEGORY_GENERAL_KNOWLEDGE] = gk;
  return out;
}
