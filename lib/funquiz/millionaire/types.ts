import type { MillionaireLifelineId } from "./config";

export type MillionairePlayerLock = {
  choiceIndex: number | null;
  locked: boolean;
};

export type MillionaireOutcome = "playing" | "won" | "lost" | "walkaway";

export type MillionaireState = {
  securedPrize: number;
  finalAwardedPrize: number | null;
  outcome: MillionaireOutcome;
  lifelinesUsed: Record<MillionaireLifelineId, boolean>;
  eliminatedOptionIndices: number[];
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
      ask_team: false,
      change_question: false,
    },
    eliminatedOptionIndices: [],
    locks: {},
    usedBankIds: [],
    teamChoiceIndex: null,
    askTeamActiveUntil: null,
  };
}
