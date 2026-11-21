import { NextResponse } from "next/server";
import { InsufficientShowQuestionsError } from "./game";
import { ShowRoomConflictError, ShowStoreUnavailableError, showStoreMode } from "./store";

export function showJsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: showStoreMode() }, { status });
}

export function handleShowStoreError(err: unknown) {
  if (err instanceof ShowStoreUnavailableError) {
    return showJsonError(err.message, 503);
  }
  if (err instanceof ShowRoomConflictError) {
    return showJsonError(err.message, 409);
  }
  if (err instanceof InsufficientShowQuestionsError) {
    return showJsonError(err.message, 503);
  }
  if (err instanceof Error) {
    return showJsonError(err.message, 400);
  }
  return showJsonError("Something went wrong", 500);
}
