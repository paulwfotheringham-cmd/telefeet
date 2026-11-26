export type Suit = "s" | "h" | "d" | "c";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K";

export type TableMode = "solo" | "withAi" | "hostTable";

export type GamePhase =
  | "setup"
  | "betting"
  | "dealing"
  | "playerTurn"
  | "dealerTurn"
  | "settling"
  | "roundComplete";

export type HandOutcome =
  | "blackjack"
  | "win"
  | "lose"
  | "push"
  | "bust"
  | "dealer_bust"
  | null;

export interface PlayingCard {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  dealKey?: string;
}

export interface HandState {
  id: string;
  cards: PlayingCard[];
  bet: number;
  doubled: boolean;
  stood: boolean;
  busted: boolean;
  surrendered?: boolean;
  outcome: HandOutcome;
  outcomeLabel: string;
  payout: number;
}

export interface SeatState {
  id: string;
  name: string;
  isHuman: boolean;
  balance: number;
  pendingBet: number;
  hands: HandState[];
  betPlaced: boolean;
}

export interface DealerState {
  cards: PlayingCard[];
}

export interface SessionStats {
  balance: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pushes: number;
  sessionPl: number;
  startedAt: number;
}

export interface BlackjackGameState {
  phase: GamePhase;
  mode: TableMode;
  aiSeatCount: number;
  seats: SeatState[];
  dealer: DealerState;
  deck: PlayingCard[];
  activeSeatIndex: number;
  activeHandIndex: number;
  dealerRevealed: boolean;
  banner: string;
  humanSeatId: string;
}

export type BlackjackAction =
  | { type: "SET_MODE"; mode: TableMode; aiCount?: number }
  | { type: "SET_AI_COUNT"; count: number }
  | { type: "SELECT_CHIP"; amount: number }
  | { type: "ADD_BET" }
  | { type: "REMOVE_BET" }
  | { type: "CLEAR_BET" }
  | { type: "PLACE_BET" }
  | { type: "DEAL" }
  | { type: "HIT" }
  | { type: "STAND" }
  | { type: "DOUBLE" }
  | { type: "SPLIT" }
  | { type: "AI_TICK" }
  | { type: "DEALER_STEP" }
  | { type: "FINISH_ROUND" }
  | { type: "NEW_ROUND" }
  | { type: "RESET_SESSION" };