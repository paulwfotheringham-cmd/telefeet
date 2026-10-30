import assert from "node:assert/strict";
import { buildAudiencePoll, pickPhoneFriendSuggestion } from "../lib/funquiz/millionaire/lifeline-helpers";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function runAudienceSumsTo100() {
  for (let seed = 1; seed < 20; seed++) {
    const poll = buildAudiencePoll(2, 4, seededRandom(seed));
    assert.equal(poll.length, 4);
    assert.equal(poll.reduce((a, b) => a + b, 0), 100);
    assert.ok(poll[2]! >= poll[0]! || poll[2]! >= poll[1]!);
  }
}

function runPhoneFriendInRange() {
  const rnd = seededRandom(99);
  for (let i = 0; i < 30; i++) {
    const hint = pickPhoneFriendSuggestion(1, 4, rnd);
    assert.ok(hint.choiceIndex >= 0 && hint.choiceIndex < 4);
    assert.ok(hint.message.includes(hint.friendName));
  }
}

for (const [name, fn] of [
  ["audience sums to 100", runAudienceSumsTo100],
  ["phone friend in range", runPhoneFriendInRange],
] as const) {
  try {
    fn();
    console.log(`ok ${name}`);
  } catch (err) {
    console.error(`fail ${name}`, err);
    process.exitCode = 1;
  }
}
