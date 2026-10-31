export const BLOCKBUSTERS_HEX_COUNT = 18;
export const BLOCKBUSTERS_REVEAL_MS = 3_200;

export type BlockbustersStep = "pick" | "answer" | "steal";

export type BlockbustersCell = {
  id: number;
  letter: string;
  bankId: number;
  ownerId: string | null;
};

export type BlockbustersState = {
  cells: BlockbustersCell[];
  /** Player who chooses the next hex. */
  pickPlayerId: string;
  /** Player who may submit an MCQ answer now. */
  answerPlayerId: string | null;
  step: BlockbustersStep;
  selectedCellId: number | null;
  horizontalPlayerId: string;
  verticalPlayerId: string;
  statusMessage: string | null;
  winnerId: string | null;
};

export function createInitialBlockbustersState(): BlockbustersState {
  return {
    cells: [],
    pickPlayerId: "",
    answerPlayerId: null,
    step: "pick",
    selectedCellId: null,
    horizontalPlayerId: "",
    verticalPlayerId: "",
    statusMessage: null,
    winnerId: null,
  };
}
