import assert from "node:assert/strict";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { GAME_MODE_SHARED_MILLIONAIRE, GAME_MODE_TAKE_TURNS } from "../lib/funquiz/constants";
import {
  addPlayer,
  createRoom,
  startGame,
  submitAnswer,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import { dbRowsToRoom, roomToDbRows } from "../lib/funquiz/db-mapper";
import { MILLIONAIRE_DISCUSSION_MS } from "../lib/funquiz/millionaire/config";
import {
  millionaireFinalizeTeamAnswer,
  millionaireLockAnswer,
  millionaireTickRoom,
  millionaireUseLifeline,
} from "../lib/funquiz/millionaire/logic";
import { getQuestionByBankId } from "../lib/funquiz/questions";

function millionaireRoom(code: string) {
  return createRoom(
    "host",
    "Host",
    code,
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
}

function answerCorrectForAllPlayers(room: ReturnType<typeof createRoom>) {
  const q = getQuestionByBankId(room.questionOrder[room.questionIndex]!);
  let next = room;
  for (const p of room.players) {
    next = submitAnswer(next, p.id, q.correctIndex);
    next = millionaireLockAnswer(next, p.id, q.correctIndex);
  }
  return next;
}

function advanceThroughReveal(room: ReturnType<typeof createRoom>) {
  let next = tickRoom(room, Date.now() + 10_000);
  return millionaireTickRoom(next, Date.now() + 10_000);
}

function advanceCorrectCount(room: ReturnType<typeof createRoom>, count: number) {
  let r = room;
  for (let i = 0; i < count; i++) {
    r = answerCorrectForAllPlayers(r);
    r = advanceThroughReveal(r);
  }
  return r;
}

function runBothSameAnswer() {
  let room = millionaireRoom("PM0001");
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  room = millionaireLockAnswer(room, "host", q.correctIndex);
  room = submitAnswer(room, "guest", q.correctIndex);
  room = millionaireLockAnswer(room, "guest", q.correctIndex);
  assert.equal(room.phase, "reveal");
}

function runHostFinalizesGuestChoice() {
  let room = millionaireRoom("PM0002");
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  room = millionaireLockAnswer(room, "host", wrong);
  room = submitAnswer(room, "guest", q.correctIndex);
  room = millionaireLockAnswer(room, "guest", q.correctIndex);
  assert.equal(room.phase, "discussion");
  const hostView = toClientState(room, "host");
  assert.equal(hostView.correctIndex, null);
  room = millionaireFinalizeTeamAnswer(room, "host", q.correctIndex);
  assert.equal(room.phase, "reveal");
  room = advanceThroughReveal(room);
  assert.equal(room.questionIndex, 1);
}

function runDisagreementDiscussionTimeout() {
  let room = millionaireRoom("PM0003");
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", q.correctIndex);
  room = millionaireLockAnswer(room, "host", q.correctIndex);
  room = submitAnswer(room, "guest", wrong);
  room = millionaireLockAnswer(room, "guest", wrong);
  assert.equal(room.phase, "discussion");
  room = millionaireTickRoom(room, Date.now() + MILLIONAIRE_DISCUSSION_MS + 1);
  assert.equal(room.phase, "question");
  assert.equal(room.millionaire!.locks.host?.locked, false);
  assert.equal(room.millionaire!.locks.guest?.locked, false);
}

function runDuplicateLockIdempotent() {
  let room = millionaireRoom("PM0004");
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  room = millionaireLockAnswer(room, "host", q.correctIndex);
  assert.equal(room.phase, "question");
  const again = millionaireLockAnswer(room, "host", q.correctIndex);
  assert.equal(again.phase, "question");
  assert.equal(again.millionaire!.locks.host?.locked, true);
}

function runDoubleLifelineNoOp() {
  let room = millionaireRoom("PM0005");
  room = startGame(room, "host");
  room = millionaireUseLifeline(room, "host", "fifty_fifty");
  const eliminated = room.millionaire!.eliminatedOptionIndices.length;
  const again = millionaireUseLifeline(room, "host", "fifty_fifty");
  assert.equal(again.millionaire!.eliminatedOptionIndices.length, eliminated);
  assert.equal(again.millionaire!.lifelinesUsed.fifty_fifty, true);
}

function runChangeQuestionOnce() {
  let room = millionaireRoom("PM0006");
  room = startGame(room, "host");
  const firstId = room.questionOrder[0]!;
  room = millionaireUseLifeline(room, "host", "change_question");
  assert.notEqual(room.questionOrder[0], firstId);
  const second = millionaireUseLifeline(room, "host", "change_question");
  assert.equal(second.questionOrder[0], room.questionOrder[0]);
}

function runWrongBeforeQ3AwardsZero() {
  let room = millionaireRoom("PM0007");
  room = startGame(room, "host"); // solo
  const q = getQuestionByBankId(room.questionOrder[0]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  room = millionaireLockAnswer(room, "host", wrong);
  room = advanceThroughReveal(room);
  assert.equal(room.phase, "lost");
  assert.equal(room.millionaire!.finalAwardedPrize, 0);
}

function runWrongAfterQ3Awards500() {
  let room = millionaireRoom("PM0008");
  room = startGame(room, "host"); // solo
  room = advanceCorrectCount(room, 3);
  assert.equal(room.millionaire!.securedPrize, 500);
  const q = getQuestionByBankId(room.questionOrder[3]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  room = millionaireLockAnswer(room, "host", wrong);
  room = advanceThroughReveal(room);
  assert.equal(room.phase, "lost");
  assert.equal(room.millionaire!.finalAwardedPrize, 500);
}

function runWrongAfterQ6Awards10k() {
  let room = millionaireRoom("PM0009");
  room = startGame(room, "host"); // solo
  room = advanceCorrectCount(room, 6);
  assert.equal(room.millionaire!.securedPrize, 10_000);
  const q = getQuestionByBankId(room.questionOrder[6]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  room = millionaireLockAnswer(room, "host", wrong);
  room = advanceThroughReveal(room);
  assert.equal(room.millionaire!.finalAwardedPrize, 10_000);
}

function runRefreshRoundtripMidGame() {
  let room = millionaireRoom("PM0010");
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  room = advanceCorrectCount(room, 2);
  const { room: row, players } = roomToDbRows(room);
  const back = dbRowsToRoom(
    { ...row, created_at: new Date(room.createdAt).toISOString() },
    players,
  );
  assert.equal(back.phase, "question");
  assert.equal(back.questionIndex, 2);
  assert.equal(back.millionaire!.securedPrize, 200);
  assert.equal(back.players.length, 2);
}

function runStaleFinalizeRejected() {
  let room = millionaireRoom("PM0011");
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  room = millionaireLockAnswer(room, "host", wrong);
  room = submitAnswer(room, "guest", q.correctIndex);
  room = millionaireLockAnswer(room, "guest", q.correctIndex);
  room = millionaireFinalizeTeamAnswer(room, "host", q.correctIndex);
  assert.throws(() => millionaireFinalizeTeamAnswer(room, "host", q.correctIndex));
}

function runG1RoomWithoutMillionaireState() {
  const room = createRoom(
    "host",
    "Host",
    "TT0001",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  const { room: row, players } = roomToDbRows(room);
  const back = dbRowsToRoom(
    { ...row, created_at: new Date(room.createdAt).toISOString(), millionaire_state: null },
    players,
  );
  assert.equal(back.gameMode, GAME_MODE_TAKE_TURNS);
  assert.equal(back.millionaire, undefined);
}

runBothSameAnswer();
runHostFinalizesGuestChoice();
runDisagreementDiscussionTimeout();
runDuplicateLockIdempotent();
runDoubleLifelineNoOp();
runChangeQuestionOnce();
runWrongBeforeQ3AwardsZero();
runWrongAfterQ3Awards500();
runWrongAfterQ6Awards10k();
runRefreshRoundtripMidGame();
runStaleFinalizeRejected();
runG1RoomWithoutMillionaireState();
console.log("funquiz-millionaire-premerge.test.ts OK");
