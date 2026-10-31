import assert from "node:assert/strict";
import { QUIZ_CATEGORY_MOVIES_POP_CULTURE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD } from "../lib/funquiz/difficulties";
import { QUESTIONS_PER_GAME } from "../lib/funquiz/constants";
import { selectQuestionIdsForCategory } from "../lib/funquiz/question-selection";
import { getQuestionByBankId } from "../lib/funquiz/questions";
import { normalizeQuizPrompt } from "../lib/funquiz/question-prompt-key";

function assertUniquePrompts(ids: number[]) {
  const prompts = ids.map((id) => normalizeQuizPrompt(getQuestionByBankId(id).prompt));
  assert.equal(new Set(prompts).size, ids.length);
}

function runHardUsesCuratedWhenAvailable() {
  const ids = selectQuestionIdsForCategory(
    QUIZ_CATEGORY_MOVIES_POP_CULTURE,
    QUIZ_DIFFICULTY_HARD,
    [],
    () => 0.42,
  );
  assert.equal(ids.length, QUESTIONS_PER_GAME);
  assertUniquePrompts(ids);
  const curated = ids.filter((id) => getQuestionByBankId(id).curatedHard);
  assert.ok(curated.length >= 40, `expected mostly curated hard, got ${curated.length}`);
}

function runHardNoPromptRepeatWhenPoolAllows() {
  const first = selectQuestionIdsForCategory(
    QUIZ_CATEGORY_MOVIES_POP_CULTURE,
    QUIZ_DIFFICULTY_HARD,
    [],
    () => 0.1,
  );
  let second: number[];
  try {
    second = selectQuestionIdsForCategory(
      QUIZ_CATEGORY_MOVIES_POP_CULTURE,
      QUIZ_DIFFICULTY_HARD,
      first,
      () => 0.9,
    );
  } catch {
    return;
  }
  if (second.length < QUESTIONS_PER_GAME) return;
  const firstPrompts = new Set(first.map((id) => normalizeQuizPrompt(getQuestionByBankId(id).prompt)));
  for (const id of second) {
    const key = normalizeQuizPrompt(getQuestionByBankId(id).prompt);
    assert.ok(!firstPrompts.has(key), `prompt repeated: ${key}`);
  }
}

runHardUsesCuratedWhenAvailable();
runHardNoPromptRepeatWhenPoolAllows();
console.log("funquiz-hard-selection.test.ts OK");
