import { NextResponse } from "next/server";
import { InsufficientGameQuestionsError } from "./game";
import { GameRoomConflictError, GameStoreUnavailableError, gameStoreMode } from "./store";

export function gameJsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: gameStoreMode() }, { status });
}

export function handleGameStoreError(err: unknown) {
  if (err instanceof GameStoreUnavailableError) {
    return gameJsonError(err.message, 503);
  }
  if (err instanceof GameRoomConflictError) {
    return gameJsonError(err.message, 409);
  }
  if (err instanceof InsufficientGameQuestionsError) {
    return gameJsonError(err.message, 503);
  }
  if (err instanceof Error) {
    return gameJsonError(err.message, 400);
  }
  return gameJsonError("Something went wrong", 500);
}
