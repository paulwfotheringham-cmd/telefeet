import {
  GAME_MODE_PARALLEL_MILLIONAIRE,
  GAME_MODE_SHARED_MILLIONAIRE,
} from "../constants";
import type { QuizRoom } from "../types";

export function isMillionaireRoom(room: QuizRoom): boolean {
  return (
    room.gameMode === GAME_MODE_SHARED_MILLIONAIRE ||
    room.gameMode === GAME_MODE_PARALLEL_MILLIONAIRE
  );
}

export function isParallelMillionaireRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_PARALLEL_MILLIONAIRE;
}

export function isSharedMillionaireRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_SHARED_MILLIONAIRE;
}
