import { QUIZ_QUESTIONS, QUIZ_QUESTION_COUNT } from "./questions";

export function validateQuestionBank(): string[] {
  const errors: string[] = [];
  if (QUIZ_QUESTION_COUNT !== 50) {
    errors.push(`Expected 50 questions, got ${QUIZ_QUESTION_COUNT}`);
  }
  const ids = new Set<number>();
  for (const q of QUIZ_QUESTIONS) {
    if (ids.has(q.id)) errors.push(`Duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.options.length !== 3) {
      errors.push(`Question ${q.id} must have 3 options`);
    }
    if (q.correctIndex < 0 || q.correctIndex > 2) {
      errors.push(`Question ${q.id} has invalid correctIndex`);
    }
    if (!q.prompt.trim()) errors.push(`Question ${q.id} has empty prompt`);
  }
  return errors;
}
