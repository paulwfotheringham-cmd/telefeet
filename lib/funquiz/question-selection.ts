import {
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  type QuizCategoryId,
} from "./categories";
import { QUIZ_DIFFICULTY_EASY, QUIZ_DIFFICULTY_INTERMEDIATE, type QuizDifficulty } from "./difficulties";
import { QUESTIONS_PER_GAME } from "./constants";
import { QUIZ_QUESTIONS } from "./question-bank";
import type { GeneralKnowledgeSubject } from "./question-bank/types";

export class InsufficientQuestionsError extends Error {
  constructor(
    readonly categoryId: QuizCategoryId,
    readonly difficulty: QuizDifficulty,
    readonly available: number,
    needed: number = QUESTIONS_PER_GAME,
  ) {
    super(
      `Not enough questions for category "${categoryId}" at "${difficulty}" difficulty: need ${needed}, found ${available}.`,
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

/** Easy uses the familiar question set. Several subjects only have 50 of those, which a full game needs. */
function bankDifficulty(difficulty: QuizDifficulty): QuizDifficulty {
  return difficulty === QUIZ_DIFFICULTY_EASY ? QUIZ_DIFFICULTY_INTERMEDIATE : difficulty;
}

function eligibleForCategoryAndDifficulty(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
): number[] {
  const stored = bankDifficulty(difficulty);
  if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
    return QUIZ_QUESTIONS.filter(
      (q) =>
        q.difficulty === stored &&
        q.generalKnowledgeSubjects &&
        q.generalKnowledgeSubjects.length > 0,
    ).map((q) => q.id);
  }
  return QUIZ_QUESTIONS.filter(
    (q) => q.categoryId === categoryId && q.difficulty === stored,
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

function selectBalancedGeneralKnowledge(pool: number[], needed: number): number[] {
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
  while (picked.size < needed && guard < needed * 20) {
    guard++;
    for (const subject of GK_SUBJECTS) {
      if (picked.size >= needed) break;
      const list = bySubject.get(subject);
      if (!list?.length) continue;
      const next = list.shift();
      if (next !== undefined && !picked.has(next)) picked.add(next);
    }
  }
  if (picked.size < needed) {
    const rest = shuffleInPlace(pool.filter((id) => !picked.has(id)));
    for (const id of rest) {
      if (picked.size >= needed) break;
      picked.add(id);
    }
  }
  return shuffleInPlace([...picked]).slice(0, needed);
}

export function selectQuestionIdsForCategory(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
  excludeBankIds: number[] = [],
  needed: number = QUESTIONS_PER_GAME,
): number[] {
  const exclude = new Set(excludeBankIds);
  const pool = eligibleForCategoryAndDifficulty(categoryId, difficulty).filter(
    (id) => !exclude.has(id),
  );
  if (pool.length < needed) {
    throw new InsufficientQuestionsError(categoryId, difficulty, pool.length, needed);
  }
  if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
    return selectBalancedGeneralKnowledge(pool, needed);
  }
  return shuffleInPlace([...pool]).slice(0, needed);
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
      out[q.categoryId] = { easy: 0, intermediate: 0, hard: 0 };
    }
    out[q.categoryId]![q.difficulty]++;
  }
  const gk = { easy: 0, intermediate: 0, hard: 0 };
  for (const q of QUIZ_QUESTIONS) {
    if (q.generalKnowledgeSubjects && q.generalKnowledgeSubjects.length > 0) {
      gk[q.difficulty]++;
    }
  }
  out[QUIZ_CATEGORY_GENERAL_KNOWLEDGE] = gk;
  for (const row of Object.values(out)) {
    row.easy = row.intermediate;
  }
  return out;
}
