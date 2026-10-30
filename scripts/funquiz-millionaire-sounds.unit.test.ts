import assert from "node:assert/strict";
import { lifelineSoundId } from "../lib/funquiz/millionaire/millionaire-sounds";

assert.equal(lifelineSoundId("fifty_fifty"), "fifty_fifty");
assert.equal(lifelineSoundId("phone_a_friend"), "phone_friend");
assert.equal(lifelineSoundId("ask_audience"), "ask_audience");
assert.equal(lifelineSoundId("other"), "lifeline");
console.log("ok funquiz-millionaire-sounds.unit.test.ts");
