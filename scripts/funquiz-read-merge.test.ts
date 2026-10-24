import assert from "node:assert/strict";
import { mergePlayerRowsForRead, mergePlayersForSave } from "../lib/funquiz/store";
import type { FunquizPlayerRow } from "../lib/funquiz/db-mapper";
import type { QuizPlayer } from "../lib/funquiz/types";

function row(id: string, name: string): FunquizPlayerRow {
  return { room_code: "ABC123", player_id: id, name, score: 0, answer: null };
}

function runReadMergeRecoversGuestFromTable() {
  const staleRpc = [row("host", "Paul")];
  const table = [row("host", "Paul"), row("guest", "Phone")];
  const merged = mergePlayerRowsForRead(staleRpc, table);
  assert.equal(merged.length, 2);
  assert.equal(merged.find((p) => p.player_id === "guest")?.name, "Phone");
}

function runReadMergeTableWinsOnClash() {
  const json = [row("host", "Paul"), row("guest", "OldName")];
  const table = [row("host", "Paul"), row("guest", "Phone")];
  const merged = mergePlayerRowsForRead(json, table);
  assert.equal(merged.find((p) => p.player_id === "guest")?.name, "Phone");
}

function runReadMergeNoDuplicateIds() {
  const a = [row("host", "A"), row("guest", "B")];
  const b = [row("host", "A"), row("guest", "B")];
  const merged = mergePlayerRowsForRead(a, b);
  assert.equal(merged.length, 2);
}

function runSaveMergeConcurrentStaleHostSave() {
  const staleSave: QuizPlayer[] = [{ id: "host", name: "Paul", score: 0, answer: null }];
  const dbAfterJoin: QuizPlayer[] = [
    { id: "host", name: "Paul", score: 0, answer: null },
    { id: "guest", name: "Phone", score: 0, answer: null },
  ];
  const merged = mergePlayersForSave(staleSave, dbAfterJoin);
  assert.equal(merged.length, 2);
}

runReadMergeRecoversGuestFromTable();
runReadMergeTableWinsOnClash();
runReadMergeNoDuplicateIds();
runSaveMergeConcurrentStaleHostSave();
console.log("funquiz read merge unit OK");
