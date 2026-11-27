import assert from "node:assert/strict";
import { gameIdFromPath, isSelectionSurface } from "../lib/games311/game-from-path";
import { isUuid, newUuid } from "../lib/games311/ids";
import {
  sanitizeFeedbackText,
  sanitizeGameId,
  sanitizePath,
} from "../lib/games311/server";

assert.equal(gameIdFromPath("/"), null);
assert.equal(gameIdFromPath("/funquiz"), null);
assert.equal(gameIdFromPath("/draw-the-flower"), "draw-the-flower");
assert.equal(gameIdFromPath("/name-that-movie"), "name-that-movie");
assert.equal(gameIdFromPath("/blackjack"), "blackjack");
assert.equal(isSelectionSurface("/funquiz", false), true);
assert.equal(isSelectionSurface("/funquiz", true), false);
assert.equal(isSelectionSurface("/draw-the-flower", false), false);

const id = newUuid();
assert.equal(isUuid(id), true);
assert.equal(isUuid("not-a-uuid"), false);

assert.equal(sanitizePath("/funquiz"), "/funquiz");
assert.equal(sanitizePath("../etc/passwd"), "/");
assert.equal(sanitizeGameId("draw-the-flower"), "draw-the-flower");
assert.equal(sanitizeGameId("bad id!"), null);
assert.equal(sanitizeFeedbackText("  hello  "), "hello");
assert.equal(sanitizeFeedbackText("x".repeat(3000))?.length, 2000);

console.log("games311-analytics.unit.test.ts OK");
