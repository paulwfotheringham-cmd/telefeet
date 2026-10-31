import {
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  type QuizCategoryId,
} from "./categories";
import { QUIZ_DIFFICULTY_HARD, type QuizDifficulty } from "./difficulties";
import { QUESTIONS_PER_GAME } from "./constants";
import { getQuestionByBankId, QUIZ_QUESTIONS } from "./question-bank";
import type { GeneralKnowledgeSubject } from "./question-bank/types";
import { isTooEasyForHardQuestion } from "./question-bank/difficulty-quality";
import { normalizeQuizPrompt, questionDedupeKey } from "./question-prompt-key";
import { randomUnit, shuffleInPlace } from "./random";

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

function playedDedupeKeys(excludeBankIds: number[]): Set<string> {
  const keys = new Set<string>();
  for (const id of excludeBankIds) {
    keys.add(questionDedupeKey(getQuestionByBankId(id)));
  }
  return keys;
}

function refineHardPool(categoryId: QuizCategoryId, pool: number[]): number[] {
  const strict = pool.filter((id) => !isTooEasyForHardQuestion(getQuestionByBankId(id)));
  const curated = strict.filter((id) => getQuestionByBankId(id).curatedHard);
  if (curated.length >= QUESTIONS_PER_GAME) {
    return curated;
  }
  const curatedSet = new Set(curated);
  const filler = strict.filter((id) => !curatedSet.has(id));
  return [...curated, ...filler];
}

function filterPoolForSession(
  pool: number[],
  excludeBankIds: number[],
  excludeKeys: Set<string>,
): number[] {
  const excludeIds = new Set(excludeBankIds);
  return pool.filter((id) => {
    const q = getQuestionByBankId(id);
    const key = questionDedupeKey(q);
    if (excludeIds.has(id)) return false;
    if (excludeKeys.has(key)) return false;
    return true;
  });
}

function pickUniquePromptIds(
  pool: number[],
  count: number,
  random: () => number,
): number[] {
  const shuffled = shuffleInPlace([...pool], random);
  const picked: number[] = [];
  const seenKeys = new Set<string>();
  for (const id of shuffled) {
    if (picked.length >= count) break;
    const key = questionDedupeKey(getQuestionByBankId(id));
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    picked.push(id);
  }
  return picked;
}

function resolvePoolWithHistory(
  basePool: number[],
  excludeBankIds: number[],
  random: () => number,
): number[] {
  const playedKeys = playedDedupeKeys(excludeBankIds);

  let candidates = filterPoolForSession(basePool, excludeBankIds, playedKeys);
  if (candidates.length < QUESTIONS_PER_GAME) {
    candidates = filterPoolForSession(basePool, [], playedKeys);
  }
  if (candidates.length < QUESTIONS_PER_GAME && excludeBankIds.length === 0) {
    candidates = [...basePool];
  }

  const picked = pickUniquePromptIds(candidates, QUESTIONS_PER_GAME, random);
  return picked;
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

function selectBalancedGeneralKnowledge(
  pool: number[],
  random: () => number,
): number[] {
  const bySubject = new Map<GeneralKnowledgeSubject, number[]>();
  for (const id of pool) {
    const q = getQuestionByBankId(id);
    for (const subject of q.generalKnowledgeSubjects ?? []) {
      if (!bySubject.has(subject)) bySubject.set(subject, []);
      bySubject.get(subject)!.push(id);
    }
  }
  for (const list of bySubject.values()) shuffleInPlace(list, random);

  const picked = new Set<number>();
  const seenKeys = new Set<string>();
  let guard = 0;
  while (picked.size < QUESTIONS_PER_GAME && guard < QUESTIONS_PER_GAME * 30) {
    guard++;
    for (const subject of GK_SUBJECTS) {
      if (picked.size >= QUESTIONS_PER_GAME) break;
      const list = bySubject.get(subject);
      if (!list?.length) continue;
      while (list.length > 0) {
        const next = list.shift()!;
        const key = questionDedupeKey(getQuestionByBankId(next));
        if (seenKeys.has(key)) continue;
        if (!picked.has(next)) {
          picked.add(next);
          seenKeys.add(key);
        }
        break;
      }
    }
  }
  if (picked.size < QUESTIONS_PER_GAME) {
    const rest = shuffleInPlace(
      pool.filter((id) => !picked.has(id)),
      random,
    );
    for (const id of rest) {
      if (picked.size >= QUESTIONS_PER_GAME) break;
      const key = questionDedupeKey(getQuestionByBankId(id));
      if (seenKeys.has(key)) continue;
      picked.add(id);
      seenKeys.add(key);
    }
  }
  return shuffleInPlace([...picked], random).slice(0, QUESTIONS_PER_GAME);
}

export function selectQuestionIdsForCategory(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
  excludeBankIds: number[] = [],
  random: () => number = randomUnit,
): number[] {
  let basePool = eligibleForCategoryAndDifficulty(categoryId, difficulty);
  if (difficulty === QUIZ_DIFFICULTY_HARD) {
    basePool = refineHardPool(categoryId, basePool);
  }

  const picked = resolvePoolWithHistory(basePool, excludeBankIds, random);

  if (picked.length < QUESTIONS_PER_GAME) {
    throw new InsufficientQuestionsError(categoryId, difficulty, picked.length);
  }

  if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) {
    const gkPool = filterPoolForSession(basePool, excludeBankIds, playedDedupeKeys(excludeBankIds));
    const gkCandidates =
      gkPool.length >= QUESTIONS_PER_GAME
        ? gkPool
        : basePool.length >= QUESTIONS_PER_GAME
          ? basePool
          : gkPool;
    if (gkCandidates.length < QUESTIONS_PER_GAME) {
      throw new InsufficientQuestionsError(categoryId, difficulty, gkCandidates.length);
    }
    return selectBalancedGeneralKnowledge(gkCandidates, random);
  }

  return shuffleInPlace(picked, random);
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
