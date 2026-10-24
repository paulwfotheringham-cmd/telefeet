import assert from "node:assert/strict";
import { playerRowsFromSnapshot } from "../lib/funquiz/db-mapper";
import {
  absorbPlayerRowsIntoMap,
  mergePlayersForSave,
  parsePlayerJsonRows,
  shouldStopLobbyPlayerLoad,
} from "../lib/funquiz/store";
import type { FunquizPlayerRow } from "../lib/funquiz/db-mapper";
import type { QuizPlayer } from "../lib/funquiz/types";

function row(id: string, name: string): FunquizPlayerRow {
  return { room_code: "ABC123", player_id: id, name, score: 0, answer: null };
}

function player(id: string, name: string): QuizPlayer {
  return { id, name, score: 0, answer: null };
}

function runLobbyLoadDoesNotStopOnStaleSingleCount() {
  assert.equal(shouldStopLobbyPlayerLoad(1, 1, false), false);
  assert.equal(shouldStopLobbyPlayerLoad(1, 2, false), false);
  assert.equal(shouldStopLobbyPlayerLoad(2, 2, false), true);
  assert.equal(shouldStopLobbyPlayerLoad(1, 2, true), true);
}

function runSnapshotStringJsonParsesTwoPlayers() {
  const json = JSON.stringify([
    row("host", "Host"),
    row("guest", "Guest"),
  ]);
  const parsed = playerRowsFromSnapshot("ABC123", json);
  assert.equal(parsed.length, 2);
}

function runMonotonicResolvedReadRecoversGuest() {
  const best = new Map<string, FunquizPlayerRow>();
  absorbPlayerRowsIntoMap(best, parsePlayerJsonRows([row("host", "Host")]));
  absorbPlayerRowsIntoMap(
    best,
    parsePlayerJsonRows([row("host", "Host"), row("guest", "Guest")]),
  );
  assert.equal(best.size, 2);
}

function runSaveMergeKeepsGuestWhenMemoryAndSnapshotStale() {
  const stalePoll: QuizPlayer[] = [player("host", "Host")];
  const staleSnapshot: QuizPlayer[] = [player("host", "Host")];
  const resolved: QuizPlayer[] = [player("host", "Host"), player("guest", "Guest")];
  const mergedFromDb = mergePlayersForSave(
    mergePlayersForSave(staleSnapshot, staleSnapshot),
    resolved,
  );
  const merged = mergePlayersForSave(stalePoll, mergedFromDb);
  assert.equal(merged.length, 2);
}

runLobbyLoadDoesNotStopOnStaleSingleCount();
runSnapshotStringJsonParsesTwoPlayers();
runMonotonicResolvedReadRecoversGuest();
runSaveMergeKeepsGuestWhenMemoryAndSnapshotStale();
console.log("funquiz concurrent join unit OK");
