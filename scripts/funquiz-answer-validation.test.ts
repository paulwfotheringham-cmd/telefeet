import assert from "node:assert/strict";
import { QUIZ_CATEGORY_CAPITAL_POPULATIONS, QUIZ_CATEGORY_CLOSEST, QUIZ_CATEGORY_GENERAL_MILITARY, QUIZ_CATEGORY_TRUE_OR_FALSE } from "../lib/funquiz/categories";
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

function runTrueOrFalse() {
  const q = QUIZ_QUESTIONS.find((item) => item.categoryId === QUIZ_CATEGORY_TRUE_OR_FALSE);
  assert.ok(q);
  assert.equal(q.options.length, 2);
  assert.deepEqual([...q.options].sort(), ["False", "True"]);
  const graded = gradeAnswer(q.id, q.correctIndex);
  assert.equal(graded.correct, true);
  assert.equal(graded.chosenLabel, q.options[q.correctIndex]);
}

function runClosestSoloAndRace() {
  let solo = createRoom(
    "host",
    "Host",
    "CLS001",
    GAME_MODE_SINGLE,
    QUIZ_CATEGORY_CLOSEST,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  solo = startGame(solo, "host");
  const actual = getQuestionByBankId(solo.questionOrder[0]!).estimate!.value;
  const window = getQuestionByBankId(solo.questionOrder[0]!).estimate!.tolerance;
  solo = submitAnswer(solo, "host", String(actual + window));
  const close = toClientState(solo, "host");
  assert.equal(close.phase, "reveal");
  assert.equal(close.question?.input, "closest");
  assert.equal(close.answerFeedback?.correct, true);
  assert.equal(close.answerFeedback?.note, "Within 10%.");
  assert.equal(close.jointScore, 1);

  let miss = createRoom(
    "host",
    "Host",
    "CLS002",
    GAME_MODE_SINGLE,
    QUIZ_CATEGORY_CLOSEST,
    QUIZ_DIFFICULTY_HARD,
  );
  miss = startGame(miss, "host");
  const hard = getQuestionByBankId(miss.questionOrder[0]!).estimate!;
  miss = submitAnswer(miss, "host", String(hard.value + hard.tolerance + 5));
  assert.equal(toClientState(miss, "host").answerFeedback?.note, "Further than 10%.");

  let race = createRoom(
    "host",
    "Host",
    "CLS003",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_CLOSEST,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  race = addPlayer(race, "guest", "Guest");
  race = startGame(race, "host");
  const target = getQuestionByBankId(race.questionOrder[0]!).estimate!.value;
  race = submitAnswer(race, "host", String(target + 50));
  const waiting = toClientState(race, "host");
  assert.equal(waiting.phase, "question");
  assert.equal(waiting.canSubmitAnswer, false);
  assert.equal(toClientState(race, "guest").canSubmitAnswer, true);
  race = submitAnswer(race, "guest", String(target + 1));
  const hostView = toClientState(race, "host");
  const guestView = toClientState(race, "guest");
  assert.equal(hostView.phase, "reveal");
  assert.equal(hostView.answerFeedback?.correct, false);
  assert.equal(hostView.answerFeedback?.note, "The other guess was closer.");
  assert.equal(guestView.answerFeedback?.correct, true);
  assert.equal(guestView.answerFeedback?.note, "You were closest.");
  assert.equal(guestView.answerFeedback?.guesses?.length, 2);
  assert.equal(race.players.find((p) => p.id === "guest")?.score, 1);
  assert.equal(race.players.find((p) => p.id === "host")?.score, 0);

  let tie = createRoom(
    "host",
    "Host",
    "CLS004",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_CLOSEST,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  tie = addPlayer(tie, "guest", "Guest");
  tie = startGame(tie, "host");
  tie = submitAnswer(tie, "guest", "10");
  tie = submitAnswer(tie, "host", "10");
  assert.equal(toClientState(tie, "host").answerFeedback?.note, "It's a tie. The closest guesses score.");
  assert.equal(tie.players.find((p) => p.id === "host")?.score, 1);
  assert.equal(tie.players.find((p) => p.id === "guest")?.score, 1);
}

runTrueOrFalse();
runClosestSoloAndRace();
runGradeEveryOptionPosition();
runPopulationGuess();
runNormalizeChoiceIndex();
runFeedbackMatchesScore();
runTakeTurnsRevealFeedback();
console.log("funquiz-answer-validation.test.ts OK");
