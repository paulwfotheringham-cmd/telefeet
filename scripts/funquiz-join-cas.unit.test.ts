import assert from "node:assert/strict";
import { GAME_MODE_PLAY_TOGETHER } from "../lib/funquiz/constants";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { addPlayer, createRoom, startGame } from "../lib/funquiz/game-logic";
import { mergePlayersForSave } from "../lib/funquiz/store";

function runSaveMergeAfterFirstJoinWins() {
  const hostOnly = createRoom(
    "host",
    "Host",
    "JN0001",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  const withGuest = addPlayer(hostOnly, "guest-a", "Guest A");
  const merged = mergePlayersForSave(withGuest.players, hostOnly.players);
  assert.equal(merged.length, 2);
  assert.deepEqual(
    merged.map((p) => p.id).sort(),
    ["guest-a", "host"],
  );
}

function runSecondGuestRejectedWhenFull() {
  let room = createRoom(
    "host",
    "Host",
    "JN0002",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest-a", "Guest A");
  assert.throws(() => addPlayer(room, "guest-b", "Guest B"), /full/i);
}

function runJoinAfterStartRejected() {
  let room = createRoom(
    "host",
    "Host",
    "JN0003",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  assert.throws(() => addPlayer(room, "late", "Late"), /already started/i);
}

function runRejoinSamePlayerIdempotent() {
  let room = createRoom(
    "host",
    "Host",
    "JN0004",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  const again = addPlayer(room, "guest", "Guest");
  assert.equal(again.players.length, 2);
}

runSaveMergeAfterFirstJoinWins();
runSecondGuestRejectedWhenFull();
runJoinAfterStartRejected();
runRejoinSamePlayerIdempotent();
console.log("funquiz-join-cas.unit.test.ts OK");
