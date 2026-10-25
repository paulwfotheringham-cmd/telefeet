import { QUIZ_CATEGORY_GENERAL_MILITARY } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { QUESTIONS_PER_GAME } from "../lib/funquiz/constants";
import {
  categoryDifficultyCapacity,
  selectQuestionIdsForCategory,
} from "../lib/funquiz/question-selection";
import { getQuestionByBankId, QUIZ_QUESTIONS } from "../lib/funquiz/questions";

const GEOGRAPHY_PROMPT =
  /capital of|longest river|mountain range|largest ocean|smallest continent|Great Barrier Reef|flows through Paris|Land of the Rising Sun|Roof of the World|waterfall in the world|longest coastline|deepest known point|Great Lake|Ural Mountains|North Pole|Danube River|Drake Passage|Lake Titicaca|Mariana Trench|Atacama|Myanmar\?/i;

function avgWords(prompts: string[]): number {
  if (prompts.length === 0) return 0;
  const total = prompts.reduce((sum, p) => sum + p.split(/\s+/).length, 0);
  return Math.round((total / prompts.length) * 10) / 10;
}

function audit() {
  const intCap = categoryDifficultyCapacity(
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  const hardCap = categoryDifficultyCapacity(
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );

  const intSelected = selectQuestionIdsForCategory(
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  const hardSelected = selectQuestionIdsForCategory(
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );

  const intPrompts = intSelected.map((id) => getQuestionByBankId(id).prompt);
  const hardPrompts = hardSelected.map((id) => getQuestionByBankId(id).prompt);

  const geoInSelected = [...intSelected, ...hardSelected].filter((id) =>
    GEOGRAPHY_PROMPT.test(getQuestionByBankId(id).prompt),
  );

  const allGm = QUIZ_QUESTIONS.filter((q) => q.categoryId === QUIZ_CATEGORY_GENERAL_MILITARY);
  const invalidCorrect = allGm.filter(
    (q) => q.correctIndex < 0 || q.correctIndex >= q.options.length,
  );

  console.log(
    JSON.stringify(
      {
        poolCapacity: { intermediate: intCap, hard: hardCap },
        selectedGameBatchSize: {
          intermediate: intSelected.length,
          hard: hardSelected.length,
        },
        avgPromptWords: {
          intermediateSample: avgWords(intPrompts),
          hardSample: avgWords(hardPrompts),
        },
        geographyLikeInSelectedSample: geoInSelected,
        invalidCorrectIndexCount: invalidCorrect.length,
        hardIncludesSchwerpunkt: hardSelected.some((id) =>
          getQuestionByBankId(id).options.some((o) => /Schwerpunktbildung/i.test(o)),
        ),
        intermediateIncludesNato1949: intPrompts.some((p) =>
          /military alliance was established in 1949/i.test(p),
        ),
      },
      null,
      2,
    ),
  );

  if (intCap < QUESTIONS_PER_GAME || hardCap < QUESTIONS_PER_GAME) {
    process.exitCode = 1;
  }
  if (geoInSelected.length > 0) {
    process.exitCode = 1;
  }
}

audit();
