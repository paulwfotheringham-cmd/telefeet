import { QUIZ_CATEGORIES } from "./categories";
import { getOutlineSvg } from "./outline-paths";
import {
  countQuestionsByCategory,
  QUIZ_QUESTIONS,
  QUIZ_QUESTION_COUNT,
} from "./questions";

const MIN_PER_CATEGORY = 50;

export function validateQuestionBank(): string[] {
  const errors: string[] = [];
  if (QUIZ_QUESTION_COUNT < MIN_PER_CATEGORY) {
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
    if (q.outlineAssetId) {
      if (!/^o\d{3}$/.test(q.outlineAssetId)) {
        errors.push(`Question ${q.id} has invalid outlineAssetId`);
      }
      if (!getOutlineSvg(q.outlineAssetId)) {
        errors.push(`Question ${q.id} missing outline geometry for ${q.outlineAssetId}`);
      }
      const url = `/api/funquiz/outline/${q.outlineAssetId}`;
      const lower = url.toLowerCase();
      for (const opt of q.options) {
        if (lower.includes(opt.toLowerCase().replace(/\s+/g, ""))) {
          errors.push(`Question ${q.id} outline URL may leak answer metadata`);
        }
      }
    }
  }

  const counts = countQuestionsByCategory();
  for (const cat of QUIZ_CATEGORIES) {
    const n = counts[cat.id] ?? 0;
    if (n < MIN_PER_CATEGORY) {
      errors.push(`Category "${cat.id}" has ${n} eligible questions; need at least ${MIN_PER_CATEGORY}`);
    }
  }

  return errors;
}
