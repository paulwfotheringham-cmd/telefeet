import type { QuizCategoryId } from "../categories";
import type { QuizDifficulty } from "../difficulties";

export type GeneralKnowledgeSubject =
  | "science"
  | "space"
  | "history"
  | "geography"
  | "military"
  | "culture"
  | "technology";

export type QuizOptions = readonly [string, string, string] | readonly [string, string, string, string];

export type QuizQuestionBankItem = {
  id: number;
  /** Primary category for dedicated quizzes (not used alone for general_knowledge selection). */
  categoryId: QuizCategoryId;
  /** Display label in UI (legacy subject string). */
  category: string;
  prompt: string;
  options: QuizOptions;
  correctIndex: number;
  /** Included in General Knowledge balanced pools. */
  generalKnowledgeSubjects?: GeneralKnowledgeSubject[];
  outlineAssetId?: string;
  /** ISO 3166-1 alpha-2 for world flag image (/api/funquiz/flag/{iso2}). */
  flagIso2?: string;
  difficulty: QuizDifficulty;
};
