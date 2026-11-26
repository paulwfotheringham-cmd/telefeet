export const STARTING_BALANCE = 500;
export const MIN_BET = 5;
export const MAX_BET = 100;
export const CHIP_DENOMINATIONS = [5, 10, 25, 50, 100, 250, 500] as const;
export type ChipDenomination = (typeof CHIP_DENOMINATIONS)[number];

export const BLACKJACK_PAYOUT_NUM = 3;
export const BLACKJACK_PAYOUT_DEN = 2;

export const DEALER_HITS_SOFT_17 = true;

export const AI_NAMES = ["Alex", "Jordan", "Sam"] as const;