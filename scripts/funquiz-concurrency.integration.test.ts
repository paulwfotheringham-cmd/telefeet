/**
 * Live DB: parallel lifeline requests must consume fifty_fifty at most once.
 * Skips when Supabase service role is not configured.
 */
import assert from "node:assert/strict";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { GAME_MODE_SHARED_MILLIONAIRE } from "../lib/funquiz/constants";
import { createRoom, startGame } from "../lib/funquiz/game-logic";
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
  console.log("funquiz-concurrency integration OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
