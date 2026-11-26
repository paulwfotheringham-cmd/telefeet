import { dealerShouldHit, handTotals } from "./hand";
import { sameSplitRank, rankValue } from "./deck";
import type { HandState, SeatState } from "./types";
import { DEALER_HITS_SOFT_17 } from "./constants";

export type AiDecision = "hit" | "stand" | "double" | "split";

export function aiDecisionForHand(
  hand: HandState,
  dealerUpRank: string,
  canDouble: boolean,
  canSplit: boolean,
  balance: number,
): AiDecision {
  const { total } = handTotals(hand.cards);
  if (canSplit && hand.cards.length === 2) {
    const [a, b] = hand.cards;
    if (a && b) {
      if (a.rank === "A" && b.rank === "A") return "split";
      if (rankValue(a.rank) === 10 && rankValue(b.rank) === 10) return "stand";
      if (sameSplitRank(a.rank, b.rank) && rankValue(a.rank) === 8) return "split";
    }
  }
  if (canDouble && hand.cards.length === 2 && total === 11 && balance >= hand.bet) {
    return "double";
  }
  if (canDouble && hand.cards.length === 2 && total === 10 && balance >= hand.bet) {
    const up = dealerUpRank === "A" ? 11 : rankValue(dealerUpRank as never);
    if (up < 10) return "double";
  }
  if (total >= 17) return "stand";
  if (total <= 11) return "hit";
  if (total === 12) {
    const up = dealerUpRank === "A" ? 11 : rankValue(dealerUpRank as never);
    if (up >= 4 && up <= 6) return "stand";
    return "hit";
  }
  if (total >= 13 && total <= 16) {
    const up = dealerUpRank === "A" ? 11 : rankValue(dealerUpRank as never);
    if (up >= 2 && up <= 6) return "stand";
    return "hit";
  }
  return total > 21 ? "stand" : "hit";
}

export function dealerPlayDone(cards: { rank: string; faceDown?: boolean; suit: string }[]): boolean {
  return !dealerShouldHit(cards as never, DEALER_HITS_SOFT_17);
}

export function humanShouldAct(seat: SeatState, hand: HandState): boolean {
  if (!seat.isHuman) return false;
  if (hand.stood || hand.busted || hand.doubled) return false;
  const { isBlackjack } = handTotals(hand.cards);
  if (isBlackjack) return false;
  return true;
}