import { GAME_MODE_TAKE_TURNS, QUESTIONS_PER_GAME } from "./constants";
import type { QuizRoom } from "./types";

export class DuplicateQuestionAllocationError extends Error {
  constructor(readonly duplicateIds: number[]) {
    super(
      `Game session question allocation contains duplicate bank IDs: ${duplicateIds.join(", ")}`,
    );
    this.name = "DuplicateQuestionAllocationError";
  }
}

/** All bank IDs reserved for the current session's question sequence. */
export function allocatedBankIdsForSession(room: QuizRoom): number[] {
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    return [...room.hostQuestionOrder, ...room.guestQuestionOrder];
  }
  return [...room.questionOrder];
}

/** Bank IDs already answered in this session (from persisted answer log). */
export function usedBankIdsFromAnswerLog(room: QuizRoom): number[] {
  return room.answerLog
    .filter((entry) => entry.sessionId === room.sessionId)
    .map((entry) => entry.bankId);
}

export function assertUniqueAllocation(ids: number[], expectedLength = QUESTIONS_PER_GAME): void {
  if (ids.length !== expectedLength) {
    throw new Error(`Expected ${expectedLength} question IDs, got ${ids.length}`);
  }
  const seen = new Set<number>();
  const duplicates: number[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.push(id);
    }
    seen.add(id);
  }
  if (duplicates.length > 0) {
    throw new DuplicateQuestionAllocationError([...new Set(duplicates)]);
  }
}

export function assertRoomQuestionAllocation(room: QuizRoom): void {
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    assertUniqueAllocation(allocatedBankIdsForSession(room));
    return;
  }
  assertUniqueAllocation(room.questionOrder);
}

export function bankIdAlreadyUsedInSession(room: QuizRoom, bankId: number): boolean {
  return usedBankIdsFromAnswerLog(room).includes(bankId);
}
