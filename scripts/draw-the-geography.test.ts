import assert from "node:assert/strict";
import { scoreDrawing } from "../lib/draw-the-geography/judge";
import { FEATURES, GEOGRAPHY_ROUNDS } from "../lib/draw-the-geography/features";
import {
  addDrawPlayer,
  createDrawRoom,
  startDrawGame,
  submitDrawing,
  tickDrawRoom,
  toDrawClientState,
  REVEAL_MS,
} from "../lib/draw-the-geography/room";

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

assert.equal(GEOGRAPHY_ROUNDS, 20);
assert.ok(FEATURES.length >= 20);
assert.equal(new Set(FEATURES.map((item) => item.id)).size, FEATURES.length);
assert.equal(new Set(FEATURES.map((item) => item.title)).size, FEATURES.length);
for (const title of ["Scree slope", "Pyramid peak", "Hanging valley", "V-shaped valley", "Arête", "Clouds"]) {
  assert.ok(FEATURES.some((item) => item.title === title), title);
}

let room = createDrawRoom("host", "Alex", "ABCDEF", 1_000);
room = addDrawPlayer(room, "guest", "Sam");
room = startDrawGame(room, "host", mulberry32(5), 2_000);
assert.equal(room.organs.length, 20);
assert.equal(new Set(room.organs).size, 20);
assert.equal(toDrawClientState(room, "guest").boards.length, 0);
assert.equal(toDrawClientState(room, "guest").totalRounds, 20);

room = submitDrawing(room, "host", [stroke], 3_000);
assert.equal(toDrawClientState(room, "guest").phase, "draw");
room = submitDrawing(room, "guest", [stroke], 3_100);
const revealed = toDrawClientState(room, "guest");
assert.equal(revealed.phase, "reveal");
assert.equal(revealed.boards.length, 2);
assert.match(revealed.statusMessage ?? "", /closer|close/);
const after = tickDrawRoom(room, 4_100 + REVEAL_MS);
assert.equal(after.phase, "draw");
assert.notEqual(after.organs[1], after.organs[0]);

const trace = {
  color: "#0f172a",
  size: 22,
  points: [400, 150, 500, 300, 700, 400, 700, 800, 450, 850, 400, 500],
};
assert.ok(scoreDrawing("Pyramid peak", [trace]) > scoreDrawing("Pyramid peak", [stroke]));

console.log("draw-the-geography.test.ts OK");
