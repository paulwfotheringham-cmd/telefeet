import type { BlockbustersState } from "./blockbusters/types";
import { createInitialBlockbustersState } from "./blockbusters/types";

export function parseBlockbustersState(raw: unknown): BlockbustersState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const base = createInitialBlockbustersState();
  const cellsRaw = r.cells;
  if (!Array.isArray(cellsRaw)) return undefined;

  return {
    ...base,
    cells: cellsRaw.map((c) => {
      const cell = c as Record<string, unknown>;
      return {
        id: Number(cell.id),
        letter: String(cell.letter ?? "?"),
        bankId: Number(cell.bankId),
        ownerId: cell.ownerId === null || cell.ownerId === undefined ? null : String(cell.ownerId),
      };
    }),
    pickPlayerId: String(r.pickPlayerId ?? base.pickPlayerId),
    answerPlayerId:
      r.answerPlayerId === null || r.answerPlayerId === undefined
        ? null
        : String(r.answerPlayerId),
    step: r.step === "answer" || r.step === "steal" || r.step === "pick" ? r.step : "pick",
    selectedCellId:
      r.selectedCellId === null || r.selectedCellId === undefined
        ? null
        : Number(r.selectedCellId),
    horizontalPlayerId: String(r.horizontalPlayerId ?? ""),
    verticalPlayerId: String(r.verticalPlayerId ?? ""),
    statusMessage:
      r.statusMessage === null || r.statusMessage === undefined
        ? null
        : String(r.statusMessage),
    winnerId:
      r.winnerId === null || r.winnerId === undefined ? null : String(r.winnerId),
  };
}
