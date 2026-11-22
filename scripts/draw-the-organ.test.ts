import assert from "node:assert/strict";
import { ORGAN_ROUNDS, ORGANS } from "../lib/draw-the-organ/organs";
import {
  addDrawPlayer,
  createDrawRoom,
  startDrawGame,
  submitDrawing,
  submitVote,
  tickDrawRoom,
  toDrawClientState,
  REVEAL_MS,
} from "../lib/draw-the-organ/room";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const stroke = { color: "#0f172a", size: 8, points: [10, 10, 40, 80] };

assert.equal(new Set(ORGANS.map((organ) => organ.id)).size, ORGANS.length);
assert.ok(ORGANS.length >= ORGAN_ROUNDS);

let room = createDrawRoom("host", "Alex", "ABCDEF", 1_000);
room = addDrawPlayer(room, "guest", "Sam");
room = startDrawGame(room, "host", mulberry32(1), 2_000);
assert.equal(room.organs.length, ORGAN_ROUNDS);
assert.equal(new Set(room.organs).size, ORGAN_ROUNDS);
const hidden = toDrawClientState(room, "guest");
assert.equal(hidden.boards.length, 0);
assert.equal(hidden.organ, room.organs[0]);

room = submitDrawing(room, "host", [stroke], 3_000);
const stillHidden = toDrawClientState(room, "guest");
assert.equal(stillHidden.boards.length, 0);
assert.equal(stillHidden.phase, "draw");
room = submitDrawing(room, "guest", [stroke], 3_100);
const revealed = toDrawClientState(room, "guest");
assert.equal(revealed.phase, "vote");
assert.equal(revealed.boards.length, 2);
assert.equal(revealed.boards.some((board) => board.strokes.length === 1), true);

room = submitVote(room, "host", "guest", 4_000);
assert.equal(room.phase, "vote");
room = submitVote(room, "guest", "guest", 4_100);
assert.equal(room.phase, "reveal");
assert.equal(room.players.find((player) => player.id === "guest")?.score, 1);
assert.equal(room.players.find((player) => player.id === "host")?.score, 0);
const after = tickDrawRoom(room, 4_100 + REVEAL_MS);
assert.equal(after.phase, "draw");
assert.equal(after.turnIndex, 1);
assert.notEqual(after.organs[1], after.organs[0]);

assert.throws(() => submitDrawing(after, "host", [], 9_000), /Draw something before you submit/);

console.log("draw-the-organ.test.ts OK");
