import assert from "node:assert/strict";
import { GAME_MODE_PARALLEL_MILLIONAIRE } from "../lib/funquiz/constants";
import { QUIZ_CATEGORY_SPACE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import {
  addPlayer,
  createRoom,
  startGame,
  submitAnswer,
  toClientState,
} from "../lib/funquiz/game-logic";
import { millionaireLockAnswer } from "../lib/funquiz/millionaire/logic";
import { parallelTickRoom } from "../lib/funquiz/millionaire/parallel-logic";
import { getQuestionByBankId } from "../lib/funquiz/questions";

function runLobbyClientStateBeforeStart() {
  let room = createRoom(
    "host",
    "Host",
    "PL0002",
    GAME_MODE_PARALLEL_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  const hostView = toClientState(room, "host");
  assert.equal(hostView.phase, "lobby");
  assert.equal(hostView.millionaireView?.playStyle, "shared");
  room = addPlayer(room, "guest", "Guest");
  const guestView = toClientState(room, "guest");
  assert.equal(guestView.phase, "lobby");
  assert.doesNotThrow(() => toClientState(room, "guest"));
}

function runSeparateOrdersAndProgress() {
  let room = createRoom(
    "host",
    "Host",
    "PL0001",
    GAME_MODE_PARALLEL_MILLIONAIRE,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  assert.equal(room.millionaire?.variant, "parallel");
  const hostOrder = room.millionaire!.parallelRuns!.host!.questionOrder;
  const guestOrder = room.millionaire!.parallelRuns!.guest!.questionOrder;
  assert.notDeepEqual(hostOrder, guestOrder);

  const hostQ = getQuestionByBankId(hostOrder[0]!);
  room = submitAnswer(room, "host", hostQ.correctIndex);
  room = millionaireLockAnswer(room, "host", hostQ.correctIndex);
  assert.equal(room.millionaire!.parallelRuns!.host!.phase, "reveal");

  const guestQ = getQuestionByBankId(guestOrder[0]!);
  room = submitAnswer(room, "guest", guestQ.correctIndex);
  room = millionaireLockAnswer(room, "guest", guestQ.correctIndex);
  assert.equal(room.millionaire!.parallelRuns!.guest!.phase, "reveal");

  room = parallelTickRoom(room, Date.now() + 10_000);
  assert.equal(room.millionaire!.parallelRuns!.host!.phase, "question");
  assert.equal(room.millionaire!.parallelRuns!.host!.questionIndex, 1);
  assert.equal(room.millionaire!.parallelRuns!.guest!.questionIndex, 1);
}

try {
  runLobbyClientStateBeforeStart();
  runSeparateOrdersAndProgress();
  console.log("funquiz-parallel-millionaire.test.ts OK");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
