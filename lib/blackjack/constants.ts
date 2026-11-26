export const STARTING_BALANCE = 500;
export const MIN_BET = 5;
export const MAX_BET = 100;
export const CHIP_DENOMINATIONS = [5, 10, 25, 50, 100, 250, 500] as const;
/** Chip row on table footer (matches reference mockup). */
export const TABLE_CHIP_DENOMINATIONS = [10, 25, 50, 100, 250, 500] as const;
export type ChipDenomination = (typeof CHIP_DENOMINATIONS)[number];

export const BLACKJACK_PAYOUT_NUM = 3;
export const BLACKJACK_PAYOUT_DEN = 2;

export const DEALER_HITS_SOFT_17 = true;

export const AI_NAMES = ["Alex", "Jordan", "Sam", "Riley", "Casey"] as const;

/** Player seats at the felt (dealer is separate, front-center). */
export const TABLE_SEAT_COUNT = 5;

/** AI seats to fill the table: 5 total minus humans (solo = 1 + 4 AI). */
export function aiSeatsForHumanCount(humanCount: number): number {
  const humans = Math.min(TABLE_SEAT_COUNT, Math.max(1, humanCount));
  return TABLE_SEAT_COUNT - humans;
}