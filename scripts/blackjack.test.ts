import assert from "node:assert/strict";
import { handTotals, dealerShouldHit } from "../lib/blackjack/hand";
import { freshDeck, rankValue, sameSplitRank } from "../lib/blackjack/deck";
import {
  blackjackReducer,
  canDouble,
  canSplit,
  createInitialState,
} from "../lib/blackjack/engine";
import { defaultStats } from "../lib/blackjack/storage";
import type { PlayingCard } from "../lib/blackjack/types";

function card(rank: PlayingCard["rank"], suit: PlayingCard["suit"] = "s"): PlayingCard {
  return { suit, rank };
}

assert.equal(handTotals([card("A"), card("K")]).isBlackjack, true);
assert.equal(handTotals([card("A"), card("9"), card("5")]).total, 15);
assert.equal(handTotals([card("A"), card("9"), card("5"), card("6")]).total, 21);
assert.equal(handTotals([card("A"), card("9"), card("5"), card("6"), card("K")]).isBust, true);

assert.equal(dealerShouldHit([card("A"), card("6")], true), true);
assert.equal(dealerShouldHit([card("A"), card("6")], false), false);
assert.equal(dealerShouldHit([card("T"), card("7")], true), false);

assert.equal(sameSplitRank("T", "Q"), true);
assert.equal(rankValue("K"), 10);

const deck = freshDeck(() => 0.5);
assert.equal(deck.length, 52);

const stats = defaultStats(500);
let state = createInitialState("human", "You", stats, "solo", 0, "betting");

state = blackjackReducer(state, { type: "SELECT_CHIP", amount: 50 });
state = blackjackReducer(state, { type: "ADD_BET" });
const human = state.seats.find((s) => s.isHuman)!;
assert.ok(human.pendingBet >= 50);

for (let i = 0; i < 20; i++) {
  state = blackjackReducer(state, { type: "ADD_BET" });
}
assert.ok(human.pendingBet <= 100);

state = blackjackReducer(state, { type: "PLACE_BET" });
const readyHuman = state.seats.find((s) => s.isHuman)!;
assert.equal(readyHuman.betPlaced, true);

state = blackjackReducer(state, { type: "DEAL" });
assert.ok(state.dealer.cards.length === 2);
const dealtHuman = state.seats.find((s) => s.isHuman)!;
assert.ok(dealtHuman.hands[0]!.cards.length === 2);

if (state.phase === "playerTurn" && canDouble(state)) {
  state = blackjackReducer(state, { type: "DOUBLE" });
  assert.equal(state.seats[0]!.hands[0]!.doubled, true);
}

console.log("blackjack.test.ts OK");