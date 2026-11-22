import assert from "node:assert/strict";
import { scoreDrawing } from "../lib/draw-the-country/judge";
import { COUNTRIES, COUNTRY_ROUNDS } from "../lib/draw-the-country/countries";
import {
  addDrawPlayer,
  createDrawRoom,
  startDrawGame,
  submitDrawing,
  tickDrawRoom,
  toDrawClientState,
  REVEAL_MS,
} from "../lib/draw-the-country/room";

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

assert.equal(new Set(COUNTRIES.map((country) => country.id)).size, COUNTRIES.length);
assert.equal(new Set(COUNTRIES.map((country) => country.title)).size, COUNTRIES.length);
assert.equal(COUNTRY_ROUNDS, 20);
assert.ok(COUNTRIES.length >= COUNTRY_ROUNDS);
for (const title of ["Italy", "Japan", "Australia", "Brazil", "United States", "United Kingdom"]) {
  assert.ok(COUNTRIES.some((country) => country.title === title), title);
}

let room = createDrawRoom("host", "Alex", "ABCDEF", 1_000);
room = addDrawPlayer(room, "guest", "Sam");
room = startDrawGame(room, "host", mulberry32(7), 2_000);
assert.equal(room.organs.length, COUNTRY_ROUNDS);
assert.equal(new Set(room.organs).size, COUNTRY_ROUNDS);
const hidden = toDrawClientState(room, "guest");
assert.equal(hidden.boards.length, 0);
assert.equal(hidden.organ, room.organs[0]);

room = submitDrawing(room, "host", [stroke], 3_000);
assert.equal(toDrawClientState(room, "guest").boards.length, 0);
room = submitDrawing(room, "guest", [stroke], 3_100);
const revealed = toDrawClientState(room, "guest");
assert.equal(revealed.phase, "reveal");
assert.equal(revealed.boards.length, 2);
assert.equal(revealed.roundScores.length, 2);
assert.equal(room.players[0]?.score, room.players[1]?.score);
assert.match(revealed.statusMessage ?? "", /closer|close/);
const after = tickDrawRoom(room, 4_100 + REVEAL_MS);
assert.equal(after.phase, "draw");
assert.equal(after.turnIndex, 1);
assert.notEqual(after.organs[1], after.organs[0]);
assert.throws(() => submitDrawing(after, "host", [], 9_000), /Draw something before you submit/);

const trace = {
  color: "#0f172a",
  size: 22,
  points: [300, 250, 500, 400, 700, 550, 550, 800, 400, 700],
};
assert.ok(scoreDrawing("Italy", [trace]) > scoreDrawing("Italy", [stroke]));

console.log("draw-the-country.test.ts OK");
