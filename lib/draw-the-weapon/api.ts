import { NextResponse } from "next/server";
import { DrawRoomConflictError, DrawStoreUnavailableError, drawStoreMode } from "./store";

export function drawJsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: drawStoreMode() }, { status });
}

export function handleDrawStoreError(err: unknown) {
  if (err instanceof DrawStoreUnavailableError) return drawJsonError(err.message, 503);
  if (err instanceof DrawRoomConflictError) return drawJsonError(err.message, 409);
  if (err instanceof Error) return drawJsonError(err.message, 400);
  return drawJsonError("Something went wrong", 500);
}
