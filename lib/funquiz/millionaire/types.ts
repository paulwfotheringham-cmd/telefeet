import type { MillionaireLifelineId } from "./config";

export type MillionairePlayerLock = {
  choiceIndex: number | null;
  locked: boolean;
};

export type MillionaireOutcome = "playing" | "won" | "lost" | "walkaway";

export type MillionairePhoneFriendHint = {
  choiceIndex: number;
  friendName: string;
  message: string;
};

export type MillionaireRunPhase = "question" | "reveal" | "won" | "lost" | "walkaway";

export type MillionairePlayerRun = {
  questionOrder: number[];
  questionIndex: number;
  phase: MillionaireRunPhase;
  securedPrize: number;
  finalAwardedPrize: number | null;
  outcome: MillionaireOutcome;
  lifelinesUsed: Record<MillionaireLifelineId, boolean>;
  eliminatedOptionIndices: number[];
  audiencePercents: number[] | null;
  phoneFriendHint: MillionairePhoneFriendHint | null;
  revealStartedAt: number | null;
  answerLocked: boolean;
  usedBankIds: number[];
};

export type MillionaireState = {
  variant: "shared" | "parallel";
  /** Per-player ladders when variant is parallel. */
  parallelRuns?: Record<string, MillionairePlayerRun>;
  securedPrize: number;
  finalAwardedPrize: number | null;
  outcome: MillionaireOutcome;
  lifelinesUsed: Record<MillionaireLifelineId, boolean>;
  eliminatedOptionIndices: number[];
  /** One percentage per answer option (sums to 100) after Ask the Audience. */
  audiencePercents: number[] | null;
  phoneFriendHint: MillionairePhoneFriendHint | null;
  locks: Record<string, MillionairePlayerLock>;
  /** Bank ids consumed in this session (includes replaced questions). */
  usedBankIds: number[];
  /** Host-finalised team choice during discussion. */
  teamChoiceIndex: number | null;
  askTeamActiveUntil: number | null;
};

export function createInitialMillionairePlayerRun(questionOrder: number[]): MillionairePlayerRun {
  return {
    questionOrder,
    questionIndex: 0,
    phase: "question",
    securedPrize: 0,
    finalAwardedPrize: null,
    outcome: "playing",
    lifelinesUsed: {
      fifty_fifty: false,
      phone_a_friend: false,
      ask_audience: false,
    },
    eliminatedOptionIndices: [],
    audiencePercents: null,
    phoneFriendHint: null,
    revealStartedAt: null,
    answerLocked: false,
    usedBankIds: [...questionOrder],
  };
}

export function createInitialMillionaireState(): MillionaireState {
  return {
    variant: "shared",
    securedPrize: 0,
    finalAwardedPrize: null,
    outcome: "playing",
    lifelinesUsed: {
      fifty_fifty: false,
      phone_a_friend: false,
      ask_audience: false,
    },
    eliminatedOptionIndices: [],
    audiencePercents: null,
    phoneFriendHint: null,
    locks: {},
    usedBankIds: [],
    teamChoiceIndex: null,
    askTeamActiveUntil: null,
  };
}

export function createInitialParallelMillionaireState(): MillionaireState {
  return {
    ...createInitialMillionaireState(),
    variant: "parallel",
    parallelRuns: {},
  };
}
