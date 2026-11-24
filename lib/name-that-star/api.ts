import { NextResponse } from "next/server";
import { InsufficientMovieQuestionsError } from "./game";
import { MovieRoomConflictError, MovieStoreUnavailableError, movieStoreMode } from "./store";

export function movieJsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: movieStoreMode() }, { status });
}

export function handleMovieStoreError(err: unknown) {
  if (err instanceof MovieStoreUnavailableError) {
    return movieJsonError(err.message, 503);
  }
  if (err instanceof MovieRoomConflictError) {
    return movieJsonError(err.message, 409);
  }
  if (err instanceof InsufficientMovieQuestionsError) {
    return movieJsonError(err.message, 503);
  }
  if (err instanceof Error) {
    return movieJsonError(err.message, 400);
  }
  return movieJsonError("Something went wrong", 500);
}
