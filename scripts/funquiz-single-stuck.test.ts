import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GEOGRAPHY, QUIZ_CATEGORY_GENERAL_MILITARY } from "../lib/funquiz/categories";
import { GAME_MODE_SINGLE } from "../lib/funquiz/constants";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import {
  continueFromReveal,
  createRoom,
  startGame,
  submitAnswer,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import { getQuestionByBankId } from "../lib/funquiz/questions";
import type { QuizRoom } from "../lib/funquiz/types";

function soloRoom(code: string, category = QUIZ_CATEGORY_GEOGRAPHY): QuizRoom {
  let room = createRoom(
    "host",
    "Player",
    code,
    GAME_MODE_SINGLE,
    category,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  return room;
}

/** Orphan answer on the question screen with no answer log — classic stuck UI. */
function runHealClearsOrphanAnswer() {
  let room = soloRoom("STK001");
  const host = room.players[0]!;
  room = {
    ...room,
    phase: "question",
    players: [{ ...host, answer: 1 }],
  };
  const viewBefore = toClientState(room, "host");
  assert.equal(viewBefore.phase, "question");
  assert.equal(viewBefore.canSubmitAnswer, false);
  assert.equal(viewBefore.you.answer, 1);

  const healed = tickRoom(room);
  const view = toClientState(healed, "host");
  assert.equal(view.phase, "question");
  assert.equal(view.you.answer, null);
  assert.equal(view.canSubmitAnswer, true);
}

/** Answer log exists but phase never flipped to reveal. */
function runHealPromotesLoggedAnswerToReveal() {
  let room = soloRoom("STK002", QUIZ_CATEGORY_GENERAL_MILITARY);
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  room = {
    ...room,
    phase: "question",
    players: room.players.map((p) => ({ ...p, answer: q.correctIndex })),
    answerLog: [
      {
        sessionId: room.sessionId,
        turnIndex: 0,
        bankId,
        playerId: "host",
        choiceIndex: q.correctIndex,
        correct: true,
      },
    ],
    jointScore: 1,
  };
  const healed = tickRoom(room);
  assert.equal(healed.phase, "reveal");
  const view = toClientState(healed, "host");
  assert.equal(view.phase, "reveal");
  assert.ok(view.answerFeedback);
  assert.equal(view.answerFeedback!.correct, true);
}

/** Continue from locked question with orphan answer unlocks picks. */
function runContinueUnlocksOrphan() {
  let room = soloRoom("STK003");
  room = {
    ...room,
    players: room.players.map((p) => ({ ...p, answer: 2 })),
  };
  const next = continueFromReveal(room, "host");
  const view = toClientState(next, "host");
  assert.equal(view.phase, "question");
  assert.equal(view.canSubmitAnswer, true);
  assert.equal(view.you.answer, null);
}

/** Continue from locked question with a log lands on reveal (not skipped). */
function runContinueShowsRevealThenAdvances() {
  let room = soloRoom("STK004");
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  room = {
    ...room,
    phase: "question",
    players: room.players.map((p) => ({ ...p, answer: 0 })),
    answerLog: [
      {
        sessionId: room.sessionId,
        turnIndex: 0,
        bankId,
        playerId: "host",
        choiceIndex: 0,
        correct: 0 === q.correctIndex,
      },
    ],
  };
  const revealed = continueFromReveal(room, "host");
  assert.equal(revealed.phase, "reveal");

  const advanced = continueFromReveal(revealed, "host");
  assert.equal(advanced.phase, "question");
  assert.equal(advanced.questionIndex, 1);
  assert.equal(advanced.players[0]!.answer, null);
}

/** Resubmit while orphan-locked still reaches reveal. */
function runResubmitClearsOrphanAndReveals() {
  let room = soloRoom("STK005");
  room = {
    ...room,
    players: room.players.map((p) => ({ ...p, answer: 1 })),
  };
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  room = submitAnswer(room, "host", q.correctIndex);
  assert.equal(room.phase, "reveal");
  assert.equal(toClientState(room, "host").answerFeedback?.correct, true);
}

function main() {
  runHealClearsOrphanAnswer();
  runHealPromotesLoggedAnswerToReveal();
  runContinueUnlocksOrphan();
  runContinueShowsRevealThenAdvances();
  runResubmitClearsOrphanAndReveals();
  console.log("funquiz-single-stuck.test.ts: ok");
}

main();
