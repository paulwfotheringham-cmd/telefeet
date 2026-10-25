import { GAME_MODE_SHARED_MILLIONAIRE, MAX_PLAYERS } from "../constants";
import type { QuizCategoryId } from "../categories";
import { gradeAnswer } from "../answer-validation";
import { getQuestionByBankId } from "../questions";
import type { AnswerLogEntry, QuizPlayer, QuizRoom } from "../types";
import {
  MILLIONAIRE_DISCUSSION_MS,
  MILLIONAIRE_QUESTION_COUNT,
  MILLIONAIRE_REVEAL_MS,
  type MillionaireLifelineId,
  awardOnFailure,
  securedPrizeAfterCorrect,
  targetPrizeForQuestionIndex,
} from "./config";
import { replacementQuestionId, selectMillionaireQuestionIds } from "./select-questions";
import {
  createInitialMillionaireState,
  type MillionaireState,
} from "./types";

export function isMillionaireRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_SHARED_MILLIONAIRE;
}

function ensureMillionaire(room: QuizRoom): MillionaireState {
  if (!room.millionaire) {
    throw new Error("Millionaire state missing");
  }
  return room.millionaire;
}

function resetLocksForQuestion(players: QuizPlayer[], millionaire: MillionaireState): MillionaireState {
  const locks: MillionaireState["locks"] = {};
  for (const p of players) {
    locks[p.id] = { choiceIndex: null, locked: false };
  }
  return {
    ...millionaire,
    locks,
    teamChoiceIndex: null,
    askTeamActiveUntil: null,
  };
}

export function startMillionaireGame(room: QuizRoom): QuizRoom {
  if (room.players.length < 1) {
    throw new Error("Waiting for at least one player");
  }
  const questionOrder = selectMillionaireQuestionIds(room.quizCategoryId);
  const millionaire = resetLocksForQuestion(
    room.players,
    createInitialMillionaireState(),
  );
  millionaire.usedBankIds = [...questionOrder];

  return {
    ...room,
    phase: "question",
    questionIndex: 0,
    questionOrder,
    hostQuestionOrder: [],
    guestQuestionOrder: [],
    turnIndex: 0,
    activePlayerId: null,
    jointScore: 0,
    answerLog: [],
    revealStartedAt: null,
    millionaire,
    players: room.players.map((p) => ({ ...p, score: 0, answer: null })),
    updatedAt: Date.now(),
  };
}

function currentBankId(room: QuizRoom): number {
  const id = room.questionOrder[room.questionIndex];
  if (id === undefined) {
    throw new Error("No question allocated");
  }
  return id;
}

function logAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
  correct: boolean,
): AnswerLogEntry {
  return {
    sessionId: room.sessionId,
    turnIndex: room.questionIndex,
    bankId: currentBankId(room),
    playerId,
    choiceIndex,
    correct,
  };
}

function allPlayersLocked(room: QuizRoom): boolean {
  const m = ensureMillionaire(room);
  for (const p of room.players) {
    const lock = m.locks[p.id];
    if (!lock?.locked) {
      return false;
    }
  }
  return true;
}

function lockedChoices(room: QuizRoom): number[] {
  const m = ensureMillionaire(room);
  return room.players
    .map((p) => m.locks[p.id]?.choiceIndex)
    .filter((c): c is number => c !== null && c !== undefined);
}

function resolveToReveal(room: QuizRoom, teamChoiceIndex: number): QuizRoom {
  const bankId = currentBankId(room);
  const graded = gradeAnswer(bankId, teamChoiceIndex);
  const hostId = room.hostId;
  const entry = logAnswer(room, hostId, graded.choiceIndex, graded.correct);

  return {
    ...room,
    phase: "reveal",
    revealStartedAt: Date.now(),
    millionaire: {
      ...ensureMillionaire(room),
      teamChoiceIndex: graded.choiceIndex,
    },
    answerLog: [...room.answerLog, entry],
    players: room.players.map((p) => ({
      ...p,
      answer: graded.choiceIndex,
    })),
    updatedAt: Date.now(),
  };
}

function disagreementDiscussionActive(room: QuizRoom): boolean {
  if (room.phase !== "discussion" || room.players.length < 2) {
    return false;
  }
  if (!allPlayersLocked(room)) {
    return false;
  }
  return new Set(lockedChoices(room)).size > 1;
}

function maybeAdvanceAfterLocks(room: QuizRoom): QuizRoom {
  if (!allPlayersLocked(room)) {
    return room;
  }
  const choices = lockedChoices(room);
  if (choices.length === 0) {
    return room;
  }
  const unique = new Set(choices);
  if (room.players.length >= 2 && unique.size > 1) {
    const now = Date.now();
    return {
      ...room,
      phase: "discussion",
      revealStartedAt: now,
      millionaire: {
        ...ensureMillionaire(room),
        askTeamActiveUntil: null,
      },
      updatedAt: now,
    };
  }
  return resolveToReveal(room, choices[0]!);
}

export function millionaireSelectAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
): QuizRoom {
  if (!isMillionaireRoom(room) || room.phase !== "question") {
    throw new Error("Not accepting selections right now");
  }
  const m = ensureMillionaire(room);
  const lock = m.locks[playerId];
  if (!lock || lock.locked) {
    throw new Error("Answer already locked");
  }
  const bankId = currentBankId(room);
  gradeAnswer(bankId, choiceIndex);

  const locks = {
    ...m.locks,
    [playerId]: { choiceIndex, locked: false },
  };

  return {
    ...room,
    millionaire: { ...m, locks },
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, answer: choiceIndex } : p,
    ),
    updatedAt: Date.now(),
  };
}

export function millionaireLockAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
): QuizRoom {
  if (!isMillionaireRoom(room) || (room.phase !== "question" && room.phase !== "discussion")) {
    throw new Error("Not accepting lock-ins right now");
  }
  const m = ensureMillionaire(room);
  if (m.locks[playerId]?.locked) {
    return room;
  }
  const bankId = currentBankId(room);
  gradeAnswer(bankId, choiceIndex);

  const locks = {
    ...m.locks,
    [playerId]: { choiceIndex, locked: true },
  };
  let next: QuizRoom = {
    ...room,
    millionaire: { ...m, locks },
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, answer: choiceIndex } : p,
    ),
    updatedAt: Date.now(),
  };
  if (room.phase === "question") {
    next = maybeAdvanceAfterLocks(next);
  }
  return next;
}

export function millionaireFinalizeTeamAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
): QuizRoom {
  if (!isMillionaireRoom(room) || room.phase !== "discussion") {
    throw new Error("Team finalisation is not available");
  }
  if (playerId !== room.hostId) {
    throw new Error("Only the room creator can finalise the team answer");
  }
  const bankId = currentBankId(room);
  gradeAnswer(bankId, choiceIndex);
  return resolveToReveal(room, choiceIndex);
}

export function millionaireWalkAway(room: QuizRoom, playerId: string): QuizRoom {
  if (!isMillionaireRoom(room) || room.phase !== "question") {
    throw new Error("Walk away is not available right now");
  }
  if (playerId !== room.hostId) {
    throw new Error("Only the room creator can walk away");
  }
  const m = ensureMillionaire(room);
  if (Object.values(m.locks).some((l) => l?.locked)) {
    throw new Error("Cannot walk away after locking an answer");
  }
  const prize = m.securedPrize;
  return {
    ...room,
    phase: "walkaway",
    jointScore: prize,
    millionaire: {
      ...m,
      outcome: "walkaway",
      finalAwardedPrize: prize,
    },
    updatedAt: Date.now(),
  };
}

function pickFiftyFiftyEliminations(correctIndex: number, optionCount: number): number[] {
  const incorrect: number[] = [];
  for (let i = 0; i < optionCount; i++) {
    if (i !== correctIndex) incorrect.push(i);
  }
  const keep = incorrect[Math.floor(Math.random() * incorrect.length)]!;
  return incorrect.filter((i) => i !== keep);
}

export function millionaireUseLifeline(
  room: QuizRoom,
  playerId: string,
  lifeline: MillionaireLifelineId,
): QuizRoom {
  if (!isMillionaireRoom(room) || room.phase !== "question") {
    throw new Error("Lifelines can only be used on an open question");
  }
  if (playerId !== room.hostId) {
    throw new Error("Only the room creator can use a lifeline");
  }
  const m = ensureMillionaire(room);
  if (m.lifelinesUsed[lifeline]) {
    return room;
  }
  if (Object.values(m.locks).some((l) => l?.locked)) {
    throw new Error("Cannot use a lifeline after an answer is locked");
  }

  const bankId = currentBankId(room);
  const q = getQuestionByBankId(bankId);

  if (lifeline === "fifty_fifty") {
    const eliminated = pickFiftyFiftyEliminations(q.correctIndex, q.options.length);
    return {
      ...room,
      millionaire: {
        ...m,
        lifelinesUsed: { ...m.lifelinesUsed, fifty_fifty: true },
        eliminatedOptionIndices: eliminated,
      },
      updatedAt: Date.now(),
    };
  }

  if (lifeline === "ask_team") {
    return {
      ...room,
      phase: "discussion",
      revealStartedAt: Date.now(),
      millionaire: {
        ...m,
        lifelinesUsed: { ...m.lifelinesUsed, ask_team: true },
        askTeamActiveUntil: Date.now() + MILLIONAIRE_DISCUSSION_MS,
      },
      updatedAt: Date.now(),
    };
  }

  if (lifeline === "change_question") {
    const used = new Set(m.usedBankIds);
    const newId = replacementQuestionId(room.quizCategoryId, room.questionIndex, used);
    const order = [...room.questionOrder];
    order[room.questionIndex] = newId;
    return {
      ...room,
      questionOrder: order,
      millionaire: {
        ...resetLocksForQuestion(room.players, m),
        lifelinesUsed: { ...m.lifelinesUsed, change_question: true },
        usedBankIds: [...m.usedBankIds, newId],
        securedPrize: m.securedPrize,
        finalAwardedPrize: m.finalAwardedPrize,
        outcome: m.outcome,
      },
      players: room.players.map((p) => ({ ...p, answer: null })),
      updatedAt: Date.now(),
    };
  }

  return room;
}

function advanceAfterReveal(room: QuizRoom): QuizRoom {
  const m = ensureMillionaire(room);
  const last = room.answerLog[room.answerLog.length - 1];
  if (!last || last.turnIndex !== room.questionIndex) {
    return room;
  }

  if (!last.correct) {
    const awarded = awardOnFailure(m.securedPrize);
    return {
      ...room,
      phase: "lost",
      jointScore: awarded,
      revealStartedAt: null,
      millionaire: {
        ...m,
        outcome: "lost",
        finalAwardedPrize: awarded,
      },
      players: room.players.map((p) => ({ ...p, answer: null })),
      updatedAt: Date.now(),
    };
  }

  const secured = securedPrizeAfterCorrect(m.securedPrize, room.questionIndex);
  const nextIndex = room.questionIndex + 1;

  if (nextIndex >= MILLIONAIRE_QUESTION_COUNT) {
    return {
      ...room,
      phase: "won",
      questionIndex: nextIndex,
      jointScore: secured,
      revealStartedAt: null,
      millionaire: {
        ...resetLocksForQuestion(room.players, m),
        securedPrize: secured,
        outcome: "won",
        finalAwardedPrize: secured,
      },
      players: room.players.map((p) => ({ ...p, answer: null, score: secured })),
      updatedAt: Date.now(),
    };
  }

  const nextM = resetLocksForQuestion(room.players, {
    ...m,
    securedPrize: secured,
  });

  return {
    ...room,
    phase: "question",
    questionIndex: nextIndex,
    revealStartedAt: null,
    millionaire: nextM,
    players: room.players.map((p) => ({ ...p, answer: null, score: secured })),
    jointScore: secured,
    updatedAt: Date.now(),
  };
}

export function millionaireTickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (!isMillionaireRoom(room)) {
    return room;
  }

  if (room.phase === "discussion" && room.revealStartedAt !== null) {
    const m = ensureMillionaire(room);
    const deadline = m.askTeamActiveUntil ?? room.revealStartedAt + MILLIONAIRE_DISCUSSION_MS;
    if (now >= deadline) {
      if (disagreementDiscussionActive(room)) {
        return {
          ...room,
          phase: "question",
          revealStartedAt: null,
          millionaire: resetLocksForQuestion(room.players, { ...m, askTeamActiveUntil: null }),
          players: room.players.map((p) => ({ ...p, answer: null })),
          updatedAt: now,
        };
      }
      if (m.askTeamActiveUntil !== null && !allPlayersLocked(room)) {
        return {
          ...room,
          phase: "question",
          revealStartedAt: null,
          millionaire: { ...m, askTeamActiveUntil: null },
          updatedAt: now,
        };
      }
    }
  }

  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= MILLIONAIRE_REVEAL_MS) {
      return advanceAfterReveal(room);
    }
  }

  return room;
}

export function millionairePublicOptions(room: QuizRoom): {
  bankId: number;
  targetPrize: number;
  securedPrize: number;
} {
  return {
    bankId: currentBankId(room),
    targetPrize: targetPrizeForQuestionIndex(room.questionIndex),
    securedPrize: ensureMillionaire(room).securedPrize,
  };
}

export function assertMillionaireQuestionOrder(order: number[]): void {
  if (order.length > 0 && order.length !== MILLIONAIRE_QUESTION_COUNT) {
    throw new Error(`Millionaire question_order must have ${MILLIONAIRE_QUESTION_COUNT} ids`);
  }
}

export function initMillionaireOnCreate(room: QuizRoom): QuizRoom {
  if (room.gameMode !== GAME_MODE_SHARED_MILLIONAIRE) {
    return room;
  }
  return { ...room, millionaire: createInitialMillionaireState() };
}

export function millionaireMaxPlayers(): number {
  return MAX_PLAYERS;
}
