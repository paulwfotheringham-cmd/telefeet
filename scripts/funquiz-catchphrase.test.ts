import assert from "node:assert/strict";
import { GAME_MODE_CATCHPHRASE } from "../lib/funquiz/constants";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import {
  addPlayer,
  createRoom,
  startGame,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import {
  catchphraseApplyAction,
  catchphraseTickRoom,
} from "../lib/funquiz/catchphrase/logic";
import { CATCHPHRASE_ANSWER_REVEAL_MS, CATCHPHRASE_TILE_REVEAL_MS } from "../lib/funquiz/catchphrase/types";
import { getCatchphrasePuzzle } from "../lib/funquiz/catchphrase/puzzles";

let room = createRoom(
  "host",
  "Host",
  "CP0001",
  GAME_MODE_CATCHPHRASE,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_DIFFICULTY_INTERMEDIATE,
);
assert.ok(room.catchphrase);
room = addPlayer(room, "guest", "Guest");
room = startGame(room, "host");
assert.equal(room.phase, "question");
assert.ok(room.catchphrase!.puzzleOrder.length === 8);
assert.equal(room.catchphrase!.hiddenTiles.length, 8 * 6);

const hostView = toClientState(room, "host");
assert.ok(hostView.catchphraseView);
assert.equal(hostView.catchphraseView!.canBuzz, true);
assert.equal(hostView.catchphraseView!.canGuess, false);

const puzzleId = room.catchphrase!.puzzleOrder[0]!;
const puzzle = getCatchphrasePuzzle(puzzleId);

room = catchphraseApplyAction(room, "host", "buzz");
assert.equal(room.catchphrase!.buzzPlayerId, "host");
assert.throws(() => catchphraseApplyAction(room, "guest", "buzz"), /already buzzed/i);

room = catchphraseApplyAction(room, "host", "guess", puzzle.answer);
assert.equal(room.phase, "reveal");
assert.equal(room.players.find((p) => p.id === "host")!.score, 2);

room = tickRoom(room, Date.now() + CATCHPHRASE_ANSWER_REVEAL_MS + 100);
assert.equal(room.phase, "question");
assert.equal(room.catchphrase!.roundIndex, 1);

const beforeTiles = room.catchphrase!.hiddenTiles.length;
room = catchphraseTickRoom(room, Date.now() + CATCHPHRASE_TILE_REVEAL_MS + 100);
assert.ok(room.catchphrase!.hiddenTiles.length < beforeTiles);

room = catchphraseApplyAction(room, "guest", "buzz");
room = catchphraseApplyAction(room, "guest", "guess", "definitely wrong phrase xyz");
assert.equal(room.catchphrase!.buzzPlayerId, null);
assert.equal(room.players.find((p) => p.id === "guest")!.score, 0);

console.log("funquiz-catchphrase.test.ts OK");
