import { GAME_MODE_PARALLEL_MILLIONAIRE, MAX_PLAYERS } from "../constants";
import { gradeAnswer } from "../answer-validation";
import { getQuestionByBankId } from "../questions";
import { playedIdsForTopic, reserveBankIdsForTopic } from "../question-history";
import type { AnswerLogEntry, QuizRoom } from "../types";
import {
  MILLIONAIRE_QUESTION_COUNT,
  MILLIONAIRE_REVEAL_MS,
  awardOnFailure,
  securedPrizeAfterCorrect,
  type MillionaireLifelineId,
} from "./config";
import { buildAudiencePoll, pickPhoneFriendSuggestion } from "./lifeline-helpers";
import { selectMillionaireQuestionIds } from "./select-questions";
import {
  createInitialParallelMillionaireState,
  createInitialMillionairePlayerRun,
  type MillionairePlayerRun,
  type MillionaireState,
} from "./types";

function ensureParallel(room: QuizRoom): MillionaireState {
  if (room.gameMode !== GAME_MODE_PARALLEL_MILLIONAIRE || !room.millionaire) {
    throw new Error("Parallel millionaire state missing");
  }
  if (room.millionaire.variant !== "parallel" || !room.millionaire.parallelRuns) {
    throw new Error("Invalid parallel millionaire state");
  }
  return room.millionaire;
}

function runFor(room: QuizRoom, playerId: string): MillionairePlayerRun {
  const m = ensureParallel(room);
  const run = m.parallelRuns![playerId];
  if (!run) {
    throw new Error("Player not in parallel millionaire run");
  }
  return run;
}

function currentBankId(run: MillionairePlayerRun): number {
  const id = run.questionOrder[run.questionIndex];
  if (id === undefined) {
    throw new Error("No question allocated");
  }
  return id;
}

function resetRunQuestionVisuals(run: MillionairePlayerRun): MillionairePlayerRun {
  return {
    ...run,
    eliminatedOptionIndices: [],
    audiencePercents: null,
    phoneFriendHint: null,
    revealStartedAt: null,
    answerLocked: false,
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

function runTerminal(run: MillionairePlayerRun): boolean {
  return run.phase === "won" || run.phase === "lost" || run.phase === "walkaway";
}

function syncRoomFromRuns(room: QuizRoom, runs: Record<string, MillionairePlayerRun>): QuizRoom {
  const allTerminal = room.players.every((p) => runTerminal(runs[p.id]!));
  const players = room.players.map((p) => {
    const run = runs[p.id];
    const prize = run?.finalAwardedPrize ?? run?.securedPrize ?? 0;
    return {
      ...p,
      score: prize,
      answer: run?.phase === "question" || run?.phase === "reveal" ? p.answer : null,
    };
  });
  return {
    ...room,
    phase: allTerminal ? "finished" : "question",
    players,
    jointScore: Math.max(...players.map((p) => p.score)),
    updatedAt: Date.now(),
  };
}

function patchRun(
  room: QuizRoom,
  playerId: string,
  patch: (run: MillionairePlayerRun) => MillionairePlayerRun,
): QuizRoom {
  const m = ensureParallel(room);
  const runs = { ...m.parallelRuns! };
  runs[playerId] = patch(runs[playerId]!);
  const millionaire = { ...m, parallelRuns: runs };
  return syncRoomFromRuns({ ...room, millionaire }, runs);
}

export function startParallelMillionaireGame(room: QuizRoom): QuizRoom {
  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  const excludeBase = playedIdsForTopic(
    room,
    room.quizCategoryId,
    room.quizDifficulty,
    GAME_MODE_PARALLEL_MILLIONAIRE,
  );
  const usedAcross = new Set<number>(excludeBase);
  const runs: Record<string, MillionairePlayerRun> = {};
  for (const p of room.players) {
    const order = selectMillionaireQuestionIds(room.quizCategoryId, [...usedAcross]);
    for (const id of order) usedAcross.add(id);
    runs[p.id] = createInitialMillionairePlayerRun(order);
  }

  let started: QuizRoom = {
    ...room,
    phase: "question",
    questionIndex: 0,
    questionOrder: [],
    millionaire: {
      ...createInitialParallelMillionaireState(),
      parallelRuns: runs,
    },
    answerLog: [],
    revealStartedAt: null,
    players: room.players.map((p) => ({ ...p, score: 0, answer: null })),
    updatedAt: Date.now(),
  };

  const allIds = Object.values(runs).flatMap((r) => r.questionOrder);
  started = reserveBankIdsForTopic(
    started,
    started.quizCategoryId,
    started.quizDifficulty,
    allIds,
    GAME_MODE_PARALLEL_MILLIONAIRE,
  );
  return syncRoomFromRuns(started, runs);
}

export function parallelSelectAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
): QuizRoom {
  const run = runFor(room, playerId);
  if (run.phase !== "question" || run.answerLocked) {
    throw new Error("Not accepting selections right now");
  }
  gradeAnswer(currentBankId(run), choiceIndex);
  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, answer: choiceIndex } : p,
    ),
    updatedAt: Date.now(),
  };
}

function logAnswer(room: QuizRoom, playerId: string, choiceIndex: number, correct: boolean): AnswerLogEntry {
  const run = runFor(room, playerId);
  return {
    sessionId: room.sessionId,
    turnIndex: run.questionIndex,
    bankId: currentBankId(run),
    playerId,
    choiceIndex,
    correct,
  };
}

export function parallelLockAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
): QuizRoom {
  const run = runFor(room, playerId);
  if (run.phase !== "question" || run.answerLocked) {
    throw new Error("Not accepting lock-ins right now");
  }
  const bankId = currentBankId(run);
  const graded = gradeAnswer(bankId, choiceIndex);
  const entry = logAnswer(room, playerId, graded.choiceIndex, graded.correct);

  let next = patchRun(room, playerId, (r) => ({
    ...r,
    answerLocked: true,
    phase: "reveal",
    revealStartedAt: Date.now(),
  }));
  next = {
    ...next,
    answerLog: [...next.answerLog, entry],
    players: next.players.map((p) =>
      p.id === playerId ? { ...p, answer: graded.choiceIndex } : p,
    ),
  };
  return next;
}

function advanceRunAfterReveal(room: QuizRoom, playerId: string): QuizRoom {
  const run = runFor(room, playerId);
  const last = room.answerLog.filter(
    (e) =>
      e.sessionId === room.sessionId &&
      e.playerId === playerId &&
      e.turnIndex === run.questionIndex,
  ).pop();
  if (!last) {
    return room;
  }

  if (!last.correct) {
    const awarded = awardOnFailure(run.securedPrize);
    return patchRun(room, playerId, (r) => ({
      ...r,
      phase: "lost",
      outcome: "lost",
      finalAwardedPrize: awarded,
      revealStartedAt: null,
    }));
  }

  const secured = securedPrizeAfterCorrect(run.securedPrize, run.questionIndex);
  const nextIndex = run.questionIndex + 1;

  if (nextIndex >= MILLIONAIRE_QUESTION_COUNT) {
    return patchRun(room, playerId, (r) => ({
      ...resetRunQuestionVisuals(r),
      questionIndex: nextIndex,
      securedPrize: secured,
      phase: "won",
      outcome: "won",
      finalAwardedPrize: secured,
      revealStartedAt: null,
    }));
  }

  return patchRun(room, playerId, (r) => ({
    ...resetRunQuestionVisuals(r),
    questionIndex: nextIndex,
    securedPrize: secured,
    phase: "question",
    revealStartedAt: null,
  }));
}

export function parallelWalkAway(room: QuizRoom, playerId: string): QuizRoom {
  const run = runFor(room, playerId);
  if (run.phase !== "question" || run.answerLocked) {
    throw new Error("Walk away is not available right now");
  }
  const prize = run.securedPrize;
  return patchRun(room, playerId, (r) => ({
    ...r,
    phase: "walkaway",
    outcome: "walkaway",
    finalAwardedPrize: prize,
  }));
}

export function parallelUseLifeline(
  room: QuizRoom,
  playerId: string,
  lifeline: MillionaireLifelineId,
): QuizRoom {
  const run = runFor(room, playerId);
  if (run.phase !== "question" || run.answerLocked) {
    throw new Error("Lifelines can only be used on an open question");
  }
  if (run.lifelinesUsed[lifeline]) {
    return room;
  }

  const q = getQuestionByBankId(currentBankId(run));

  if (lifeline === "fifty_fifty") {
    const eliminated = pickFiftyFiftyEliminations(q.correctIndex, q.options.length);
    return patchRun(room, playerId, (r) => ({
      ...r,
      lifelinesUsed: { ...r.lifelinesUsed, fifty_fifty: true },
      eliminatedOptionIndices: eliminated,
    }));
  }

  if (lifeline === "phone_a_friend") {
    const hint = pickPhoneFriendSuggestion(q.correctIndex, q.options.length);
    return patchRun(room, playerId, (r) => ({
      ...r,
      lifelinesUsed: { ...r.lifelinesUsed, phone_a_friend: true },
      phoneFriendHint: hint,
    }));
  }

  if (lifeline === "ask_audience") {
    const percents = buildAudiencePoll(q.correctIndex, q.options.length);
    return patchRun(room, playerId, (r) => ({
      ...r,
      lifelinesUsed: { ...r.lifelinesUsed, ask_audience: true },
      audiencePercents: percents,
    }));
  }

  return room;
}

export function parallelTickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (room.gameMode !== GAME_MODE_PARALLEL_MILLIONAIRE || !room.millionaire?.parallelRuns) {
    return room;
  }
  let next = room;
  for (const p of room.players) {
    const run = room.millionaire.parallelRuns[p.id];
    if (!run || run.phase !== "reveal" || run.revealStartedAt === null) {
      continue;
    }
    if (now - run.revealStartedAt >= MILLIONAIRE_REVEAL_MS) {
      next = advanceRunAfterReveal(next, p.id);
    }
  }
  return next;
}

export function initParallelMillionaireOnCreate(room: QuizRoom): QuizRoom {
  if (room.gameMode !== GAME_MODE_PARALLEL_MILLIONAIRE) {
    return room;
  }
  return { ...room, millionaire: createInitialParallelMillionaireState() };
}
