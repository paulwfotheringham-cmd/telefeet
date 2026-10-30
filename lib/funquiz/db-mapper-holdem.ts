import type { HoldemState } from "./holdem/types";
import { createInitialHoldemState } from "./holdem/types";

export function parseHoldemState(raw: unknown): HoldemState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.dealerSeat !== "number") return undefined;
  const base = createInitialHoldemState();
  return {
    ...base,
    dealerSeat: r.dealerSeat === 1 ? 1 : 0,
    handNumber: typeof r.handNumber === "number" ? r.handNumber : 0,
    street:
      r.street === "preflop" ||
      r.street === "flop" ||
      r.street === "turn" ||
      r.street === "river" ||
      r.street === "showdown" ||
      r.street === "hand_over"
        ? r.street
        : base.street,
    deck: Array.isArray(r.deck) ? (r.deck as number[]) : [],
    board: Array.isArray(r.board) ? (r.board as number[]) : [],
    holeCards:
      r.holeCards && typeof r.holeCards === "object"
        ? (r.holeCards as HoldemState["holeCards"])
        : {},
    stacks:
      r.stacks && typeof r.stacks === "object"
        ? (r.stacks as Record<string, number>)
        : {},
    pot: typeof r.pot === "number" ? r.pot : 0,
    currentBet: typeof r.currentBet === "number" ? r.currentBet : 0,
    streetBets:
      r.streetBets && typeof r.streetBets === "object"
        ? (r.streetBets as Record<string, number>)
        : {},
    folded:
      r.folded && typeof r.folded === "object"
        ? (r.folded as Record<string, boolean>)
        : {},
    allIn:
      r.allIn && typeof r.allIn === "object" ? (r.allIn as Record<string, boolean>) : {},
    actionOn: typeof r.actionOn === "string" ? r.actionOn : null,
    lastRaiseSize: typeof r.lastRaiseSize === "number" ? r.lastRaiseSize : base.lastRaiseSize,
    statusMessage: typeof r.statusMessage === "string" ? r.statusMessage : null,
    lastHandSummary: typeof r.lastHandSummary === "string" ? r.lastHandSummary : null,
    actedThisStreet:
      r.actedThisStreet && typeof r.actedThisStreet === "object"
        ? (r.actedThisStreet as Record<string, boolean>)
        : {},
  };
}
