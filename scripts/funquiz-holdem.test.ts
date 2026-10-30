import assert from "node:assert/strict";
import { GAME_MODE_TEXAS_HOLDEM } from "../lib/funquiz/constants";
import { addPlayer, createRoom, startGame } from "../lib/funquiz/game-logic";
import { holdemApplyAction } from "../lib/funquiz/holdem/logic";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { compareScores, bestHandScore } from "../lib/funquiz/holdem/eval";

assert.ok(compareScores(bestHandScore([0, 1, 2, 3, 4]), bestHandScore([8, 9, 10, 11, 12])) !== 0);

let room = createRoom(
  "host",
  "Host",
  "PK0001",
  GAME_MODE_TEXAS_HOLDEM,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
);
room = addPlayer(room, "guest", "Guest");
room = startGame(room, "host");
assert.ok(room.holdem);
assert.equal(room.holdem.street, "preflop");
assert.ok(room.holdem.actionOn);

const actor = room.holdem.actionOn!;
room = holdemApplyAction(room, actor, "call");
assert.ok(room.holdem!.pot > 0);

console.log("funquiz-holdem.test.ts OK");
