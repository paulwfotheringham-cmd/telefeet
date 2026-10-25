import assert from "node:assert/strict";
import {
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_GEOGRAPHY,
  QUIZ_CATEGORY_SPACE,
} from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_TAKE_TURNS,
  QUESTIONS_PER_GAME,
  TAKE_TURNS_QUESTIONS_PER_PLAYER,
} from "../lib/funquiz/constants";
import { getQuestionByBankId } from "../lib/funquiz/questions";
import {
  addPlayer,
  allocateQuestionsForGame,
  buildResultRows,
  createRoom,
  resetRoomForNewGame,
  startGame,
  submitAnswer,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";

function runAllocation() {
  const { questionOrder, hostQuestionOrder, guestQuestionOrder } =
    allocateQuestionsForGame(QUIZ_CATEGORY_SPACE, QUIZ_DIFFICULTY_INTERMEDIATE);
  for (const id of questionOrder) {
    const q = getQuestionByBankId(id);
    assert.equal(q.categoryId, QUIZ_CATEGORY_SPACE);
    assert.equal(q.difficulty, QUIZ_DIFFICULTY_INTERMEDIATE);
  }
  assert.equal(questionOrder.length, QUESTIONS_PER_GAME);
  assert.equal(hostQuestionOrder.length, TAKE_TURNS_QUESTIONS_PER_PLAYER);
  assert.equal(guestQuestionOrder.length, TAKE_TURNS_QUESTIONS_PER_PLAYER);
  const hostSet = new Set(hostQuestionOrder);
  const guestSet = new Set(guestQuestionOrder);
  assert.equal(hostSet.size, TAKE_TURNS_QUESTIONS_PER_PLAYER);
  assert.equal(guestSet.size, TAKE_TURNS_QUESTIONS_PER_PLAYER);
  for (const id of hostQuestionOrder) {
    assert.ok(!guestSet.has(id), "question must not appear in both player sets");
  }
}

function runTakeTurnsFlow() {
  let room = createRoom(
    "host",
    "Host",
    "TT0001",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GEOGRAPHY,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  assert.equal(room.activePlayerId, "host");
  assert.equal(room.turnIndex, 0);

  const hostView = toClientState(room, "host");
  assert.ok(hostView.question);
  assert.equal(hostView.canSubmitAnswer, true);
  assert.equal(hostView.scoresHidden, true);

  const guestView = toClientState(room, "guest");
  assert.ok(guestView.question);
  assert.equal(guestView.question!.id, hostView.question!.id);
  assert.deepEqual(guestView.question!.options, hostView.question!.options);
  assert.equal(guestView.canSubmitAnswer, false);
  assert.equal(guestView.correctIndex, null);
  assert.ok(guestView.statusMessage?.includes("watch along"));
  assert.ok(guestView.statusMessage?.includes("Host"));

  const bank0 = room.hostQuestionOrder[0]!;
  const q0 = getQuestionByBankId(bank0);
  room = submitAnswer(room, "host", q0.correctIndex);
  assert.equal(room.phase, "reveal");
  room = tickRoom(room, Date.now() + 5000);
  assert.equal(room.turnIndex, 1);
  assert.equal(room.activePlayerId, "guest");

  assert.throws(() => submitAnswer(room, "host", 0), /not your turn/i);

  const hostTurn2 = toClientState(room, "host");
  const guestTurn2 = toClientState(room, "guest");
  const bank1 = room.guestQuestionOrder[0]!;
  const q1 = getQuestionByBankId(bank1);
  assert.equal(hostTurn2.question!.id, bank1);
  assert.equal(guestTurn2.question!.id, bank1);
  assert.notEqual(hostTurn2.question!.id, hostView.question!.id);
  assert.equal(hostTurn2.canSubmitAnswer, false);
  assert.equal(guestTurn2.canSubmitAnswer, true);
  assert.throws(() => submitAnswer(room, "host", 0), /not your turn/i);
  room = submitAnswer(room, "guest", q1.correctIndex === 0 ? 1 : 0);
  room = tickRoom(room, Date.now() + 5000);

  for (let i = 2; i < QUESTIONS_PER_GAME; i++) {
    const active = room.activePlayerId!;
    const half = Math.floor(room.turnIndex / 2);
    const bankId =
      room.turnIndex % 2 === 0
        ? room.hostQuestionOrder[half]!
        : room.guestQuestionOrder[half]!;
    const q = getQuestionByBankId(bankId);
    room = submitAnswer(room, active, q.correctIndex);
    if (room.phase === "reveal") {
      room = tickRoom(room, Date.now() + 5000);
    }
  }
  assert.equal(room.phase, "finished");
  const results = buildResultRows(room);
  assert.equal(results.length, QUESTIONS_PER_GAME);
  const finishedView = toClientState(room, "host");
  assert.equal(finishedView.scoresHidden, false);
  assert.ok(finishedView.results && finishedView.results.length === QUESTIONS_PER_GAME);
}

function runPlayTogetherHostOnlySubmit() {
  let room = createRoom(
    "host",
    "Host",
    "PT0001",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GEOGRAPHY,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  assert.throws(() => submitAnswer(room, "guest", 0), /creator/i);
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  room = submitAnswer(room, "host", q.correctIndex);
  assert.equal(room.phase, "reveal");
  assert.equal(room.jointScore, 1);
  const guestReveal = toClientState(room, "guest");
  assert.equal(guestReveal.jointScore, 1);
  assert.notEqual(guestReveal.correctIndex, null);
  room = submitAnswer(room, "host", q.correctIndex);
  assert.equal(room.answerLog.length, 1);
}

function runPlayTogetherTickToFinish() {
  let room = createRoom(
    "host",
    "H",
    "PT0002",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "G");
  room = startGame(room, "host");
  for (let i = 0; i < QUESTIONS_PER_GAME; i++) {
    const bankId = room.questionOrder[room.questionIndex]!;
    const q = getQuestionByBankId(bankId);
    room = submitAnswer(room, "host", q.correctIndex);
    if (room.phase === "reveal") {
      room = tickRoom(room, Date.now() + 5000);
    }
  }
  assert.equal(room.phase, "finished");
  assert.equal(room.jointScore, QUESTIONS_PER_GAME);
}

function runTakeTurnsCountryOutlineSpectator() {
  let room = createRoom(
    "host",
    "Host",
    "TTOUT1",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_COUNTRY_OUTLINES,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const hostView = toClientState(room, "host");
  const guestView = toClientState(room, "guest");
  assert.ok(hostView.question?.outlineImageUrl);
  assert.equal(guestView.question?.outlineImageUrl, hostView.question?.outlineImageUrl);
  assert.equal(guestView.canSubmitAnswer, false);
  assert.equal(hostView.correctIndex, null);
  assert.equal(guestView.correctIndex, null);
}

function runNewGameReset() {
  let room = createRoom(
    "host",
    "H",
    "NG0001",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GEOGRAPHY,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "G");
  room = startGame(room, "host");
  room = { ...room, phase: "finished" as const };
  const prevSession = room.sessionId;
  room = resetRoomForNewGame(
    room,
    "host",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_SPACE,
    QUIZ_DIFFICULTY_HARD,
  );
  assert.equal(room.phase, "lobby");
  assert.equal(room.gameMode, GAME_MODE_TAKE_TURNS);
  assert.equal(room.quizCategoryId, QUIZ_CATEGORY_SPACE);
  assert.equal(room.quizDifficulty, QUIZ_DIFFICULTY_HARD);
  assert.notEqual(room.sessionId, prevSession);
  assert.equal(room.answerLog.length, 0);
}

runAllocation();
runTakeTurnsFlow();
runTakeTurnsCountryOutlineSpectator();
runPlayTogetherHostOnlySubmit();
runPlayTogetherTickToFinish();
runNewGameReset();
console.log("funquiz game modes OK");
