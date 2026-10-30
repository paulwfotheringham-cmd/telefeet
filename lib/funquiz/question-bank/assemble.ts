import {
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_CATEGORY_GENERAL_MILITARY,
  QUIZ_CATEGORY_GEOGRAPHY,
  QUIZ_CATEGORY_HISTORY,
  QUIZ_CATEGORY_MILITARY_BATTLES,
  QUIZ_CATEGORY_MOVIES_POP_CULTURE,
  QUIZ_CATEGORY_SPACE,
  QUIZ_CATEGORY_WORLD_FLAGS,
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
import { MOVIES_POP_CULTURE_QUESTION_DEFS } from "./builders/movies-pop-culture";
import { SPACE_QUESTION_DEFS } from "./builders/space";
import { WORLD_FLAG_DEFS, WORLD_FLAG_DEFS_EXTRA } from "./builders/world-flags";
import { LEGACY_QUESTION_DEFS } from "./legacy";
import { rebalanceExplicitDifficulties } from "./difficulty-quality";
import { mcqOptionSeed, shuffleMcqOptions } from "./shuffle-options";
import type { QuizQuestionBankItem } from "./types";

/** First N capitals in the bank are intermediate; remainder are hard (no easy/hard alternation). */
const CAPITAL_INTERMEDIATE_COUNT = 34;
/** Familiar flags first; lesser-known flags are hard. */
const WORLD_FLAG_INTERMEDIATE_COUNT = 86;
/** First half of outline silhouettes are intermediate. */
const OUTLINE_INTERMEDIATE_COUNT = 25;

function withIds(items: Omit<QuizQuestionBankItem, "id">[], startId: number): QuizQuestionBankItem[] {
  return items.map((item, i) => ({ ...item, id: startId + i }));
}

function tierDifficulty(index: number, intermediateCount: number): QuizDifficulty {
  return index < intermediateCount ? QUIZ_DIFFICULTY_INTERMEDIATE : QUIZ_DIFFICULTY_HARD;
}

function capitalToQuestion(
  def: (typeof CAPITAL_QUESTION_DEFS)[0],
  difficulty: QuizDifficulty,
): Omit<QuizQuestionBankItem, "id"> {
  const raw = [def.capital, ...def.wrongCapitals] as [string, string, string, string];
  const prompt = `What is the capital of ${def.country}?`;
  const { options, correctIndex } = shuffleMcqOptions(
    raw,
    0,
    mcqOptionSeed(`capital:${def.country}:${difficulty}`),
  );
  return {
    categoryId: QUIZ_CATEGORY_CAPITAL_CITIES,
    category: "Capital Cities",
    prompt,
    options,
    correctIndex,
    generalKnowledgeSubjects: ["geography", "culture"],
    difficulty,
  };
}

function flagToQuestion(
  def: (typeof WORLD_FLAG_DEFS)[0],
  difficulty: QuizDifficulty,
): Omit<QuizQuestionBankItem, "id"> {
  const raw = [def.correctCountry, ...def.distractors] as [string, string, string, string];
  const { options, correctIndex } = shuffleMcqOptions(
    raw,
    0,
    mcqOptionSeed(`flag:${def.iso2}:${difficulty}`),
  );
  return {
    categoryId: QUIZ_CATEGORY_WORLD_FLAGS,
    category: "Flags of the World",
    prompt: "Which country does this flag belong to?",
    options,
    correctIndex,
    flagIso2: def.iso2,
    difficulty,
  };
}

function outlineToQuestion(
  def: (typeof OUTLINE_COUNTRY_DEFS)[0],
  difficulty: QuizDifficulty,
): Omit<QuizQuestionBankItem, "id"> {
  const raw = [def.correctCountry, ...def.distractors] as [string, string, string, string];
  const { options, correctIndex } = shuffleMcqOptions(
    raw,
    0,
    mcqOptionSeed(`outline:${def.assetKey}:${difficulty}`),
  );
  return {
    categoryId: QUIZ_CATEGORY_COUNTRY_OUTLINES,
    category: "Country Outlines",
    prompt: "Which country is this?",
    options,
    correctIndex,
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
        difficulty: tierDifficulty(i, Math.ceil(LEGACY_QUESTION_DEFS.length / 2)),
      };
    }),
    ...CAPITAL_QUESTION_DEFS.map((d, i) =>
      capitalToQuestion(
        d,
        i < CAPITAL_INTERMEDIATE_COUNT ? QUIZ_DIFFICULTY_INTERMEDIATE : QUIZ_DIFFICULTY_HARD,
      ),
    ),
    ...GEOGRAPHY_QUESTION_DEFS.map((d, i) =>
      mcq(
        QUIZ_CATEGORY_GEOGRAPHY,
        "Geography",
        d,
        tierDifficulty(i, Math.ceil(GEOGRAPHY_QUESTION_DEFS.length / 2)),
        ["geography"],
      ),
    ),
    ...SPACE_QUESTION_DEFS.map((d, i) =>
      mcq(
        QUIZ_CATEGORY_SPACE,
        "Space",
        d,
        tierDifficulty(i, Math.ceil(SPACE_QUESTION_DEFS.length / 2)),
        ["space"],
      ),
    ),
    ...HISTORY_QUESTION_DEFS.map((d, i) =>
      mcq(
        QUIZ_CATEGORY_HISTORY,
        "History",
        d,
        tierDifficulty(i, Math.ceil(HISTORY_QUESTION_DEFS.length / 2)),
        ["history"],
      ),
    ),
    ...MOVIES_POP_CULTURE_QUESTION_DEFS.map((d, i) =>
      mcq(
        QUIZ_CATEGORY_MOVIES_POP_CULTURE,
        "Movies & Pop Culture",
        d,
        tierDifficulty(i, Math.ceil(MOVIES_POP_CULTURE_QUESTION_DEFS.length / 2)),
        ["culture"],
      ),
    ),
    ...MILITARY_BATTLES_DEFS.map((d, i) =>
      mcq(
        QUIZ_CATEGORY_MILITARY_BATTLES,
        "Military Battles",
        d,
        tierDifficulty(i, Math.ceil(MILITARY_BATTLES_DEFS.length / 2)),
        ["military"],
      ),
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
        tierDifficulty(i, Math.ceil(GK_EXTRA_DEFS.length / 2)),
        d.generalKnowledgeSubjects,
      ),
    ),
    ...OUTLINE_COUNTRY_DEFS.map((d, i) =>
      outlineToQuestion(d, tierDifficulty(i, OUTLINE_INTERMEDIATE_COUNT)),
    ),
    ...OUTLINE_COUNTRY_DEFS_EXTRA.map((d) =>
      outlineToQuestion(d, d.difficulty),
    ),
    ...WORLD_FLAG_DEFS.map((d, i) =>
      flagToQuestion(d, tierDifficulty(i, WORLD_FLAG_INTERMEDIATE_COUNT)),
    ),
    ...WORLD_FLAG_DEFS_EXTRA.map((d) => flagToQuestion(d, d.difficulty)),
    ...EXPANDED_MCQ_DEFS.map((d) => {
      const { options, correctIndex } = shuffleMcqOptions(
        d.options,
        d.correctIndex,
        mcqOptionSeed(`${d.categoryId}:${d.difficulty}:${d.prompt}`),
      );
      return mcq(
        d.categoryId,
        d.categoryLabel,
        { prompt: d.prompt, options, correctIndex },
        d.difficulty,
        d.generalKnowledgeSubjects,
      );
    }),
  ];

  return withIds(rebalanceExplicitDifficulties(chunks), 0);
}
