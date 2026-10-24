import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GEOGRAPHY } from "../lib/funquiz/categories";
import { GAME_MODE_PLAY_TOGETHER } from "../lib/funquiz/constants";
import {
  addPlayer,
  createRoom,
  startGame,
  submitAnswer,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import { dbRowsToRoom, roomToDbRows } from "../lib/funquiz/db-mapper";
import { getQuestionByBankId } from "../lib/funquiz/questions";

function runFlow() {
  let room = createRoom(
    "host-1",
    "Alice",
    "ABC123",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GEOGRAPHY,
  );
  assert.equal(room.phase, "lobby");

  room = addPlayer(room, "host-2", "Bob");
  assert.equal(room.players.length, 2);

  room = startGame(room, "host-1");
  assert.equal(room.phase, "question");

  const bankId = room.questionOrder[0];
  const q = getQuestionByBankId(bankId);

  room = submitAnswer(room, "host-1", q.correctIndex);
  assert.equal(room.phase, "reveal");
  room = tickRoom(room, Date.now() + 5000);
  assert.equal(room.phase, "question");
  room = submitAnswer(room, "host-1", q.correctIndex === 0 ? 1 : 0);
  assert.equal(room.phase, "reveal");
  assert.ok(room.players.find((p) => p.id === "host-1")!.score >= 1);

  room = tickRoom(room, Date.now() + 5000);
  assert.equal(room.phase, "question");
  assert.equal(room.questionIndex, 2);

  const hostView = toClientState(room, "host-1");
  assert.equal(hostView.question?.id, room.questionOrder[2]);
  assert.equal(hostView.correctIndex, null);

  let answered = submitAnswer(room, "host-1", 0);
  const revealView = toClientState(answered, "host-1");
  assert.equal(revealView.phase, "reveal");
  assert.notEqual(revealView.correctIndex, null);
}

function runMapperRoundtrip() {
  const room = createRoom(
    "p1",
    "Test",
    "XY12Z9",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GEOGRAPHY,
  );
  const withGuest = addPlayer(room, "p2", "Guest");
  const { room: row, players } = roomToDbRows(withGuest);
  assert.equal(row.code, "XY12Z9");
  assert.equal(players.length, 2);
  assert.equal(row.quiz_category, QUIZ_CATEGORY_GEOGRAPHY);
  const back = dbRowsToRoom(
    {
      ...row,
      created_at: new Date(withGuest.createdAt).toISOString(),
    },
    players,
  );
  assert.equal(back.quizCategoryId, QUIZ_CATEGORY_GEOGRAPHY);
}

runFlow();
runMapperRoundtrip();
console.log("funquiz-flow.test.ts OK");
