import assert from "node:assert/strict";
import {
  formatRoomCodeSpaced,
  isValidRoomCode,
  normalizeRoomCode,
} from "../lib/funquiz/room-code";

function runNormalizeStripsSeparators() {
  assert.equal(normalizeRoomCode("6 9 Z 9 K A"), "69Z9KA");
  assert.equal(normalizeRoomCode("69-z9-ka"), "69Z9KA");
  assert.equal(normalizeRoomCode("  abc123  "), "ABC123");
}

function runNormalizeCapsLength() {
  assert.equal(normalizeRoomCode("abcdefgh"), "ABCDEF");
  assert.equal(normalizeRoomCode(""), "");
}

function runValidRoomCode() {
  assert.equal(isValidRoomCode("69Z9KA"), true);
  assert.equal(isValidRoomCode("69Z9K"), false);
  assert.equal(isValidRoomCode("69Z9K!"), false);
}

function runFormatSpaced() {
  assert.equal(formatRoomCodeSpaced("69Z9KA"), "6 9 Z 9 K A");
}

for (const [name, fn] of [
  ["normalize strips separators", runNormalizeStripsSeparators],
  ["normalize caps length", runNormalizeCapsLength],
  ["isValidRoomCode", runValidRoomCode],
  ["formatRoomCodeSpaced", runFormatSpaced],
] as const) {
  try {
    fn();
    console.log(`ok ${name}`);
  } catch (err) {
    console.error(`fail ${name}`, err);
    process.exitCode = 1;
  }
}
