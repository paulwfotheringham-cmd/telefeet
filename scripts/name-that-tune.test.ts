import assert from "node:assert/strict";
import { TUNE_QUESTIONS } from "../lib/name-that-tune/question-bank";
import { questionsForEra, selectGameQuestions } from "../lib/name-that-tune/game";
import {
  addTunePlayer,
  createTuneRoom,
  QUESTIONS_PER_PLAYER,
  REVEAL_MS,
  startTuneGame,
  submitTuneAnswer,
  tickTuneRoom,
  toTuneClientState,
  TURNS_PER_MATCH,
} from "../lib/name-that-tune/room";
import { SHOW_QUESTIONS } from "../lib/name-that-show/question-bank";
import { plannedShowLength, questionsForEra as showsForEra } from "../lib/name-that-show/game";
import {
  addShowPlayer,
  createShowRoom,
  startShowGame,
  submitShowAnswer,
  toShowClientState,
} from "../lib/name-that-show/room";
import { GAME_QUESTIONS } from "../lib/name-that-game/question-bank";
import { plannedGameLength, questionsForEra as gamesForEra } from "../lib/name-that-game/game";
import {
  addGamePlayer,
  createGameRoom,
  startGameGame,
  submitGameAnswer,
  toGameClientState,
} from "../lib/name-that-game/room";

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

const tuneIds = new Set<string>();
for (const question of TUNE_QUESTIONS) {
  assert.equal(tuneIds.has(question.id), false, question.id);
  tuneIds.add(question.id);
  assert.equal(question.distractors.length, 3);
  assert.equal(question.distractors.includes(question.artist), false, question.id);
  assert.equal(new Set(question.distractors).size, 3, question.id);
  assert.ok(question.year >= 1980 && question.year <= 1999, question.id);
}
assert.ok(questionsForEra("80s").length >= 40);
assert.ok(questionsForEra("90s").length >= 40);
const tuneDeal = selectGameQuestions("both", 10, mulberry32(1));
assert.equal(new Set(tuneDeal.map((question) => question.id)).size, 10);
for (const question of tuneDeal) {
  assert.equal(question.options.length, 4);
  assert.equal(question.options[question.correctIndex], question.artist);
}

let tune = createTuneRoom("host", "Alex", "ABCDEF", "80s", "take_turns", 1_000);
tune = addTunePlayer(tune, "guest", "Sam");
tune = startTuneGame(tune, "host", mulberry32(2), 2_000);
assert.equal(tune.questions.length, TURNS_PER_MATCH);
const hiddenTune = toTuneClientState(tune, "guest");
assert.equal(hiddenTune.canSubmitAnswer, false);
assert.equal(hiddenTune.question?.options.includes(tune.questions[0]!.title), false);
assert.equal("title" in (hiddenTune.question ?? {}), false);
assert.throws(() => submitTuneAnswer(tune, "guest", tune.questions[0]!.correctIndex), /not your turn/);
tune = submitTuneAnswer(tune, "host", tune.questions[0]!.correctIndex, 3_000);
assert.equal(toTuneClientState(tune, "guest").feedback?.songTitle, tune.questions[0]!.title);
tune = tickTuneRoom(tune, 3_000 + REVEAL_MS);
assert.equal(tune.activePlayerId, "guest");

let together = createTuneRoom("host", "Alex", "ABCDEF", "90s", "play_together", 1_000);
together = addTunePlayer(together, "guest", "Sam");
together = startTuneGame(together, "host", mulberry32(3), 2_000);
assert.equal(together.questions.length, QUESTIONS_PER_PLAYER);
assert.throws(() => submitTuneAnswer(together, "guest", 0), /room creator/);
together = submitTuneAnswer(together, "host", together.questions[0]!.correctIndex, 4_000);
assert.equal(together.jointScore, 1);
assert.equal(toTuneClientState(together, "guest").jointScore, 1);

for (const show of SHOW_QUESTIONS) {
  assert.equal(show.distractors.includes(show.title), false, show.id);
  assert.ok(show.artistIncludes && show.trackIncludes);
}
assert.ok(showsForEra("80s").length >= 8);
assert.ok(showsForEra("90s").length >= 8);
assert.equal(plannedShowLength("80s", "take_turns"), 8);
assert.equal(plannedShowLength("80s", "play_together"), 8);
assert.equal(plannedShowLength("both", "take_turns"), 10);

let show = createShowRoom("host", "Alex", "ABCDEF", "both", "play_together", 1_000);
show = addShowPlayer(show, "guest", "Sam");
show = startShowGame(show, "host", mulberry32(4), 2_000);
assert.equal(show.questions.length, plannedShowLength("both", "play_together"));
const showView = toShowClientState(show, "guest");
assert.equal(showView.canSubmitAnswer, false);
assert.equal(showView.question?.options.includes(show.questions[0]!.title), true);
assert.throws(() => submitShowAnswer(show, "guest", 0), /room creator/);

const gameIds = new Set<string>();
for (const game of GAME_QUESTIONS) {
  assert.equal(gameIds.has(game.id), false, game.id);
  gameIds.add(game.id);
  assert.ok(game.wikiFile.startsWith("File:"));
  assert.ok(game.year >= 1980 && game.year <= 1999);
}
assert.ok(gamesForEra("80s").length >= 20);
assert.ok(gamesForEra("90s").length >= 20);
assert.equal(plannedGameLength("90s", "take_turns"), 20);
assert.equal(plannedGameLength("90s", "play_together"), 10);

let game = createGameRoom("host", "Alex", "ABCDEF", "90s", "take_turns", 1_000);
game = addGamePlayer(game, "guest", "Sam");
game = startGameGame(game, "host", mulberry32(5), 2_000);
assert.equal(game.questions.length, 20);
const gameView = toGameClientState(game, "host");
assert.equal(gameView.question?.platform, game.questions[0]!.platform);
assert.equal(JSON.stringify(gameView).includes(game.questions[0]!.id), false);
assert.equal(gameView.question?.options.includes(game.questions[0]!.title), true);
game = submitGameAnswer(game, "host", game.questions[0]!.correctIndex, 3_000);
assert.equal(toGameClientState(game, "guest").feedback?.correctLabel, game.questions[0]!.title);
assert.throws(() => submitGameAnswer(
  startGameGame(
    addGamePlayer(createGameRoom("host", "Alex", "ABCDEF", "80s", "play_together"), "guest", "Sam"),
    "host",
    mulberry32(6),
  ),
  "guest",
  0,
), /room creator/);

console.log(
  `name-that-tune.test.ts OK (tunes ${TUNE_QUESTIONS.length}, shows ${SHOW_QUESTIONS.length}, games ${GAME_QUESTIONS.length})`,
);
