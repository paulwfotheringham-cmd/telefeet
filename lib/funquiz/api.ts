import { NextResponse } from "next/server";
import { InsufficientQuestionsError } from "./question-selection";
import { QuizRoomConflictError, QuizStoreUnavailableError, quizStoreMode } from "./store";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, store: quizStoreMode() }, { status });
}

export function handleStoreError(err: unknown) {
  if (err instanceof QuizStoreUnavailableError) {
    return jsonError(err.message, 503);
  }
  if (err instanceof QuizRoomConflictError) {
    return jsonError(err.message, 409);
  }
  if (err instanceof InsufficientQuestionsError) {
    return jsonError(
      `${err.message} Please ask an administrator to expand the question bank for this category.`,
      503,
    );
  }
  if (err instanceof Error) {
    if (err.message.includes("funquiz_rooms_game_mode_check")) {
      return jsonError(
        "This game mode is not enabled on the server yet. Try “Play together” under Game 3, or retry in a minute after the app updates.",
        503,
      );
    }
    return jsonError(err.message, 400);
  }
  return jsonError("Something went wrong", 500);
}
