import { NextResponse } from "next/server";
import {
  BlackjackRoomConflictError,
  BlackjackStoreUnavailableError,
  blackjackStoreMode,
} from "./room-store";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: blackjackStoreMode() }, { status });
}

export function handleBlackjackStoreError(err: unknown) {
  if (err instanceof BlackjackStoreUnavailableError) {
    return jsonError(err.message, 503);
  }
  if (err instanceof BlackjackRoomConflictError) {
    return jsonError(err.message, 409);
  }
  if (err instanceof Error) {
    return jsonError(err.message, 400);
  }
  return jsonError("Something went wrong", 500);
}
