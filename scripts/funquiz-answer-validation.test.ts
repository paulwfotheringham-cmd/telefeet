import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GENERAL_MILITARY } from "../lib/funquiz/categories";
import { gradeAnswer, normalizeChoiceIndex } from "../lib/funquiz/answer-validation";
import {
  addPlayer,
  createRoom,
  startGame,
  submitAnswer,
  toClientState,
} from "../lib/funquiz/game-logic";
import { GAME_MODE_PLAY_TOGETHER, GAME_MODE_TAKE_TURNS } from "../lib/funquiz/constants";
import { QUIZ_DIFFICULTY_HARD } from "../lib/funquiz/difficulties";
import { getQuestionByBankId, QUIZ_QUESTIONS } from "../lib/funquiz/questions";

function runGradeEveryOptionPosition() {
  const samples = QUIZ_QUESTIONS.filter((q) => q.options.length === 4).slice(0, 120);
  for (const q of samples) {
    for (let i = 0; i < 4; i++) {
      const graded = gradeAnswer(q.id, i);
      assert.equal(graded.correctIndex, q.correctIndex);
      assert.equal(graded.correct, i === q.correctIndex);
      assert.equal(graded.chosenLabel, q.options[i]);
      assert.equal(graded.correctLabel, q.options[q.correctIndex]);
    }
  }
}

function runNormalizeChoiceIndex() {
  assert.equal(normalizeChoiceIndex(2), 2);
  assert.equal(normalizeChoiceIndex("3"), 3);
  assert.throws(() => normalizeChoiceIndex("2.5"), /invalid answer/i);
  assert.throws(() => normalizeChoiceIndex(null), /invalid answer/i);
}

function runFeedbackMatchesScore() {
  let room = createRoom(
    "host",
    "Host",
    "VAL001",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  const view = toClientState(room, "host");
  assert.equal(view.phase, "reveal");
  assert.ok(view.answerFeedback);
  assert.equal(view.answerFeedback!.correct, false);
  assert.equal(view.jointScore, 0);
  assert.equal(view.players.find((p) => p.id === "host")!.wasCorrect, false);
  assert.equal(view.answerFeedback!.chosenLabel, q.options[wrong]);
  assert.equal(view.answerFeedback!.correctLabel, q.options[q.correctIndex]);
}

function runTakeTurnsRevealFeedback() {
  let room = createRoom(
    "host",
    "Host",
    "VAL002",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const bankId = room.hostQuestionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  room = submitAnswer(room, "host", q.correctIndex);
  const view = toClientState(room, "host");
  assert.equal(view.phase, "reveal");
  assert.equal(view.answerFeedback?.correct, true);
  assert.equal(view.players.find((p) => p.id === "host")!.wasCorrect, true);

  const guestReveal = toClientState(room, "guest");
  assert.equal(guestReveal.phase, "reveal");
  assert.ok(guestReveal.answerFeedback);
  assert.equal(guestReveal.answerFeedback!.correct, true);
  assert.ok(guestReveal.question);
  assert.equal(guestReveal.question!.id, bankId);
}

runGradeEveryOptionPosition();
runNormalizeChoiceIndex();
runFeedbackMatchesScore();
runTakeTurnsRevealFeedback();
console.log("funquiz-answer-validation.test.ts OK");
