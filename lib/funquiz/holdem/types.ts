export type HoldemStreet = "preflop" | "flop" | "turn" | "river" | "showdown" | "hand_over";

/** Single-player tables seat this many AI opponents beside the human. */
export const HOLDEM_AI_COUNT = 2;
export const HOLDEM_AI_NAMES = ["AI River", "AI Bluff"] as const;

export function isHoldemAiId(playerId: string): boolean {
  return playerId.startsWith("ai-holdem-");
}

export type HoldemState = {
  dealerSeat: number;
  handNumber: number;
  street: HoldemStreet;
  deck: number[];
  board: number[];
  holeCards: Record<string, [number, number]>;
  stacks: Record<string, number>;
  pot: number;
  currentBet: number;
  streetBets: Record<string, number>;
  folded: Record<string, boolean>;
  allIn: Record<string, boolean>;
  actionOn: string | null;
  /** Epoch ms when the acting player must act or auto check/fold. */
  actionDeadlineAt: number | null;
  lastRaiseSize: number;
  smallBlind: number;
  bigBlind: number;
  statusMessage: string | null;
  lastHandSummary: string | null;
  actedThisStreet: Record<string, boolean>;
};

export const HOLDEM_STARTING_STACK = 500;
/** Big blind / minimum opening bet. */
export const HOLDEM_BIG_BLIND = 5;
export const HOLDEM_SMALL_BLIND = 2;
/** Cap on how much a raise may increase the current bet. */
export const HOLDEM_MAX_RAISE = 25;
/** Max time each player has to act. */
export const HOLDEM_TURN_MS = 60_000;

export function createInitialHoldemState(): HoldemState {
  return {
    dealerSeat: 0,
    handNumber: 0,
    street: "hand_over",
    deck: [],
    board: [],
    holeCards: {},
    stacks: {},
    pot: 0,
    currentBet: 0,
    streetBets: {},
    folded: {},
    allIn: {},
    actionOn: null,
    actionDeadlineAt: null,
    lastRaiseSize: HOLDEM_BIG_BLIND,
    smallBlind: HOLDEM_SMALL_BLIND,
    bigBlind: HOLDEM_BIG_BLIND,
    statusMessage: null,
    lastHandSummary: null,
    actedThisStreet: {},
  };
}
