import assert from "node:assert/strict";
import { QUIZ_CATEGORY_CAPITAL_CITIES } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD } from "../lib/funquiz/difficulties";
import { allocateQuestionsForGame } from "../lib/funquiz/game-logic";
import { getQuestionByBankId } from "../lib/funquiz/questions";
import { QUIZ_QUESTIONS } from "../lib/funquiz/question-bank";

const hard = QUIZ_QUESTIONS.filter(
  (q) => q.categoryId === QUIZ_CATEGORY_CAPITAL_CITIES && q.difficulty === QUIZ_DIFFICULTY_HARD,
);
const indices = new Set(hard.map((q) => q.correctIndex));
assert.ok(indices.size >= 3, `expected varied correctIndex, got ${[...indices].join(",")}`);
assert.ok(
  !hard.some((q) => q.prompt.includes("Japan")),
  "Japan should not appear in hard capital pool",
);

const { questionOrder } = allocateQuestionsForGame(
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_DIFFICULTY_HARD,
);
const gameIndices = questionOrder.map((id) => getQuestionByBankId(id).correctIndex);
assert.ok(
  new Set(gameIndices).size >= 2,
  "a 50-question hard capitals game should not have every answer on the same letter",
);

console.log("funquiz-capital-shuffle.test.ts OK");
