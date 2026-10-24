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
    return jsonError(err.message, 400);
  }
  return jsonError("Something went wrong", 500);
}
