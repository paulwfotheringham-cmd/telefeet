import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GENERAL_MILITARY, QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_TAKE_TURNS,
  QUESTIONS_PER_GAME,
} from "../lib/funquiz/constants";
import { gradeAnswer } from "../lib/funquiz/answer-validation";
import { dbRowsToRoom, roomToDbRows } from "../lib/funquiz/db-mapper";
import {
  addPlayer,
  buildResultRows,
  createRoom,
  startGame,
  submitAnswer,
  tickRoom,
  toClientState,
} from "../lib/funquiz/game-logic";
import {
  InsufficientQuestionsError,
  categoryDifficultyCapacity,
  selectQuestionIdsForCategory,
} from "../lib/funquiz/question-selection";
import {
  allocatedBankIdsForSession,
  usedBankIdsFromAnswerLog,
} from "../lib/funquiz/session-questions";
import { getQuestionByBankId, QUIZ_QUESTIONS } from "../lib/funquiz/questions";

function findSortieExpandedId(): number {
  const q = QUIZ_QUESTIONS.find(
    (item) => item.prompt === "What is a sortie?" && item.categoryId === QUIZ_CATEGORY_GENERAL_MILITARY,
  );
  assert.ok(q, "expanded sortie question must exist");
  return q.id;
}

function runAllQuestionsAllPositions() {
  for (const q of QUIZ_QUESTIONS) {
    for (let i = 0; i < q.options.length; i++) {
      const graded = gradeAnswer(q.id, i);
      assert.equal(graded.correctIndex, q.correctIndex);
      assert.equal(graded.correct, i === q.correctIndex);
    }
    const first = gradeAnswer(q.id, 0);
    const last = gradeAnswer(q.id, q.options.length - 1);
    assert.equal(first.correct, 0 === q.correctIndex);
    assert.equal(last.correct, q.options.length - 1 === q.correctIndex);
  }
}

function runSortieExpandedKey() {
  const id = findSortieExpandedId();
  const q = getQuestionByBankId(id);
  assert.match(q.options[0]!, /mission flight|operational departure/i);
  const wrong = gradeAnswer(id, 1);
  assert.equal(wrong.correct, false);
  const right = gradeAnswer(id, 0);
  assert.equal(right.correct, true);
}

function runFeedbackScoreLogAgreement() {
  let room = createRoom(
    "host",
    "Host",
    "AUD001",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const bankId = room.questionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  const choice = q.correctIndex;
  room = submitAnswer(room, "host", choice);
  const entry = room.answerLog[room.answerLog.length - 1]!;
  const view = toClientState(room, "host");
  const row = buildResultRows(room).find((r) => r.turnIndex === 0)!;
  assert.equal(entry.correct, true);
  assert.equal(view.answerFeedback?.correct, true);
  assert.equal(view.jointScore, 1);
  assert.equal(row.correct, true);
  assert.equal(row.choiceIndex, choice);
}

function runDuplicateSubmitIdempotent() {
  let room = createRoom(
    "host",
    "Host",
    "AUD002",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const bankId = room.hostQuestionOrder[0]!;
  const q = getQuestionByBankId(bankId);
  const afterFirst = submitAnswer(room, "host", q.correctIndex);
  assert.equal(afterFirst.answerLog.length, 1);
  assert.throws(
    () => submitAnswer(afterFirst, "host", q.correctIndex === 0 ? 1 : 0),
    /not accepting answers/i,
  );
  const idempotent = submitAnswer(
    { ...afterFirst, phase: "question", revealStartedAt: null },
    "host",
    q.correctIndex === 0 ? 1 : 0,
  );
  assert.equal(idempotent.answerLog.length, 1);
  assert.equal(idempotent.players.find((p) => p.id === "host")!.score, 1);
}

function runPlayTogetherDoubleAnswerNoDoubleScore() {
  let room = createRoom(
    "host",
    "Host",
    "AUD003",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  assert.equal(room.jointScore, 1);
  const replayDuringReveal = submitAnswer(room, "host", 0);
  assert.equal(replayDuringReveal.jointScore, 1);
  assert.equal(replayDuringReveal.answerLog.length, 1);
  const replayWithLog = submitAnswer(
    { ...replayDuringReveal, phase: "question", revealStartedAt: null },
    "host",
    0,
  );
  assert.equal(replayWithLog.jointScore, 1);
  assert.equal(replayWithLog.answerLog.length, 1);
}

function runJointScoreBothClients() {
  let room = createRoom(
    "host",
    "Host",
    "AUD004",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  const hostView = toClientState(room, "host");
  const guestView = toClientState(room, "guest");
  assert.equal(hostView.jointScore, 1);
  assert.equal(guestView.jointScore, 1);
  assert.equal(hostView.players[0]!.score, 1);
  assert.equal(guestView.players[0]!.score, 1);
}

function runReconnectRoundtripPreservesJointScore() {
  let room = createRoom(
    "host",
    "Host",
    "AUD005",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.questionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  room = tickRoom(room, Date.now() + 5000);
  const { room: row, players } = roomToDbRows(room);
  const reloaded = dbRowsToRoom(
    { ...row, created_at: new Date(room.createdAt).toISOString() },
    players,
  );
  assert.equal(reloaded.jointScore, room.jointScore);
  assert.equal(reloaded.answerLog.length, room.answerLog.length);
  assert.equal(reloaded.questionIndex, room.questionIndex);
  const guestView = toClientState(reloaded, "guest");
  assert.equal(guestView.jointScore, 1);
}

function runTakeTurnsIndividualScoringUnchanged() {
  let room = createRoom(
    "host",
    "Host",
    "AUD006",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const hostView = toClientState(room, "host");
  assert.equal(hostView.jointScore, null);
  const q = getQuestionByBankId(room.hostQuestionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  room = tickRoom(room, Date.now() + 5000);
  const after = toClientState(room, "host");
  assert.equal(after.jointScore, null);
  assert.equal(after.scoresHidden, true);
  assert.equal(room.players.find((p) => p.id === "host")!.score, 1);
  assert.equal(room.players.find((p) => p.id === "guest")!.score, 0);
}

function runSessionQuestionUniquenessFullTakeTurns() {
  let room = createRoom(
    "host",
    "Host",
    "AUD007",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const seen = new Set<number>();
  for (let i = 0; i < QUESTIONS_PER_GAME; i++) {
    const active = room.activePlayerId!;
    const half = Math.floor(room.turnIndex / 2);
    const bankId =
      room.turnIndex % 2 === 0
        ? room.hostQuestionOrder[half]!
        : room.guestQuestionOrder[half]!;
    assert.ok(!seen.has(bankId), `duplicate bankId ${bankId} at turn ${room.turnIndex}`);
    seen.add(bankId);
    const q = getQuestionByBankId(bankId);
    room = submitAnswer(room, active, q.correctIndex);
    if (room.phase === "reveal") {
      room = tickRoom(room, Date.now() + 5000);
    }
  }
  assert.equal(seen.size, QUESTIONS_PER_GAME);
  assert.equal(usedBankIdsFromAnswerLog(room).length, QUESTIONS_PER_GAME);
  assert.equal(new Set(usedBankIdsFromAnswerLog(room)).size, QUESTIONS_PER_GAME);
}

function runReconnectTakeTurnsPreservesUsedQuestions() {
  let room = createRoom(
    "host",
    "Host",
    "AUD008",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const q = getQuestionByBankId(room.hostQuestionOrder[0]!);
  room = submitAnswer(room, "host", q.correctIndex);
  const usedBefore = usedBankIdsFromAnswerLog(room);
  const { room: row, players } = roomToDbRows(room);
  const reloaded = dbRowsToRoom(
    { ...row, created_at: new Date(room.createdAt).toISOString() },
    players,
  );
  assert.deepEqual(usedBankIdsFromAnswerLog(reloaded), usedBefore);
  assert.equal(reloaded.turnIndex, room.turnIndex);
  assert.equal(reloaded.phase, room.phase);
  const view = toClientState(reloaded, "host");
  assert.equal(view.answerFeedback?.correct, true);
}

function runInsufficientQuestionsSafe() {
  assert.throws(
    () => selectQuestionIdsForCategory("not_a_category" as never, QUIZ_DIFFICULTY_INTERMEDIATE),
    InsufficientQuestionsError,
  );
  const cap = categoryDifficultyCapacity(
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );
  assert.ok(cap >= QUESTIONS_PER_GAME);
}

function runAllocationSetUniquePerSession() {
  let room = createRoom(
    "host",
    "Host",
    "AUD009",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_MILITARY,
    QUIZ_DIFFICULTY_HARD,
  );
  room = addPlayer(room, "guest", "Guest");
  room = startGame(room, "host");
  const ids = allocatedBankIdsForSession(room);
  assert.equal(new Set(ids).size, QUESTIONS_PER_GAME);
}

runAllQuestionsAllPositions();
runSortieExpandedKey();
runFeedbackScoreLogAgreement();
runDuplicateSubmitIdempotent();
runPlayTogetherDoubleAnswerNoDoubleScore();
runJointScoreBothClients();
runReconnectRoundtripPreservesJointScore();
runTakeTurnsIndividualScoringUnchanged();
runSessionQuestionUniquenessFullTakeTurns();
runReconnectTakeTurnsPreservesUsedQuestions();
runInsufficientQuestionsSafe();
runAllocationSetUniquePerSession();
console.log("funquiz-audit-regression.test.ts OK");
