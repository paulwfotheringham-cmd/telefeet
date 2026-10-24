import assert from "node:assert/strict";
import { mergePlayersForSave } from "../lib/funquiz/store";
import type { QuizPlayer } from "../lib/funquiz/types";

function player(id: string, name: string): QuizPlayer {
  return { id, name, score: 0, answer: null };
}

function runMergeKeepsDbJoin() {
  const stale: QuizPlayer[] = [player("host", "Paul")];
  const db: QuizPlayer[] = [player("host", "Paul"), player("guest", "Phone")];
  const merged = mergePlayersForSave(stale, db);
  assert.equal(merged.length, 2);
  assert.deepEqual(
    merged.map((p) => p.id).sort(),
    ["guest", "host"],
  );
}

function runMergePrefersInMemoryMutation() {
  const inMem: QuizPlayer[] = [
    { id: "host", name: "Paul", score: 1, answer: 0 },
    { id: "guest", name: "Phone", score: 0, answer: 1 },
  ];
  const db: QuizPlayer[] = [
    { id: "host", name: "Paul", score: 0, answer: null },
    { id: "guest", name: "Phone", score: 0, answer: null },
  ];
  const merged = mergePlayersForSave(inMem, db);
  assert.equal(merged.find((p) => p.id === "host")?.score, 1);
  assert.equal(merged.find((p) => p.id === "guest")?.answer, 1);
}

runMergeKeepsDbJoin();
runMergePrefersInMemoryMutation();
console.log("funquiz save merge unit OK");
