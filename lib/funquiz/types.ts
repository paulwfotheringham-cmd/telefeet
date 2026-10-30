import type { QuizCategoryId } from "./categories";
import type { QuizDifficulty } from "./difficulties";
import type { HoldemState } from "./holdem/types";
import type { MillionaireState } from "./millionaire/types";
import type { PlayedBankIdsByTopic } from "./question-history";

export type GameMode =
  | "take_turns"
  | "play_together"
  | "shared_millionaire"
  | "parallel_millionaire"
  | "texas_holdem";

export type QuizOptionList =
  | readonly [string, string, string]
  | readonly [string, string, string, string];

export type QuizPhase =
  | "lobby"
  | "question"
  | "discussion"
  | "reveal"
  | "finished"
  | "won"
  | "lost"
  | "walkaway";

export type QuizPlayer = {
  id: string;
  name: string;
  score: number;
  /** Selected option index for current question, or null if not yet answered */
  answer: number | null;
};

export type AnswerLogEntry = {
  sessionId: string;
  turnIndex: number;
  bankId: number;
  playerId: string;
  choiceIndex: number;
  correct: boolean;
};

export type QuizRoom = {
  code: string;
  hostId: string;
  gameMode: GameMode;
  quizCategoryId: QuizCategoryId;
  quizDifficulty: QuizDifficulty;
  sessionId: string;
  phase: QuizPhase;
  questionIndex: number;
  /** Shuffled order of 50 question bank ids (play_together authoritative list) */
  questionOrder: number[];
  hostQuestionOrder: number[];
  guestQuestionOrder: number[];
  turnIndex: number;
  activePlayerId: string | null;
  jointScore: number;
  answerLog: AnswerLogEntry[];
  players: QuizPlayer[];
  revealStartedAt: number | null;
  millionaire?: MillionaireState;
  holdem?: HoldemState;
  /** Bank question IDs already used in prior games in this room, keyed by topic (category:difficulty or category:millionaire). */
  playedBankIdsByTopic: PlayedBankIdsByTopic;
  createdAt: number;
  updatedAt: number;
  /** ISO timestamp last read from `funquiz_rooms.updated_at` (optimistic concurrency). */
  dbUpdatedAtIso?: string;
};

export type PublicQuizQuestion = {
  id: number;
  prompt: string;
  options: QuizOptionList;
  category: string;
  outlineImageUrl?: string;
  flagImageUrl?: string;
};

export type ScorecardPlayerBar = {
  id: string;
  name: string;
  correct: number;
  total: number;
};

export type ScorecardSeriesPoint = {
  label: string;
  value: number;
};

export type ScorecardData =
  | {
      kind: "take_turns";
      players: ScorecardPlayerBar[];
    }
  | {
      kind: "play_together";
      correct: number;
      total: number;
      cumulativeSeries: ScorecardSeriesPoint[];
    }
  | {
      kind: "millionaire";
      questionsAnswered: number;
      totalQuestions: number;
      correctCount: number;
      finalPrize: number;
      maxPrize: number;
      stepSeries: ScorecardSeriesPoint[];
    };

export type ResultRow = {
  turnIndex: number;
  bankId: number;
  playerId: string;
  playerName: string;
  choiceIndex: number | null;
  correctIndex: number;
  correct: boolean;
  prompt: string;
  options: QuizOptionList;
  chosenLabel: string | null;
  correctLabel: string;
};

export type ClientRoomState = {
  code: string;
  hostId: string;
  gameMode: GameMode;
  quizCategoryId: QuizCategoryId;
  quizCategoryTitle: string;
  quizDifficulty: QuizDifficulty;
  quizDifficultyTitle: string;
  phase: QuizPhase;
  questionIndex: number;
  totalQuestions: number;
  turnIndex: number;
  activePlayerId: string | null;
  isYourTurn: boolean;
  canSubmitAnswer: boolean;
  statusMessage: string | null;
  scoresHidden: boolean;
  jointScore: number | null;
  players: Array<{
    id: string;
    name: string;
    score: number;
    hasAnswered: boolean;
    answerIndex: number | null;
    wasCorrect: boolean | null;
  }>;
  question: PublicQuizQuestion | null;
  correctIndex: number | null;
  /** Authoritative feedback for the answer just submitted (reveal phase). */
  answerFeedback: {
    correct: boolean;
    choiceIndex: number;
    correctIndex: number;
    chosenLabel: string;
    correctLabel: string;
  } | null;
  revealEndsAt: number | null;
  winnerIds: string[];
  you: { id: string; name: string; score: number; answer: number | null };
  results: ResultRow[] | null;
  scorecard: ScorecardData | null;
  millionaireView: MillionaireClientView | null;
  holdemView: HoldemClientView | null;
  error?: string;
};

export type HoldemClientView = {
  street: string;
  handNumber: number;
  dealerSeat: 0 | 1;
  dealerName: string;
  pot: number;
  board: string[];
  yourCards: string[];
  opponentCards: string[] | null;
  yourStack: number;
  opponentStack: number;
  toCall: number;
  minRaise: number;
  currentBet: number;
  actionOn: string | null;
  isYourAction: boolean;
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  canAllIn: boolean;
  canDealNextHand: boolean;
  lastHandSummary: string | null;
  showdownLabel: string | null;
  smallBlind: number;
  bigBlind: number;
};

export type MillionaireOpponentWatch = {
  playerId: string;
  name: string;
  questionNumber: number;
  targetPrize: number;
  securedPrize: number;
  phase: QuizPhase;
  question: PublicQuizQuestion | null;
  eliminatedOptionIndices: number[];
  outcome: "playing" | "won" | "lost" | "walkaway";
};

export type MillionaireClientView = {
  playStyle: "shared" | "parallel";
  opponentWatch: MillionaireOpponentWatch | null;
  ladder: readonly number[];
  safetyNetIndices: readonly number[];
  questionNumber: number;
  totalQuestions: number;
  targetPrize: number;
  securedPrize: number;
  finalAwardedPrize: number | null;
  outcome: "playing" | "won" | "lost" | "walkaway";
  lifelinesAvailable: {
    fifty_fifty: boolean;
    phone_a_friend: boolean;
    ask_audience: boolean;
  };
  eliminatedOptionIndices: number[];
  audiencePercents: number[] | null;
  phoneFriendHint: {
    choiceIndex: number;
    friendName: string;
    message: string;
  } | null;
  phase: QuizPhase;
  discussionEndsAt: number | null;
  revealEndsAt: number | null;
  canSelectAnswer: boolean;
  canLockAnswer: boolean;
  canFinalizeTeam: boolean;
  canWalkAway: boolean;
  canUseLifelines: boolean;
  playerLocks: Array<{
    id: string;
    name: string;
    choiceIndex: number | null;
    locked: boolean;
  }>;
};
