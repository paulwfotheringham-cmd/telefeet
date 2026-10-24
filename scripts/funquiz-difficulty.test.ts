import assert from "node:assert/strict";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import {
  QUIZ_DIFFICULTIES,
  QUIZ_DIFFICULTY_HARD,
  QUIZ_DIFFICULTY_INTERMEDIATE,
  isQuizDifficulty,
} from "../lib/funquiz/difficulties";
import { GAME_MODE_TAKE_TURNS, QUESTIONS_PER_GAME } from "../lib/funquiz/constants";
import { selectQuestionIdsForCategory, countQuestionsByCategoryAndDifficulty } from "../lib/funquiz/question-selection";
import { addPlayer, createRoom, startGame } from "../lib/funquiz/game-logic";
import { getQuestionByBankId } from "../lib/funquiz/questions";

function runDifficultyIds() {
  assert.ok(isQuizDifficulty("intermediate"));
  assert.ok(isQuizDifficulty("hard"));
  assert.ok(!isQuizDifficulty("easy"));
}

function runNoCrossDifficultyMix() {
  const intIds = selectQuestionIdsForCategory(QUIZ_CATEGORY_SPACE, QUIZ_DIFFICULTY_INTERMEDIATE);
  const hardIds = selectQuestionIdsForCategory(QUIZ_CATEGORY_SPACE, QUIZ_DIFFICULTY_HARD);
  for (const id of intIds) {
    assert.equal(getQuestionByBankId(id).difficulty, QUIZ_DIFFICULTY_INTERMEDIATE);
  }
  for (const id of hardIds) {
    assert.equal(getQuestionByBankId(id).difficulty, QUIZ_DIFFICULTY_HARD);
  }
  const overlap = intIds.filter((id) => hardIds.includes(id));
  assert.equal(overlap.length, 0);
}

function runGameStartHonorsDifficulty() {
  let room = createRoom(
    "h",
    "Host",
    "DIFF01",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_HARD,
  );
  room = addPlayer(room, "g", "Guest");
  room = startGame(room, "h");
  assert.equal(room.questionOrder.length, QUESTIONS_PER_GAME);
  for (const id of [...room.hostQuestionOrder, ...room.guestQuestionOrder]) {
    assert.equal(getQuestionByBankId(id).difficulty, QUIZ_DIFFICULTY_HARD);
  }
}

function runCapacityReport() {
  const counts = countQuestionsByCategoryAndDifficulty();
  for (const diff of QUIZ_DIFFICULTIES) {
    for (const cat of Object.keys(counts)) {
      const n = counts[cat]?.[diff.id] ?? 0;
      assert.ok(n >= QUESTIONS_PER_GAME, `${cat}/${diff.id} has ${n}`);
    }
  }
}

runDifficultyIds();
runNoCrossDifficultyMix();
runGameStartHonorsDifficulty();
runCapacityReport();
console.log("funquiz-difficulty.test.ts OK");
