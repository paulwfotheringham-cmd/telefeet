export type CatchphraseState = {
  puzzleOrder: string[];
  roundIndex: number;
  /** Tile indices still covering the picture (0 .. gridCols*gridRows - 1). */
  hiddenTiles: number[];
  gridCols: number;
  gridRows: number;
  buzzPlayerId: string | null;
  statusMessage: string | null;
  lastGuess: { playerId: string; text: string; correct: boolean } | null;
  /** Shown to clients during reveal phase. */
  lastAnswer: string | null;
  lastTileRevealAt: number;
};

export const CATCHPHRASE_GRID_COLS = 8;
export const CATCHPHRASE_GRID_ROWS = 6;
export const CATCHPHRASE_ROUNDS = 8;
export const CATCHPHRASE_TILE_REVEAL_MS = 420;
export const CATCHPHRASE_ANSWER_REVEAL_MS = 4_000;

export function createInitialCatchphraseState(): CatchphraseState {
  return {
    puzzleOrder: [],
    roundIndex: 0,
    hiddenTiles: [],
    gridCols: CATCHPHRASE_GRID_COLS,
    gridRows: CATCHPHRASE_GRID_ROWS,
    buzzPlayerId: null,
    statusMessage: null,
    lastGuess: null,
    lastAnswer: null,
    lastTileRevealAt: 0,
  };
}
