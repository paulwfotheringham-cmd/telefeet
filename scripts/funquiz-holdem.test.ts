import assert from "node:assert/strict";
import { GAME_MODE_TEXAS_HOLDEM } from "../lib/funquiz/constants";
import { addPlayer, createRoom, startGame } from "../lib/funquiz/game-logic";
import { holdemApplyAction, isHoldemAiId } from "../lib/funquiz/holdem/logic";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { compareScores, bestHandScore } from "../lib/funquiz/holdem/eval";
import { formatCard } from "../lib/funquiz/holdem/cards";
import { dealNewHand } from "../lib/funquiz/holdem/logic";

assert.ok(compareScores(bestHandScore([0, 1, 2, 3, 4]), bestHandScore([8, 9, 10, 11, 12])) !== 0);

{
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
  assert.equal(room.players.length, 2);

  const actor = room.holdem.actionOn!;
  room = holdemApplyAction(room, actor, "call");
  assert.ok(room.holdem!.pot > 0);
}

{
  let solo = createRoom(
    "host",
    "Host",
    "PKSOLO",
    GAME_MODE_TEXAS_HOLDEM,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  solo = startGame(solo, "host");
  assert.equal(solo.players.length, 5);
  assert.equal(solo.players.filter((player) => isHoldemAiId(player.id)).length, 4);
  assert.ok(solo.holdem);
  assert.equal(solo.holdem.street, "preflop");
  assert.ok(solo.holdem.actionOn);
  // AI acts until the human must move or the hand ends.
  assert.ok(!isHoldemAiId(solo.holdem.actionOn!) || solo.holdem.street === "hand_over");
  if (solo.holdem.actionOn === "host") {
    solo = holdemApplyAction(solo, "host", "call");
    assert.ok(solo.holdem);
  }
  assert.equal(Object.keys(solo.holdem!.holeCards).length, 5);
}

{
  let room = createRoom(
    "host",
    "Host",
    "PKDL",
    GAME_MODE_TEXAS_HOLDEM,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = startGame(room, "host");
  const first = room.holdem!.holeCards.host!.map(formatCard).join(" ");
  room = { ...room, holdem: { ...room.holdem!, street: "hand_over" as const } };
  room = dealNewHand(room);
  const second = room.holdem!.holeCards.host!.map(formatCard).join(" ");
  assert.notEqual(first, second, "consecutive deals should shuffle a new hand for the host");
  const allIds: number[] = [];
  for (const pair of Object.values(room.holdem!.holeCards)) {
    allIds.push(...pair);
  }
  assert.equal(new Set(allIds).size, allIds.length, "no duplicate cards across hole hands");
}

console.log("funquiz-holdem.test.ts OK");
