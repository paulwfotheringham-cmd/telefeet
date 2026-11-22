import assert from "node:assert/strict";
import { scoreDrawing } from "../lib/draw-the-appliance/judge";
import { APPLIANCES, APPLIANCE_ROUNDS } from "../lib/draw-the-appliance/appliances";
import {
  addDrawPlayer,
  createDrawRoom,
  startDrawGame,
  submitDrawing,
  tickDrawRoom,
  toDrawClientState,
  REVEAL_MS,
} from "../lib/draw-the-appliance/room";

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

assert.equal(APPLIANCE_ROUNDS, 20);
assert.ok(APPLIANCES.length >= 20);
assert.equal(new Set(APPLIANCES.map((item) => item.id)).size, APPLIANCES.length);
assert.equal(new Set(APPLIANCES.map((item) => item.title)).size, APPLIANCES.length);
for (const title of ["Fridge", "Kettle", "Washing machine", "Television", "Vacuum cleaner", "Microwave"]) {
  assert.ok(APPLIANCES.some((item) => item.title === title), title);
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
assert.ok(scoreDrawing("Fridge", [trace]) > scoreDrawing("Fridge", [stroke]));

console.log("draw-the-appliance.test.ts OK");
