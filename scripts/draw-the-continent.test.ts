import assert from "node:assert/strict";
import { scoreDrawing } from "../lib/draw-the-continent/judge";
import { CONTINENTS, CONTINENT_ROUNDS } from "../lib/draw-the-continent/continents";
import {
  addDrawPlayer,
  createDrawRoom,
  startDrawGame,
  submitDrawing,
  tickDrawRoom,
  toDrawClientState,
  REVEAL_MS,
} from "../lib/draw-the-continent/room";

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

assert.equal(CONTINENT_ROUNDS, 7);
assert.equal(CONTINENTS.length, 7);
assert.equal(new Set(CONTINENTS.map((continent) => continent.id)).size, 7);
for (const title of ["Africa", "Antarctica", "Asia", "Europe", "North America", "Australia", "South America"]) {
  assert.ok(CONTINENTS.some((continent) => continent.title === title), title);
}

let room = createDrawRoom("host", "Alex", "ABCDEF", 1_000);
room = addDrawPlayer(room, "guest", "Sam");
room = startDrawGame(room, "host", mulberry32(3), 2_000);
assert.equal(room.organs.length, 7);
assert.equal(new Set(room.organs).size, 7);
const hidden = toDrawClientState(room, "guest");
assert.equal(hidden.boards.length, 0);
assert.equal(hidden.totalRounds, 7);

room = submitDrawing(room, "host", [stroke], 3_000);
assert.equal(toDrawClientState(room, "guest").phase, "draw");
room = submitDrawing(room, "guest", [stroke], 3_100);
const revealed = toDrawClientState(room, "guest");
assert.equal(revealed.phase, "reveal");
assert.equal(revealed.boards.length, 2);
assert.match(revealed.statusMessage ?? "", /closer|close/);
const after = tickDrawRoom(room, 4_100 + REVEAL_MS);
assert.equal(after.phase, "draw");
assert.equal(after.turnIndex, 1);
assert.notEqual(after.organs[1], after.organs[0]);

const trace = {
  color: "#0f172a",
  size: 22,
  points: [250, 200, 450, 350, 700, 500, 550, 850, 350, 700],
};
assert.ok(scoreDrawing("Africa", [trace]) > scoreDrawing("Africa", [stroke]));

console.log("draw-the-continent.test.ts OK");
