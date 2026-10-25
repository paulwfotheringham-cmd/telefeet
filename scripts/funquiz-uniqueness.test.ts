import assert from "node:assert/strict";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "../lib/funquiz/categories";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "../lib/funquiz/difficulties";
import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_TAKE_TURNS,
  QUESTIONS_PER_GAME,
} from "../lib/funquiz/constants";
import {
  addPlayer,
  allocateQuestionsForGame,
  createRoom,
  startGame,
  submitAnswer,
  tickRoom,
} from "../lib/funquiz/game-logic";
import {
  allocatedBankIdsForSession,
  assertUniqueAllocation,
  usedBankIdsFromAnswerLog,
} from "../lib/funquiz/session-questions";
import { getQuestionByBankId } from "../lib/funquiz/questions";

function runTakeTurnsSessionUnique() {
  let room = createRoom(
    "h",
    "H",
    "UNQ001",
    GAME_MODE_TAKE_TURNS,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "g", "G");
  room = startGame(room, "h");
  const allocated = allocatedBankIdsForSession(room);
  assertUniqueAllocation(allocated);
  assert.equal(new Set(allocated).size, QUESTIONS_PER_GAME);

  for (let i = 0; i < QUESTIONS_PER_GAME; i++) {
    const active = room.activePlayerId!;
    const half = Math.floor(room.turnIndex / 2);
    const bankId =
      room.turnIndex % 2 === 0
        ? room.hostQuestionOrder[half]!
        : room.guestQuestionOrder[half]!;
    const usedBefore = usedBankIdsFromAnswerLog(room);
    assert.ok(!usedBefore.includes(bankId));
    const q = getQuestionByBankId(bankId);
    room = submitAnswer(room, active, q.correctIndex);
    const usedAfter = usedBankIdsFromAnswerLog(room);
    assert.equal(new Set(usedAfter).size, usedAfter.length);
    if (room.phase === "reveal") {
      room = tickRoom(room, Date.now() + 5000);
    }
  }
}

function runPlayTogetherUnique() {
  const { questionOrder } = allocateQuestionsForGame(
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  assertUniqueAllocation(questionOrder);
}

function runPlayTogetherModeStart() {
  let room = createRoom(
    "h",
    "H",
    "UNQ002",
    GAME_MODE_PLAY_TOGETHER,
    QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    QUIZ_DIFFICULTY_INTERMEDIATE,
  );
  room = addPlayer(room, "g", "G");
  room = startGame(room, "h");
  assertUniqueAllocation(room.questionOrder);
}

runTakeTurnsSessionUnique();
runPlayTogetherUnique();
runPlayTogetherModeStart();
console.log("funquiz-uniqueness.test.ts OK");
