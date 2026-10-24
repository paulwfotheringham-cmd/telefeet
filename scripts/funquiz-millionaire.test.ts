import assert from "node:assert/strict";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { GAME_MODE_SHARED_MILLIONAIRE } from "../lib/funquiz/constants";
import {
  addPlayer,
  createRoom,
  startGame,
  submitAnswer,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import { dbRowsToRoom, roomToDbRows } from "../lib/funquiz/db-mapper";
import {
  MILLIONAIRE_LADDER,
  MILLIONAIRE_QUESTION_COUNT,
  securedPrizeAfterCorrect,
} from "../lib/funquiz/millionaire/config";
import {
  millionaireFinalizeTeamAnswer,
  millionaireLockAnswer,
  millionaireUseLifeline,
  millionaireWalkAway,
} from "../lib/funquiz/millionaire/logic";
import { selectMillionaireQuestionIds } from "../lib/funquiz/millionaire/select-questions";
import { getQuestionByBankId } from "../lib/funquiz/questions";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function runLadderConfig() {
  assert.equal(MILLIONAIRE_LADDER.length, 10);
  assert.equal(MILLIONAIRE_LADDER[9], 1_000_000);
  assert.equal(securedPrizeAfterCorrect(0, 2), 500);
}

function runQuestionSelectionUnique() {
  const ids = selectMillionaireQuestionIds(QUIZ_CATEGORY_SPACE, seededRandom(42));
  assert.equal(ids.length, MILLIONAIRE_QUESTION_COUNT);
  assert.equal(new Set(ids).size, MILLIONAIRE_QUESTION_COUNT);
}

function runSoloCorrectAdvance() {
  let room = createRoom(
    "host",
    "Host",
    "MM0001",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  assert.equal(room.questionOrder.length, 10);
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  room = submitAnswer(room, "host", q.correctIndex);
  room = millionaireLockAnswer(room, "host", q.correctIndex);
  assert.equal(room.phase, "reveal");
  room = tickRoom(room, Date.now() + 10_000);
  assert.equal(room.phase, "question");
  assert.equal(room.questionIndex, 1);
  assert.equal(room.millionaire!.securedPrize, 100);
}

function runWrongAnswerLost() {
  let room = createRoom(
    "host",
    "H",
    "MM0002",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", wrong);
  room = millionaireLockAnswer(room, "host", wrong);
  room = tickRoom(room, Date.now() + 10_000);
  assert.equal(room.phase, "lost");
  assert.equal(room.millionaire!.finalAwardedPrize, 0);
}

function runWalkAway() {
  let room = createRoom(
    "host",
    "H",
    "MM0003",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const q0 = getQuestionByBankId(room.questionOrder[0]!);
  room = submitAnswer(room, "host", q0.correctIndex);
  room = millionaireLockAnswer(room, "host", q0.correctIndex);
  room = tickRoom(room, Date.now() + 10_000);
  room = millionaireWalkAway(room, "host");
  assert.equal(room.phase, "walkaway");
  assert.equal(room.millionaire!.finalAwardedPrize, 100);
}

function runFiftyFifty() {
  let room = createRoom(
    "host",
    "H",
    "MM0004",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  room = millionaireUseLifeline(room, "host", "fifty_fifty");
  assert.equal(room.millionaire!.eliminatedOptionIndices.length, 2);
  assert.equal(room.millionaire!.lifelinesUsed.fifty_fifty, true);
}

function runTwoPlayerDisagreementFinalize() {
  let room = createRoom(
    "host",
    "Host",
    "MM0005",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  const wrong = q.correctIndex === 0 ? 1 : 0;
  room = submitAnswer(room, "host", q.correctIndex);
  room = millionaireLockAnswer(room, "host", q.correctIndex);
  room = submitAnswer(room, "guest", wrong);
  room = millionaireLockAnswer(room, "guest", wrong);
  assert.equal(room.phase, "discussion");
  room = millionaireFinalizeTeamAnswer(room, "host", q.correctIndex);
  assert.equal(room.phase, "reveal");
  const hostView = toClientState(room, "host");
  const guestView = toClientState(room, "guest");
  assert.equal(hostView.jointScore, guestView.jointScore);
}

function runWinAllTenQuestions() {
  let room = createRoom(
    "host",
    "H",
    "MM0007",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  for (let i = 0; i < MILLIONAIRE_QUESTION_COUNT; i++) {
    assert.equal(room.questionIndex, i);
    const q = getQuestionByBankId(room.questionOrder[i]!);
    room = submitAnswer(room, "host", q.correctIndex);
    room = millionaireLockAnswer(room, "host", q.correctIndex);
    assert.equal(room.phase, "reveal");
    room = tickRoom(room, Date.now() + 10_000);
    if (i < MILLIONAIRE_QUESTION_COUNT - 1) {
      assert.equal(room.phase, "question");
    }
  }
  assert.equal(room.phase, "won");
  assert.equal(room.millionaire!.finalAwardedPrize, 1_000_000);
  assert.equal(room.millionaire!.outcome, "won");
}

function runPersistenceRoundtrip() {
  let room = createRoom(
    "host",
    "H",
    "MM0006",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const { room: row, players } = roomToDbRows(room);
  const back = dbRowsToRoom(
    { ...row, created_at: new Date(room.createdAt).toISOString() },
    players,
  );
  assert.equal(back.millionaire?.securedPrize, 0);
  assert.equal(back.questionOrder.length, 10);
}

runLadderConfig();
runQuestionSelectionUnique();
runSoloCorrectAdvance();
runWrongAnswerLost();
runWalkAway();
runFiftyFifty();
runTwoPlayerDisagreementFinalize();
runWinAllTenQuestions();
runPersistenceRoundtrip();
console.log("funquiz-millionaire.test.ts OK");
