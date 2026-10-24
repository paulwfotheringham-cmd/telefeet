import { QUIZ_CATEGORIES } from "./categories";
import { QUIZ_DIFFICULTIES } from "./difficulties";
import { getOutlineSvg } from "./outline-paths";
import { countQuestionsByCategoryAndDifficulty } from "./question-selection";
import { QUIZ_QUESTIONS, QUIZ_QUESTION_COUNT } from "./questions";

const MIN_PER_POOL = 50;

export function validateQuestionBank(): string[] {
  const errors: string[] = [];
  if (QUIZ_QUESTION_COUNT < MIN_PER_POOL) {
    errors.push(`Question bank too small: ${QUIZ_QUESTION_COUNT} total`);
  }
  const ids = new Set<number>();
  for (const q of QUIZ_QUESTIONS) {
    if (ids.has(q.id)) errors.push(`Duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.options.length !== 3 && q.options.length !== 4) {
      errors.push(`Question ${q.id} must have 3 or 4 options`);
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      errors.push(`Question ${q.id} has invalid correctIndex`);
    }
    if (!q.prompt.trim()) errors.push(`Question ${q.id} has empty prompt`);
    if (q.difficulty !== "intermediate" && q.difficulty !== "hard") {
      errors.push(`Question ${q.id} has invalid difficulty`);
    }
    if (q.outlineAssetId) {
      if (!/^o\d{3}$/.test(q.outlineAssetId)) {
        errors.push(`Question ${q.id} has invalid outlineAssetId`);
      }
      if (!getOutlineSvg(q.outlineAssetId)) {
        errors.push(`Question ${q.id} missing outline geometry for ${q.outlineAssetId}`);
      }
    }
  }

  const counts = countQuestionsByCategoryAndDifficulty();
  for (const cat of QUIZ_CATEGORIES) {
    for (const diff of QUIZ_DIFFICULTIES) {
      const n = counts[cat.id]?.[diff.id] ?? 0;
      if (n < MIN_PER_POOL) {
        errors.push(
          `Category "${cat.id}" / "${diff.id}" has ${n} eligible questions; need at least ${MIN_PER_POOL}`,
        );
      }
    }
  }

  return errors;
}
