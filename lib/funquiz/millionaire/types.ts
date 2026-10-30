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

export type MillionaireState = {
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

export function createInitialMillionaireState(): MillionaireState {
  return {
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
