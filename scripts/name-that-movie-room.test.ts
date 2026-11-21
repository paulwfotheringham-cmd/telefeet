import assert from "node:assert/strict";
import {
  addMoviePlayer,
  createMovieRoom,
  dealMatchQuestions,
  playerForTurn,
  resetMovieRoomToLobby,
  startMovieGame,
  submitMovieAnswer,
  tickMovieRoom,
  toMovieClientState,
  TURNS_PER_MATCH,
  QUESTIONS_PER_PLAYER,
  REVEAL_MS,
} from "../lib/name-that-movie/room";
import { QUESTIONS_PER_GAME } from "../lib/name-that-movie/types";
import { clearMovieRoomsForTests, loadMovieRoom, movieStoreMode, mutateMovieRoom, persistNewMovieRoom } from "../lib/name-that-movie/store";

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

function playMatch(seed: number) {
  const rng = mulberry32(seed);
  let room = createMovieRoom("host", "Alex", "ABCDEF", "easy", "take_turns", 1_000);
  room = addMoviePlayer(room, "guest", "Sam");
  room = startMovieGame(room, "host", rng, 2_000);
  const scores = { host: 0, guest: 0 };
  for (let turn = 0; turn < TURNS_PER_MATCH; turn++) {
    const active = turn % 2 === 0 ? "host" : "guest";
    assert.equal(room.activePlayerId, active);
    assert.equal(room.phase, "question");
    const question = room.questions[turn]!;
    const choice = turn % 3 === 0 ? question.correctIndex : (question.correctIndex + 1) % 4;
    const correct = choice === question.correctIndex;
    if (correct) scores[active] += 1;
    room = submitMovieAnswer(room, active, choice, 3_000 + turn);
    assert.equal(room.phase, "reveal");
    const viewer = toMovieClientState(room, active === "host" ? "guest" : "host");
    assert.equal(viewer.feedback?.correct, correct);
    assert.equal(viewer.canSubmitAnswer, false);
    assert.equal("correctIndex" in (viewer.question ?? {}), false);
    room = tickMovieRoom(room, 3_000 + turn + REVEAL_MS);
  }
  assert.equal(room.phase, "finished");
  assert.equal(room.players.find((player) => player.id === "host")!.score, scores.host);
  assert.equal(room.players.find((player) => player.id === "guest")!.score, scores.guest);
  const finished = toMovieClientState(room, "host");
  assert.equal(finished.results?.length, TURNS_PER_MATCH);
  assert.ok(finished.winnerIds.length >= 1);
  return room;
}

const room = playMatch(7);
assert.equal(room.answers.length, TURNS_PER_MATCH);
assert.equal(new Set(room.questions.map((question) => question.id)).size, TURNS_PER_MATCH);

const hidden = toMovieClientState(
  startMovieGame(
    addMoviePlayer(createMovieRoom("host", "Alex", "ABCDEF", "medium"), "guest", "Sam"),
    "host",
    mulberry32(3),
  ),
  "guest",
);
assert.equal(hidden.isYourTurn, false);
assert.equal(hidden.feedback, null);
assert.equal(JSON.stringify(hidden).includes("correctIndex"), false);
assert.throws(() => submitMovieAnswer(
  startMovieGame(
    addMoviePlayer(createMovieRoom("host", "Alex", "ABCDEF", "hard"), "guest", "Sam"),
    "host",
    mulberry32(4),
  ),
  "guest",
  0,
), /not your turn/);

assert.throws(() => startMovieGame(createMovieRoom("host", "Alex", "ABCDEF", "easy"), "host"), /second player/);
assert.throws(() => {
  const started = startMovieGame(
    addMoviePlayer(createMovieRoom("host", "Alex", "ABCDEF", "easy"), "guest", "Sam"),
    "guest",
  );
  return started;
}, /Only the host/);

const firstDeal = dealMatchQuestions("easy", [], mulberry32(9));
const secondDeal = dealMatchQuestions("easy", firstDeal.seenIds, mulberry32(10));
const overlap = secondDeal.questions.filter((question) =>
  firstDeal.questions.some((earlier) => earlier.id === question.id),
);
assert.equal(overlap.length, 0);
assert.equal(firstDeal.questions.length, QUESTIONS_PER_PLAYER * 2);

const finished = playMatch(11);
const lobby = resetMovieRoomToLobby(finished, "host");
assert.equal(lobby.phase, "lobby");
assert.equal(lobby.players.every((player) => player.score === 0), true);
assert.equal(playerForTurn(lobby, 0), "host");
assert.equal(playerForTurn(lobby, 1), "guest");

function playTogether() {
  const rng = mulberry32(21);
  let room = createMovieRoom("host", "Alex", "ABCDEF", "easy", "play_together");
  room = addMoviePlayer(room, "guest", "Sam");
  room = startMovieGame(room, "host", rng, 2_000);
  assert.equal(room.questions.length, QUESTIONS_PER_GAME);
  assert.throws(() => submitMovieAnswer(room, "guest", 0), /room creator/);
  const question = room.questions[0]!;
  room = submitMovieAnswer(room, "host", question.correctIndex, 3_000);
  assert.equal(room.jointScore, 1);
  assert.equal(room.players.every((player) => player.score === 1), true);
  const guest = toMovieClientState(room, "guest");
  assert.equal(guest.canSubmitAnswer, false);
  assert.equal(guest.jointScore, 1);
  assert.equal(guest.totalTurns, QUESTIONS_PER_GAME);
  room = tickMovieRoom(room, 3_000 + REVEAL_MS);
  assert.equal(room.phase, "question");
  assert.equal(room.activePlayerId, "host");
  for (let turn = 1; turn < QUESTIONS_PER_GAME; turn++) {
    const current = room.questions[turn]!;
    room = submitMovieAnswer(room, "host", (current.correctIndex + 1) % 4, 4_000 + turn);
    room = tickMovieRoom(room, 4_000 + turn + REVEAL_MS);
  }
  assert.equal(room.phase, "finished");
  const finished = toMovieClientState(room, "guest");
  assert.deepEqual(finished.winnerIds, []);
  assert.equal(finished.results?.length, QUESTIONS_PER_GAME);
  assert.equal(finished.jointScore, 1);
}

playTogether();

async function testMemoryStore() {
  if (movieStoreMode() !== "memory") return;
  clearMovieRoomsForTests();
  const created = await persistNewMovieRoom(createMovieRoom("host", "Alex", "ZZTEST", "easy"));
  await mutateMovieRoom(created.code, (current) => addMoviePlayer(current, "guest", "Sam"));
  const loaded = await loadMovieRoom("ZZTEST");
  assert.equal(loaded?.players.length, 2);
  clearMovieRoomsForTests();
}

testMemoryStore()
  .then(() => {
    console.log("name-that-movie-room.test.ts OK");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
