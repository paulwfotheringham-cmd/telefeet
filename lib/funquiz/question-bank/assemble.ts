import {
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_CATEGORY_GENERAL_MILITARY,
  QUIZ_CATEGORY_GEOGRAPHY,
  QUIZ_CATEGORY_HISTORY,
  QUIZ_CATEGORY_MILITARY_BATTLES,
  QUIZ_CATEGORY_SPACE,
  type QuizCategoryId,
} from "../categories";
import {
  QUIZ_DIFFICULTY_HARD,
  QUIZ_DIFFICULTY_INTERMEDIATE,
  type QuizDifficulty,
} from "../difficulties";
import { CAPITAL_QUESTION_DEFS } from "./builders/capitals";
import { OUTLINE_COUNTRY_DEFS, OUTLINE_COUNTRY_DEFS_EXTRA } from "./builders/country-outlines";
import { EXPANDED_MCQ_DEFS } from "./builders/expanded-pools";
import { GK_EXTRA_DEFS } from "./builders/general-knowledge-extra";
import { GENERAL_MILITARY_DEFS } from "./builders/general-military";
import {
  GENERAL_MILITARY_HARD_SUPPLEMENT,
  GENERAL_MILITARY_INTERMEDIATE_SUPPLEMENT,
} from "./builders/general-military-supplement";
import { GEOGRAPHY_QUESTION_DEFS } from "./builders/geography";
import { HISTORY_QUESTION_DEFS } from "./builders/history";
import { MILITARY_BATTLES_DEFS } from "./builders/military-battles";
import { SPACE_QUESTION_DEFS } from "./builders/space";
import { LEGACY_QUESTION_DEFS } from "./legacy";
import type { QuizQuestionBankItem } from "./types";

function withIds(items: Omit<QuizQuestionBankItem, "id">[], startId: number): QuizQuestionBankItem[] {
  return items.map((item, i) => ({ ...item, id: startId + i }));
}

function altDifficulty(index: number, skew: 0 | 1 = 0): QuizDifficulty {
  return (index + skew) % 2 === 0 ? QUIZ_DIFFICULTY_INTERMEDIATE : QUIZ_DIFFICULTY_HARD;
}

function capitalToQuestion(
  def: (typeof CAPITAL_QUESTION_DEFS)[0],
  difficulty: QuizDifficulty,
): Omit<QuizQuestionBankItem, "id"> {
  const options = [def.capital, ...def.wrongCapitals] as [string, string, string, string];
  return {
    categoryId: QUIZ_CATEGORY_CAPITAL_CITIES,
    category: "Capital Cities",
    prompt: `What is the capital of ${def.country}?`,
    options,
    correctIndex: 0,
    generalKnowledgeSubjects: ["geography", "culture"],
    difficulty,
  };
}

function outlineToQuestion(
  def: (typeof OUTLINE_COUNTRY_DEFS)[0],
  difficulty: QuizDifficulty,
): Omit<QuizQuestionBankItem, "id"> {
  const options = [def.correctCountry, ...def.distractors] as [string, string, string, string];
  return {
    categoryId: QUIZ_CATEGORY_COUNTRY_OUTLINES,
    category: "Country Outlines",
    prompt: "Which country is this?",
    options,
    correctIndex: 0,
    outlineAssetId: def.assetKey,
    difficulty,
  };
}

function mcq(
  categoryId: QuizCategoryId,
  category: string,
  def: { prompt: string; options: [string, string, string, string]; correctIndex: number },
  difficulty: QuizDifficulty,
  gk?: QuizQuestionBankItem["generalKnowledgeSubjects"],
): Omit<QuizQuestionBankItem, "id"> {
  return {
    categoryId,
    category,
    prompt: def.prompt,
    options: def.options,
    correctIndex: def.correctIndex,
    generalKnowledgeSubjects: gk,
    difficulty,
  };
}

export function buildQuestionBank(): QuizQuestionBankItem[] {
  const chunks: Omit<QuizQuestionBankItem, "id">[] = [
    ...LEGACY_QUESTION_DEFS.map((q, i) => {
      const base =
        q.category === "Science"
          ? { ...q, categoryId: QUIZ_CATEGORY_GENERAL_KNOWLEDGE as QuizCategoryId }
          : q;
      return {
        ...base,
        difficulty: altDifficulty(i, 0),
      };
    }),
    ...CAPITAL_QUESTION_DEFS.map((d, i) => capitalToQuestion(d, altDifficulty(i, 0))),
    ...GEOGRAPHY_QUESTION_DEFS.map((d, i) =>
      mcq(QUIZ_CATEGORY_GEOGRAPHY, "Geography", d, altDifficulty(i, 1), ["geography"]),
    ),
    ...SPACE_QUESTION_DEFS.map((d, i) =>
      mcq(QUIZ_CATEGORY_SPACE, "Space", d, altDifficulty(i, 0), ["space"]),
    ),
    ...HISTORY_QUESTION_DEFS.map((d, i) =>
      mcq(QUIZ_CATEGORY_HISTORY, "History", d, altDifficulty(i, 1), ["history"]),
    ),
    ...MILITARY_BATTLES_DEFS.map((d, i) =>
      mcq(QUIZ_CATEGORY_MILITARY_BATTLES, "Military Battles", d, altDifficulty(i, 0), [
        "military",
      ]),
    ),
    ...GENERAL_MILITARY_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_GENERAL_MILITARY, "General Military", d, QUIZ_DIFFICULTY_INTERMEDIATE, [
        "military",
      ]),
    ),
    ...GENERAL_MILITARY_INTERMEDIATE_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_GENERAL_MILITARY, "General Military", d, QUIZ_DIFFICULTY_INTERMEDIATE, [
        "military",
      ]),
    ),
    ...GENERAL_MILITARY_HARD_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_GENERAL_MILITARY, "General Military", d, QUIZ_DIFFICULTY_HARD, [
        "military",
      ]),
    ),
    ...GK_EXTRA_DEFS.map((d, i) =>
      mcq(
        QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
        "General Knowledge",
        d,
        altDifficulty(i, 0),
        d.generalKnowledgeSubjects,
      ),
    ),
    ...OUTLINE_COUNTRY_DEFS.map((d, i) => outlineToQuestion(d, altDifficulty(i, 0))),
    ...OUTLINE_COUNTRY_DEFS_EXTRA.map((d) =>
      outlineToQuestion(d, d.difficulty),
    ),
    ...EXPANDED_MCQ_DEFS.map((d) =>
      mcq(d.categoryId, d.categoryLabel, d, d.difficulty, d.generalKnowledgeSubjects),
    ),
  ];

  return withIds(chunks, 0);
}
