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

function uniqueQuestions(questions: readonly GameQuestion[]): GameQuestion[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: GameQuestion[] = [];
  for (const question of questions) {
    if (seenIds.has(question.id) || seenTitles.has(question.title)) continue;
    seenIds.add(question.id);
    seenTitles.add(question.title);
    unique.push(question);
  }
  return unique;
}

function optionSignature(options: readonly string[]): string {
  return [...options].sort().join("\n");
}

function distractorOrder(
  question: GameQuestion,
  pool: readonly GameQuestion[],
  rng: () => number,
): GameQuestion[] {
  const others = pool.filter((other) => other.id !== question.id && other.title !== question.title);
  const samePlatform = shuffle(
    others.filter((other) => other.platform === question.platform),
    rng,
  );
  const used = new Set(samePlatform.map((other) => other.id));
  const sameDecade = others
    .filter((other) => other.decade === question.decade && !used.has(other.id))
    .sort(
      (a, b) =>
        Math.abs(a.year - question.year) - Math.abs(b.year - question.year) ||
        a.title.localeCompare(b.title),
    );
  const near = shuffle(sameDecade.slice(0, 8), rng);
  const far = [
    ...sameDecade.slice(8),
    ...shuffle(
      others.filter((other) => other.decade !== question.decade && !used.has(other.id)),
      rng,
    ),
  ];
  return uniqueQuestions([...samePlatform, ...near, ...far]);
}

function distractorTitles(ordered: readonly GameQuestion[], skip: number): string[] {
  const titles: string[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < ordered.length && titles.length < 3; index++) {
    const candidate = ordered[(skip + index) % ordered.length];
    if (!candidate || seen.has(candidate.title)) continue;
    seen.add(candidate.title);
    titles.push(candidate.title);
  }
  return titles;
}

export function presentQuestion(
  question: GameQuestion,
  rng: () => number,
  pool: readonly GameQuestion[],
  usedOptionSets: ReadonlySet<string> = new Set(),
): PresentedGame {
  const ordered = distractorOrder(question, pool, rng);
  let distractors = distractorTitles(ordered, 0);
  for (let skip = 1; skip < ordered.length; skip++) {
    const options = [question.title, ...distractors];
    if (new Set(options).size === 4 && !usedOptionSets.has(optionSignature(options))) break;
    distractors = distractorTitles(ordered, skip);
  }
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
  const pool = uniqueQuestions(questionsForEra(era, bank));
  if (pool.length < count) {
    throw new InsufficientGameQuestionsError(era, pool.length, count);
  }
  const chosen = shuffle(pool, rng).slice(0, count);
  const usedOptionSets = new Set<string>();
  return chosen.map((question) => {
    const presented = presentQuestion(question, rng, pool, usedOptionSets);
    usedOptionSets.add(optionSignature(presented.options));
    return presented;
  });
}
