import type { QuizCategoryId } from "./categories";
import type { QuizDifficulty } from "./difficulties";
import { GAME_MODE_PARALLEL_MILLIONAIRE, GAME_MODE_SHARED_MILLIONAIRE } from "./constants";
import type { GameMode, QuizRoom } from "./types";
import { allocatedBankIdsForSession } from "./session-questions";

export type PlayedBankIdsByTopic = Record<string, number[]>;

export function topicKey(
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
  gameMode?: GameMode,
): string {
  if (
    gameMode === GAME_MODE_SHARED_MILLIONAIRE ||
    gameMode === GAME_MODE_PARALLEL_MILLIONAIRE
  ) {
    return `${categoryId}:millionaire`;
  }
  return `${categoryId}:${difficulty}`;
}

function mergeUnique(existing: number[], add: number[]): number[] {
  const set = new Set(existing);
  for (const id of add) set.add(id);
  return [...set];
}

export function playedIdsForTopic(
  room: QuizRoom,
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
  gameMode?: GameMode,
): number[] {
  const key = topicKey(categoryId, difficulty, gameMode);
  return room.playedBankIdsByTopic[key] ?? [];
}

export function reserveBankIdsForTopic(
  room: QuizRoom,
  categoryId: QuizCategoryId,
  difficulty: QuizDifficulty,
  bankIds: number[],
  gameMode?: GameMode,
): QuizRoom {
  const key = topicKey(categoryId, difficulty, gameMode);
  const prev = room.playedBankIdsByTopic[key] ?? [];
  return {
    ...room,
    playedBankIdsByTopic: {
      ...room.playedBankIdsByTopic,
      [key]: mergeUnique(prev, bankIds),
    },
  };
}

/** Bank IDs allocated for the current session (before answer log is complete). */
export function sessionAllocatedBankIds(room: QuizRoom): number[] {
  if (room.phase === "lobby") return [];
  return allocatedBankIdsForSession(room);
}

export function emptyPlayedBankIdsByTopic(): PlayedBankIdsByTopic {
  return {};
}
