import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GENERAL_MILITARY } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { QUESTIONS_PER_GAME } from "../lib/funquiz/constants";
import { selectQuestionIdsForCategory } from "../lib/funquiz/question-selection";
import { getQuestionByBankId, QUIZ_QUESTIONS } from "../lib/funquiz/questions";

const GEOGRAPHY_PROMPT =
  /capital of|longest river|mountain range|largest ocean|smallest continent|Great Barrier Reef|flows through Paris|Land of the Rising Sun|Roof of the World|waterfall in the world|longest coastline|deepest known point|Great Lake|Ural Mountains|North Pole|Danube River|Drake Passage|Lake Titicaca|Mariana Trench|Atacama|Myanmar\?/i;

function runNoGeneralGeographyFillers() {
  const gm = QUIZ_QUESTIONS.filter((q) => q.categoryId === QUIZ_CATEGORY_GENERAL_MILITARY);
  const geoLike = gm.filter((q) => GEOGRAPHY_PROMPT.test(q.prompt));
  assert.equal(
    geoLike.length,
    0,
    `General Military should not include general geography prompts: ${geoLike.map((q) => q.id).join(", ")}`,
  );
}

function runHardPoolCapacity() {
  const hardIds = selectQuestionIdsForCategory(
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );
  assert.equal(hardIds.length, QUESTIONS_PER_GAME);
  for (const id of hardIds) {
    assert.equal(getQuestionByBankId(id).difficulty, QUIZ_DIFFICULTY_HARD);
  }
}

function runIntermediateHasNatoStyleBaseline() {
  const pool = QUIZ_QUESTIONS.filter(
    (q) =>
      q.categoryId === QUIZ_CATEGORY_GENERAL_MILITARY &&
      q.difficulty === QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  assert.ok(
    pool.some((q) => /military alliance was established in 1949/i.test(q.prompt)),
    "expected at least one intermediate NATO-style question",
  );
}

function runHardHasDoctrineStyle() {
  const pool = QUIZ_QUESTIONS.filter(
    (q) =>
      q.categoryId === QUIZ_CATEGORY_GENERAL_MILITARY && q.difficulty === QUIZ_DIFFICULTY_HARD,
  );
  assert.ok(
    pool.some((q) => /Schwerpunktbildung/i.test(q.options.join(" "))),
    "expected at least one hard doctrine-style question",
  );
}

runNoGeneralGeographyFillers();
runHardPoolCapacity();
runIntermediateHasNatoStyleBaseline();
runHardHasDoctrineStyle();
console.log("funquiz-general-military.test.ts OK");
