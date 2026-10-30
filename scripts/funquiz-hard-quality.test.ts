import assert from "node:assert/strict";
import {
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_CATEGORY_WORLD_FLAGS,
} from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD } from "../lib/funquiz/difficulties";
import { isTooEasyForHardQuestion } from "../lib/funquiz/question-bank/difficulty-quality";
import { QUIZ_QUESTIONS } from "../lib/funquiz/question-bank";

function runNoEasyHardLabels() {
  for (const q of QUIZ_QUESTIONS) {
    if (q.difficulty !== QUIZ_DIFFICULTY_HARD) continue;
    assert.ok(
      !isTooEasyForHardQuestion(q),
      `Hard question should not be trivial: ${q.categoryId} #${q.id} ${q.prompt.slice(0, 60)}`,
    );
  }
}

function runFlagsHardNotHousehold() {
  const hardFlags = QUIZ_QUESTIONS.filter(
    (q) => q.categoryId === QUIZ_CATEGORY_WORLD_FLAGS && q.difficulty === QUIZ_DIFFICULTY_HARD,
  );
  const household = hardFlags.filter((q) => {
    const country = q.options[q.correctIndex]!;
    return ["Japan", "France", "United States", "United Kingdom", "Germany", "Brazil"].includes(
      country,
    );
  });
  assert.equal(household.length, 0, `household flags in hard: ${household.map((q) => q.options[q.correctIndex]).join(", ")}`);
}

function runCapitalHardNotHousehold() {
  const hardCaps = QUIZ_QUESTIONS.filter(
    (q) => q.categoryId === QUIZ_CATEGORY_CAPITAL_CITIES && q.difficulty === QUIZ_DIFFICULTY_HARD,
  );
  assert.ok(hardCaps.length >= 50);
  const easy = hardCaps.filter((q) => /capital of (Japan|France|Germany|United States)\?/i.test(q.prompt));
  assert.equal(easy.length, 0);
}

runNoEasyHardLabels();
runFlagsHardNotHousehold();
runCapitalHardNotHousehold();
console.log("funquiz-hard-quality.test.ts OK");
