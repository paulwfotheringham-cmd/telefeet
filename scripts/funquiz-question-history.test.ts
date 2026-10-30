import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { GAME_MODE_PLAY_TOGETHER, GAME_MODE_TAKE_TURNS } from "../lib/funquiz/constants";
import {
  addPlayer,
  allocateQuestionsForGame,
  createRoom,
  resetRoomForNewGame,
  startGame,
} from "../lib/funquiz/game-logic";
import { allocatedBankIdsForSession } from "../lib/funquiz/session-questions";
import { playedIdsForTopic } from "../lib/funquiz/question-history";

function runSecondGameUsesFreshQuestions() {
  let room = createRoom(
    "host",
    "Host",
    "HIST01",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const firstIds = new Set(allocatedBankIdsForSession(room));

  room = { ...room, phase: "finished" as const };
  room = resetRoomForNewGame(
    room,
    "host",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const secondIds = allocatedBankIdsForSession(room);
  for (const id of secondIds) {
    assert.ok(!firstIds.has(id), `question ${id} repeated across games`);
  }
}

function runTakeTurnsHistoryKey() {
  let room = createRoom(
    "h",
    "H",
    "HIST02",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "g", "G");
  room = startGame(room, "h");
  const used = playedIdsForTopic(
    room,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  assert.equal(used.length, 50);
  const fresh = allocateQuestionsForGame(
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
    used,
  );
  const overlap = fresh.questionOrder.filter((id) => used.includes(id));
  assert.equal(overlap.length, 0);
}

runSecondGameUsesFreshQuestions();
runTakeTurnsHistoryKey();
console.log("funquiz-question-history.test.ts OK");
