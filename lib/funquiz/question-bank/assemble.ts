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
import { CAPITAL_HARD_SUPPLEMENT } from "./builders/capitals-hard-supplement";
import { capitalDifficultyForCountry, outlineDifficultyForCountry } from "./difficulty-quality";
import { GEOGRAPHY_HARD_SUPPLEMENT } from "./builders/geography-hard-supplement";
import { HISTORY_HARD_SUPPLEMENT } from "./builders/history-hard-supplement";
import { MILITARY_BATTLES_HARD_SUPPLEMENT } from "./builders/military-battles-hard-supplement";
import { MOVIES_POP_CULTURE_HARD_SUPPLEMENT } from "./builders/movies-pop-culture-hard-supplement";
import { SPACE_HARD_SUPPLEMENT } from "./builders/space-hard-supplement";
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

/** Familiar flags first; lesser-known flags are hard. */
const WORLD_FLAG_INTERMEDIATE_COUNT = 86;

function withIds(items: Omit<QuizQuestionBankItem, "id">[], startId: number): QuizQuestionBankItem[] {
  return items.map((item, i) => ({ ...item, id: startId + i }));
}

function flagTierDifficulty(index: number): QuizDifficulty {
  return index < WORLD_FLAG_INTERMEDIATE_COUNT ? QUIZ_DIFFICULTY_INTERMEDIATE : QUIZ_DIFFICULTY_HARD;
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
    ...LEGACY_QUESTION_DEFS.map((q) => {
      const base =
        q.category === "Science"
          ? { ...q, categoryId: QUIZ_CATEGORY_GENERAL_KNOWLEDGE as QuizCategoryId }
          : q;
      return {
        ...base,
        difficulty: QUIZ_DIFFICULTY_INTERMEDIATE,
      };
    }),
    ...CAPITAL_QUESTION_DEFS.map((d) => capitalToQuestion(d, capitalDifficultyForCountry(d.country))),
    ...CAPITAL_HARD_SUPPLEMENT.map((d) =>
      capitalToQuestion(d, QUIZ_DIFFICULTY_HARD),
    ),
    ...GEOGRAPHY_QUESTION_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_GEOGRAPHY, "Geography", d, QUIZ_DIFFICULTY_INTERMEDIATE, ["geography"]),
    ),
    ...GEOGRAPHY_HARD_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_GEOGRAPHY, "Geography", d, QUIZ_DIFFICULTY_HARD, ["geography"]),
    ),
    ...SPACE_QUESTION_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_SPACE, "Space", d, QUIZ_DIFFICULTY_INTERMEDIATE, ["space"]),
    ),
    ...SPACE_HARD_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_SPACE, "Space", d, QUIZ_DIFFICULTY_HARD, ["space"]),
    ),
    ...HISTORY_QUESTION_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_HISTORY, "History", d, QUIZ_DIFFICULTY_INTERMEDIATE, ["history"]),
    ),
    ...HISTORY_HARD_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_HISTORY, "History", d, QUIZ_DIFFICULTY_HARD, ["history"]),
    ),
    ...MOVIES_POP_CULTURE_QUESTION_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_MOVIES_POP_CULTURE, "Movies & Pop Culture", d, QUIZ_DIFFICULTY_INTERMEDIATE, [
        "culture",
      ]),
    ),
    ...MOVIES_POP_CULTURE_HARD_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_MOVIES_POP_CULTURE, "Movies & Pop Culture", d, QUIZ_DIFFICULTY_HARD, [
        "culture",
      ]),
    ),
    ...MILITARY_BATTLES_DEFS.map((d) =>
      mcq(QUIZ_CATEGORY_MILITARY_BATTLES, "Military Battles", d, QUIZ_DIFFICULTY_INTERMEDIATE, [
        "military",
      ]),
    ),
    ...MILITARY_BATTLES_HARD_SUPPLEMENT.map((d) =>
      mcq(QUIZ_CATEGORY_MILITARY_BATTLES, "Military Battles", d, QUIZ_DIFFICULTY_HARD, ["military"]),
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
    ...GK_EXTRA_DEFS.map((d) =>
      mcq(
        QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
        "General Knowledge",
        d,
        QUIZ_DIFFICULTY_INTERMEDIATE,
        d.generalKnowledgeSubjects,
      ),
    ),
    ...OUTLINE_COUNTRY_DEFS.map((d) =>
      outlineToQuestion(d, outlineDifficultyForCountry(d.correctCountry)),
    ),
    ...OUTLINE_COUNTRY_DEFS_EXTRA.map((d) =>
      outlineToQuestion(d, d.difficulty),
    ),
    ...WORLD_FLAG_DEFS.map((d, i) =>
      flagToQuestion(d, flagTierDifficulty(i)),
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
