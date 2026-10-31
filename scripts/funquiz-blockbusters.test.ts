import assert from "node:assert/strict";
import { GAME_MODE_BLOCKBUSTERS } from "../lib/funquiz/constants";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import { horizontalPlayerWins, verticalPlayerWins, BOARD_CELL_DEFS } from "../lib/funquiz/blockbusters/board";
import {
  addPlayer,
  createRoom,
  startGame,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import { blockbustersApplyAction } from "../lib/funquiz/blockbusters/logic";
import { BLOCKBUSTERS_REVEAL_MS } from "../lib/funquiz/blockbusters/types";
import { getQuestionByBankId } from "../lib/funquiz/questions";

assert.equal(BOARD_CELL_DEFS.length, 18);

let room = createRoom(
  "host",
  "Host",
  "BB0001",
  GAME_MODE_BLOCKBUSTERS,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
);
room = addPlayer(room, "guest", "Guest");
room = startGame(room, "host");
assert.ok(room.blockbusters);
assert.equal(room.blockbusters!.cells.length, 18);
assert.equal(room.blockbusters!.step, "pick");

const hostView = toClientState(room, "host");
assert.ok(hostView.blockbustersView?.canPick);

const cell = room.blockbusters!.cells.find((c) => !c.ownerId)!;
room = blockbustersApplyAction(room, "host", "pick", cell.id);
assert.equal(room.blockbusters!.step, "answer");

const q = getQuestionByBankId(cell.bankId);
room = blockbustersApplyAction(room, "host", "answer", undefined, q.correctIndex);
assert.equal(room.phase, "reveal");
assert.equal(room.blockbusters!.cells.find((c) => c.id === cell.id)!.ownerId, "host");

room = tickRoom(room, Date.now() + BLOCKBUSTERS_REVEAL_MS + 50);
assert.equal(room.blockbusters!.step, "pick");

const leftIds = BOARD_CELL_DEFS.filter((d) => d.col === 0).map((d) => d.id);
assert.ok(!horizontalPlayerWins(leftIds.slice(0, 1)));
assert.ok(!horizontalPlayerWins(leftIds));

const topIds = BOARD_CELL_DEFS.filter((d) => d.row === 0).map((d) => d.id);
assert.ok(!verticalPlayerWins(topIds));

console.log("funquiz-blockbusters.test.ts OK");
