import type { CatchphraseState } from "./catchphrase/types";
import { createInitialCatchphraseState } from "./catchphrase/types";

export function parseCatchphraseState(raw: unknown): CatchphraseState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const base = createInitialCatchphraseState();
  return {
    ...base,
    puzzleOrder: Array.isArray(r.puzzleOrder) ? (r.puzzleOrder as string[]) : [],
    roundIndex: typeof r.roundIndex === "number" ? r.roundIndex : 0,
    hiddenTiles: Array.isArray(r.hiddenTiles) ? (r.hiddenTiles as number[]) : [],
    gridCols: typeof r.gridCols === "number" ? r.gridCols : base.gridCols,
    gridRows: typeof r.gridRows === "number" ? r.gridRows : base.gridRows,
    buzzPlayerId: typeof r.buzzPlayerId === "string" ? r.buzzPlayerId : null,
    statusMessage: typeof r.statusMessage === "string" ? r.statusMessage : null,
    lastGuess:
      r.lastGuess && typeof r.lastGuess === "object"
        ? (r.lastGuess as CatchphraseState["lastGuess"])
        : null,
    lastAnswer: typeof r.lastAnswer === "string" ? r.lastAnswer : null,
    lastTileRevealAt: typeof r.lastTileRevealAt === "number" ? r.lastTileRevealAt : 0,
  };
}
