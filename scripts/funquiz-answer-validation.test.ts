import assert from "node:assert/strict";
import { QUIZ_CATEGORY_CAPITAL_POPULATIONS, QUIZ_CATEGORY_GENERAL_MILITARY } from "../lib/funquiz/categories";
import { gradeAnswer, normalizeChoiceIndex } from "../lib/funquiz/answer-validation";
import { GAME_MODE_SINGLE } from "../lib/funquiz/constants";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
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

function runPopulationGuess() {
  let room = createRoom(
    "host",
    "Host",
    "POP001",
    GAME_MODE_SINGLE,
    QUIZ_CATEGORY_CAPITAL_POPULATIONS,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  assert.ok(q.estimate);
  const actual = q.estimate!.value;
  room = submitAnswer(room, "host", String(actual + 2_000_000));
  const close = toClientState(room, "host");
  assert.equal(close.answerFeedback?.correct, true);
  assert.equal(close.answerFeedback?.correctLabel, actual.toLocaleString("en-US"));
  assert.equal(close.players.find((p) => p.id === "host")?.answerIndex !== actual, true);
  assert.ok((room.players.find((p) => p.id === "host")?.answer ?? 99) <= 3);

  let miss = createRoom(
    "host",
    "Host",
    "POP002",
    GAME_MODE_SINGLE,
    QUIZ_CATEGORY_CAPITAL_POPULATIONS,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  miss = startGame(miss, "host");
  const missQ = getQuestionByBankId(miss.questionOrder[0]!);
  miss = submitAnswer(miss, "host", "1,000");
  const far = toClientState(miss, "host");
  assert.equal(far.answerFeedback?.correct, false);
  assert.equal(far.answerFeedback?.correctLabel, missQ.estimate!.value.toLocaleString("en-US"));
  assert.equal(far.question?.input, "population");
  assert.equal(far.question?.options.length, 0);
}

runGradeEveryOptionPosition();
runPopulationGuess();
runNormalizeChoiceIndex();
runFeedbackMatchesScore();
runTakeTurnsRevealFeedback();
console.log("funquiz-answer-validation.test.ts OK");
