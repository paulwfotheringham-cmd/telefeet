import { NextResponse } from "next/server";
import { InsufficientTuneQuestionsError } from "./game";
import { TuneRoomConflictError, TuneStoreUnavailableError, tuneStoreMode } from "./store";

export function tuneJsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: tuneStoreMode() }, { status });
}

export function handleTuneStoreError(err: unknown) {
  if (err instanceof TuneStoreUnavailableError) {
    return tuneJsonError(err.message, 503);
  }
  if (err instanceof TuneRoomConflictError) {
    return tuneJsonError(err.message, 409);
  }
  if (err instanceof InsufficientTuneQuestionsError) {
    return tuneJsonError(err.message, 503);
  }
  if (err instanceof Error) {
    return tuneJsonError(err.message, 400);
  }
  return tuneJsonError("Something went wrong", 500);
}
