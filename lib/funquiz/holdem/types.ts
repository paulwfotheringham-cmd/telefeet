export type HoldemStreet = "preflop" | "flop" | "turn" | "river" | "showdown" | "hand_over";

export type HoldemState = {
  dealerSeat: 0 | 1;
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
  lastRaiseSize: number;
  smallBlind: number;
  bigBlind: number;
  statusMessage: string | null;
  lastHandSummary: string | null;
  actedThisStreet: Record<string, boolean>;
};

export const HOLDEM_STARTING_STACK = 1000;
export const HOLDEM_SMALL_BLIND = 10;
export const HOLDEM_BIG_BLIND = 20;

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
    lastRaiseSize: HOLDEM_BIG_BLIND,
    smallBlind: HOLDEM_SMALL_BLIND,
    bigBlind: HOLDEM_BIG_BLIND,
    statusMessage: null,
    lastHandSummary: null,
    actedThisStreet: {},
  };
}
