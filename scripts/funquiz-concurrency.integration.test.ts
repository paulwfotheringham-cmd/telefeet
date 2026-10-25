/**
 * Live DB: parallel lifeline requests must consume fifty_fifty at most once.
 * Skips when Supabase service role is not configured.
 */
import assert from "node:assert/strict";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { GAME_MODE_SHARED_MILLIONAIRE } from "../lib/funquiz/constants";
import { addPlayer, createRoom, startGame } from "../lib/funquiz/game-logic";
import { GAME_MODE_PLAY_TOGETHER } from "../lib/funquiz/constants";
import { millionaireUseLifeline } from "../lib/funquiz/millionaire/logic";
import {
  isQuizStoreConfigured,
  loadRoom,
  mutateRoomPersisted,
  persistNewRoom,
  deleteRoomForTest,
} from "../lib/funquiz/store";

async function main() {
  if (!isQuizStoreConfigured()) {
    console.log("funquiz-concurrency integration SKIP (no Supabase service role)");
    return;
  }

  const code = "CC9999";
  await deleteRoomForTest(code);

  let room = createRoom(
    "host-id",
    "Host",
    code,
    GAME_MODE_SHARED_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  await persistNewRoom(room);
  await mutateRoomPersisted(code, (r) => startGame(r, "host-id"));

  await Promise.all([
    mutateRoomPersisted(code, (r) => millionaireUseLifeline(r, "host-id", "fifty_fifty")),
    mutateRoomPersisted(code, (r) => millionaireUseLifeline(r, "host-id", "fifty_fifty")),
    mutateRoomPersisted(code, (r) => millionaireUseLifeline(r, "host-id", "fifty_fifty")),
  ]);

  const final = await loadRoom(code);
  assert.ok(final?.millionaire);
  assert.equal(final.millionaire.lifelinesUsed.fifty_fifty, true);
  assert.equal(final.millionaire.eliminatedOptionIndices.length, 2);

  await deleteRoomForTest(code);

  const joinCode = "CC8888";
  await deleteRoomForTest(joinCode);
  await persistNewRoom(
    createRoom(
      "host-id",
      "Host",
      joinCode,
      GAME_MODE_PLAY_TOGETHER,
      QUIZ_CATEGORY_SPACE,
      QUIZ_DIFFICULTY_INTERMEDIATE,
    ),
  );

  const joinResults = await Promise.allSettled([
    mutateRoomPersisted(joinCode, (r) => addPlayer(r, "guest-a", "Guest A")),
    mutateRoomPersisted(joinCode, (r) => addPlayer(r, "guest-b", "Guest B")),
  ]);
  const joinOk = joinResults.filter((r) => r.status === "fulfilled").length;
  const joinFail = joinResults.filter((r) => r.status === "rejected").length;
  assert.equal(joinOk, 1);
  assert.equal(joinFail, 1);
  const joined = await loadRoom(joinCode);
  assert.equal(joined?.players.length, 2);

  const raceCode = "CC7777";
  await deleteRoomForTest(raceCode);
  await persistNewRoom(
    createRoom(
      "host-id",
      "Host",
      raceCode,
      GAME_MODE_PLAY_TOGETHER,
      QUIZ_CATEGORY_SPACE,
      QUIZ_DIFFICULTY_INTERMEDIATE,
    ),
  );
  await Promise.allSettled([
    mutateRoomPersisted(raceCode, (r) => addPlayer(r, "guest-r", "Guest")),
    mutateRoomPersisted(raceCode, (r) => startGame(r, "host-id")),
  ]);
  const raced = await loadRoom(raceCode);
  assert.ok(raced);
  assert.ok(raced.phase === "lobby" || raced.phase === "question");
  if (raced.phase === "question") {
    assert.ok(raced.players.length >= 1);
  } else {
    assert.ok(raced.players.length <= 2);
  }
  await deleteRoomForTest(joinCode);
  await deleteRoomForTest(raceCode);

  console.log("funquiz-concurrency integration OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
