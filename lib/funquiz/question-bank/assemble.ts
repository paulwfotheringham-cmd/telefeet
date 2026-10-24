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
import { CAPITAL_QUESTION_DEFS } from "./builders/capitals";
import { OUTLINE_COUNTRY_DEFS } from "./builders/country-outlines";
import { GK_EXTRA_DEFS } from "./builders/general-knowledge-extra";
import { GENERAL_MILITARY_DEFS } from "./builders/general-military";
import { GEOGRAPHY_QUESTION_DEFS } from "./builders/geography";
import { HISTORY_QUESTION_DEFS } from "./builders/history";
import { MILITARY_BATTLES_DEFS } from "./builders/military-battles";
import { SPACE_QUESTION_DEFS } from "./builders/space";
import { LEGACY_QUESTION_DEFS } from "./legacy";
import type { QuizQuestionBankItem } from "./types";

function withIds(items: Omit<QuizQuestionBankItem, "id">[], startId: number): QuizQuestionBankItem[] {
  return items.map((item, i) => ({ ...item, id: startId + i }));
}

function capitalToQuestion(def: (typeof CAPITAL_QUESTION_DEFS)[0]): Omit<QuizQuestionBankItem, "id"> {
  const options = [def.capital, ...def.wrongCapitals] as [string, string, string, string];
  return {
    categoryId: QUIZ_CATEGORY_CAPITAL_CITIES,
    category: "Capital Cities",
    prompt: `What is the capital of ${def.country}?`,
    options,
    correctIndex: 0,
    generalKnowledgeSubjects: ["geography", "culture"],
    difficulty: "medium",
  };
}

function outlineToQuestion(def: (typeof OUTLINE_COUNTRY_DEFS)[0]): Omit<QuizQuestionBankItem, "id"> {
  const options = [def.correctCountry, ...def.distractors] as [string, string, string, string];
  return {
    categoryId: QUIZ_CATEGORY_COUNTRY_OUTLINES,
    category: "Country Outlines",
    prompt: "Which country is this?",
    options,
    correctIndex: 0,
    outlineAssetId: def.assetKey,
    difficulty: "medium",
  };
}

function mcq(
  categoryId: QuizCategoryId,
  category: string,
  def: { prompt: string; options: [string, string, string, string]; correctIndex: number },
  gk?: QuizQuestionBankItem["generalKnowledgeSubjects"],
): Omit<QuizQuestionBankItem, "id"> {
  return {
    categoryId,
    category,
    prompt: def.prompt,
    options: def.options,
    correctIndex: def.correctIndex,
    generalKnowledgeSubjects: gk,
    difficulty: "medium",
  };
}

export function buildQuestionBank(): QuizQuestionBankItem[] {
  const chunks: Omit<QuizQuestionBankItem, "id">[] = [
    ...LEGACY_QUESTION_DEFS.map((q) => {
      if (q.category === "Science") {
        return { ...q, categoryId: QUIZ_CATEGORY_GENERAL_KNOWLEDGE };
      }
      return q;
    }),
    ...CAPITAL_QUESTION_DEFS.map(capitalToQuestion),
    ...GEOGRAPHY_QUESTION_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_GEOGRAPHY, "Geography", d, ["geography"]),
    ),
    ...SPACE_QUESTION_DEFS.map((d) => mcq(QUIZ_CATEGORY_SPACE, "Space", d, ["space"])),
    ...HISTORY_QUESTION_DEFS.map((d) => mcq(QUIZ_CATEGORY_HISTORY, "History", d, ["history"])),
    ...MILITARY_BATTLES_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_MILITARY_BATTLES, "Military Battles", d, ["military"]),
    ),
    ...GENERAL_MILITARY_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_GENERAL_MILITARY, "General Military", d, ["military"]),
    ),
    ...GK_EXTRA_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_GENERAL_KNOWLEDGE, "General Knowledge", d, d.generalKnowledgeSubjects),
    ),
    ...OUTLINE_COUNTRY_DEFS.map(outlineToQuestion),
  ];

  return withIds(chunks, 0);
}
