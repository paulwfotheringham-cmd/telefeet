import assert from "node:assert/strict";
import { dbRowsToRoom, roomToDbRows } from "../lib/funquiz/db-mapper";
import { GAME_MODE_SHARED_MILLIONAIRE } from "../lib/funquiz/constants";
import { createRoom, startGame } from "../lib/funquiz/game-logic";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";

function runDbUpdatedAtRoundtrip() {
  let room = createRoom(
    "host",
    "Host",
    "CAS001",
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const basis = "2026-10-25T10:00:00.000Z";
  const { room: row, players } = roomToDbRows(room);
  const back = dbRowsToRoom(
    {
      ...row,
      created_at: new Date(room.createdAt).toISOString(),
      updated_at: basis,
    },
    players,
  );
  assert.equal(back.dbUpdatedAtIso, basis);
  back.updatedAt = Date.now();
  const { room: row2 } = roomToDbRows(back);
  assert.notEqual(row2.updated_at, basis);
}

runDbUpdatedAtRoundtrip();
console.log("funquiz store CAS unit OK");
