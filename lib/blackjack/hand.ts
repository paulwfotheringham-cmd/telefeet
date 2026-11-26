import { rankValue } from "./deck";
import type { PlayingCard, Rank } from "./types";

export type HandTotals = {
  total: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBust: boolean;
};

export function handTotals(cards: PlayingCard[], holeCounts = true): HandTotals {
  const visible = holeCounts ? cards.filter((c) => !c.faceDown) : cards;
  let total = 0;
  let aces = 0;
  for (const c of visible) {
    if (c.rank === "A") aces++;
    total += rankValue(c.rank as Rank);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  const isSoft = visible.some((c) => c.rank === "A") && total <= 21 && aces > 0;
  const isBlackjack =
    visible.length === 2 && total === 21 && visible.some((c) => c.rank === "A");
  return {
    total,
    isSoft,
    isBlackjack,
    isBust: total > 21,
  };
}

export function dealerShouldHit(cards: PlayingCard[], hitsSoft17: boolean): boolean {
  const { total, isSoft } = handTotals(cards);
  if (total < 17) return true;
  if (total === 17 && isSoft && hitsSoft17) return true;
  return false;
}

export function displayScore(cards: PlayingCard[], revealAll: boolean): string {
  if (cards.length === 0) return "—";
  const useCards = revealAll ? cards : cards.filter((c) => !c.faceDown);
  if (!revealAll && cards.some((c) => c.faceDown)) {
    const partial = handTotals(useCards);
    return `${partial.total}`;
  }
  const { total, isSoft } = handTotals(cards);
  if (total > 21) return `${total}`;
  return isSoft ? `${total}` : `${total}`;
}