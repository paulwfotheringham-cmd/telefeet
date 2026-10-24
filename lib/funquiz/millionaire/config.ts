/** Virtual prize ladder values (USD, not real money). */
export const MILLIONAIRE_LADDER = [
  100, 200, 500, 1_000, 5_000, 10_000, 25_000, 100_000, 250_000, 1_000_000,
] as const;

export const MILLIONAIRE_QUESTION_COUNT = MILLIONAIRE_LADDER.length;

/** 0-based question indices that act as safety nets once passed correctly. */
export const MILLIONAIRE_SAFETY_NET_INDICES = new Set<number>([2, 5]);

export const MILLIONAIRE_REVEAL_MS = 3_500;
export const MILLIONAIRE_DISCUSSION_MS = 45_000;

export type MillionaireLifelineId = "fifty_fifty" | "ask_team" | "change_question";

export const MILLIONAIRE_LIFELINES: MillionaireLifelineId[] = [
  "fifty_fifty",
  "ask_team",
  "change_question",
];

export function targetPrizeForQuestionIndex(index: number): number {
  return MILLIONAIRE_LADDER[index] ?? 0;
}

export function securedPrizeAfterCorrect(
  previousSecured: number,
  completedQuestionIndex: number,
): number {
  const prize = targetPrizeForQuestionIndex(completedQuestionIndex);
  return Math.max(previousSecured, prize);
}

/** Highest safety-net value the team has passed (0 if none). */
export function safetyNetFloor(completedHighestIndex: number): number {
  let floor = 0;
  for (const idx of MILLIONAIRE_SAFETY_NET_INDICES) {
    if (idx <= completedHighestIndex) {
      floor = Math.max(floor, MILLIONAIRE_LADDER[idx]!);
    }
  }
  return floor;
}

export function awardOnFailure(securedPrize: number): number {
  return securedPrize;
}
