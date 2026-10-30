import { categoryTitle } from "../categories";
import { difficultyTitle } from "../difficulties";
import { MILLIONAIRE_REVEAL_MS } from "../constants";
import { getQuestionByBankId, toPublicQuestion } from "../questions";
import { buildScorecard } from "../scorecard";
import type {
  ClientRoomState,
  MillionaireClientView,
  MillionaireOpponentWatch,
  QuizRoom,
} from "../types";
import {
  MILLIONAIRE_DISCUSSION_MS,
  MILLIONAIRE_LADDER,
  MILLIONAIRE_QUESTION_COUNT,
  MILLIONAIRE_SAFETY_NET_INDICES,
  targetPrizeForQuestionIndex,
} from "./config";
import { isParallelMillionaireRoom } from "./modes";
import { isMillionaireRoom } from "./logic";
import type { MillionairePlayerRun, MillionaireState } from "./types";
import { MILLIONAIRE_REVEAL_MS as PARALLEL_REVEAL_MS } from "./config";

function disagreementMessage(room: QuizRoom): string {
  const m = room.millionaire;
  if (!m) return "Team consultation.";
  const locked = room.players
    .map((p) => m.locks[p.id])
    .filter((l) => l?.locked && l.choiceIndex !== null);
  if (locked.length >= 2) {
    const unique = new Set(locked.map((l) => l!.choiceIndex));
    if (unique.size > 1) {
      return "You picked different answers. The room host must finalise one team choice (correct answer not shown yet).";
    }
  }
  if (m.askTeamActiveUntil !== null) {
    return "Discuss, then lock the same answer or the host finalises.";
  }
  return "Discuss and lock the same answer, or the host can finalise the team choice.";
}

function ensureM(room: QuizRoom): MillionaireState {
  if (!room.millionaire) {
    throw new Error("Millionaire state missing");
  }
  return room.millionaire;
}

export function buildMillionaireClientView(
  room: QuizRoom,
  viewerId: string,
): MillionaireClientView {
  const m = ensureM(room);
  const lock = m.locks[viewerId];
  const locked = lock?.locked ?? false;
  const openQuestion =
    room.phase === "question" ||
    room.phase === "discussion" ||
    room.phase === "reveal";

  return {
    playStyle: "shared",
    opponentWatch: null,
    ladder: MILLIONAIRE_LADDER,
    safetyNetIndices: [...MILLIONAIRE_SAFETY_NET_INDICES],
    questionNumber: Math.min(room.questionIndex + 1, MILLIONAIRE_QUESTION_COUNT),
    totalQuestions: MILLIONAIRE_QUESTION_COUNT,
    targetPrize: openQuestion ? targetPrizeForQuestionIndex(room.questionIndex) : 0,
    securedPrize: m.securedPrize,
    finalAwardedPrize: m.finalAwardedPrize,
    outcome: m.outcome,
    lifelinesAvailable: {
      fifty_fifty: !m.lifelinesUsed.fifty_fifty,
      phone_a_friend: !m.lifelinesUsed.phone_a_friend,
      ask_audience: !m.lifelinesUsed.ask_audience,
    },
    eliminatedOptionIndices: [...m.eliminatedOptionIndices],
    audiencePercents: m.audiencePercents ? [...m.audiencePercents] : null,
    phoneFriendHint: m.phoneFriendHint ? { ...m.phoneFriendHint } : null,
    phase: room.phase,
    discussionEndsAt:
      room.phase === "discussion" && room.revealStartedAt
        ? (m.askTeamActiveUntil ?? room.revealStartedAt + MILLIONAIRE_DISCUSSION_MS)
        : null,
    revealEndsAt:
      room.phase === "reveal" && room.revealStartedAt
        ? room.revealStartedAt + MILLIONAIRE_REVEAL_MS
        : null,
    canSelectAnswer: room.phase === "question" && !locked,
    canLockAnswer:
      (room.phase === "question" || room.phase === "discussion") && !locked,
    canFinalizeTeam: room.phase === "discussion" && viewerId === room.hostId,
    canWalkAway: room.phase === "question" && viewerId === room.hostId && !locked,
    canUseLifelines:
      room.phase === "question" && viewerId === room.hostId && !locked,
    playerLocks: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      choiceIndex: m.locks[p.id]?.choiceIndex ?? p.answer,
      locked: m.locks[p.id]?.locked ?? false,
    })),
  };
}

function runToViewSlice(run: MillionairePlayerRun, viewerId: string, room: QuizRoom) {
  const open =
    run.phase === "question" || run.phase === "reveal";
  return {
    ladder: MILLIONAIRE_LADDER,
    safetyNetIndices: [...MILLIONAIRE_SAFETY_NET_INDICES],
    questionNumber: Math.min(run.questionIndex + 1, MILLIONAIRE_QUESTION_COUNT),
    totalQuestions: MILLIONAIRE_QUESTION_COUNT,
    targetPrize: open ? targetPrizeForQuestionIndex(run.questionIndex) : 0,
    securedPrize: run.securedPrize,
    finalAwardedPrize: run.finalAwardedPrize,
    outcome: run.outcome,
    lifelinesAvailable: {
      fifty_fifty: !run.lifelinesUsed.fifty_fifty,
      phone_a_friend: !run.lifelinesUsed.phone_a_friend,
      ask_audience: !run.lifelinesUsed.ask_audience,
    },
    eliminatedOptionIndices: [...run.eliminatedOptionIndices],
    audiencePercents: run.audiencePercents ? [...run.audiencePercents] : null,
    phoneFriendHint: run.phoneFriendHint ? { ...run.phoneFriendHint } : null,
    phase: run.phase as ClientRoomState["phase"],
    discussionEndsAt: null,
    revealEndsAt:
      run.phase === "reveal" && run.revealStartedAt
        ? run.revealStartedAt + PARALLEL_REVEAL_MS
        : null,
    canSelectAnswer: run.phase === "question" && !run.answerLocked,
    canLockAnswer: run.phase === "question" && !run.answerLocked,
    canFinalizeTeam: false,
    canWalkAway: run.phase === "question" && !run.answerLocked,
    canUseLifelines: run.phase === "question" && !run.answerLocked,
    playerLocks: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      choiceIndex: p.id === viewerId ? p.answer : null,
      locked: p.id === viewerId ? run.answerLocked : false,
    })),
  };
}

function toParallelMillionaireClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  const you = room.players.find((p) => p.id === viewerId)!;
  const m = ensureM(room);
  const run = m.parallelRuns?.[viewerId];
  if (!run) {
    throw new Error("Parallel run missing for viewer");
  }

  const opponent = room.players.find((p) => p.id !== viewerId);
  let question = null;
  const bankId = run.questionOrder[run.questionIndex];
  if (
    bankId !== undefined &&
    (run.phase === "question" || run.phase === "reveal")
  ) {
    question = toPublicQuestion(getQuestionByBankId(bankId));
  }

  let answerFeedback: ClientRoomState["answerFeedback"] = null;
  if (run.phase === "reveal") {
    const entry = room.answerLog.filter(
      (e) =>
        e.sessionId === room.sessionId &&
        e.playerId === viewerId &&
        e.turnIndex === run.questionIndex,
    ).pop();
    if (entry) {
      const q = getQuestionByBankId(entry.bankId);
      answerFeedback = {
        correct: entry.correct,
        choiceIndex: entry.choiceIndex,
        correctIndex: q.correctIndex,
        chosenLabel: q.options[entry.choiceIndex] ?? "",
        correctLabel: q.options[q.correctIndex] ?? "",
      };
    }
  }

  const prizeDisplay = run.finalAwardedPrize ?? run.securedPrize;
  const coreView = runToViewSlice(run, viewerId, room);

  let opponentWatch: MillionaireOpponentWatch | null = null;

  if (opponent && m.parallelRuns?.[opponent.id]) {
    const oRun = m.parallelRuns[opponent.id]!;
    let oQuestion = null;
    const oBank = oRun.questionOrder[oRun.questionIndex];
    if (
      oBank !== undefined &&
      (oRun.phase === "question" || oRun.phase === "reveal")
    ) {
      oQuestion = toPublicQuestion(getQuestionByBankId(oBank));
    }
    opponentWatch = {
      playerId: opponent.id,
      name: opponent.name,
      questionNumber: Math.min(oRun.questionIndex + 1, MILLIONAIRE_QUESTION_COUNT),
      targetPrize: targetPrizeForQuestionIndex(oRun.questionIndex),
      securedPrize: oRun.securedPrize,
      phase: oRun.phase as ClientRoomState["phase"],
      question: oQuestion,
      eliminatedOptionIndices: [...oRun.eliminatedOptionIndices],
      outcome: oRun.outcome,
    };
  }

  return {
    code: room.code,
    hostId: room.hostId,
    gameMode: room.gameMode,
    quizCategoryId: room.quizCategoryId,
    quizCategoryTitle: categoryTitle(room.quizCategoryId),
    quizDifficulty: room.quizDifficulty,
    quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
    phase: run.phase as ClientRoomState["phase"],
    questionIndex: run.questionIndex,
    totalQuestions: MILLIONAIRE_QUESTION_COUNT,
    turnIndex: run.questionIndex,
    activePlayerId: null,
    isYourTurn: true,
    canSubmitAnswer: false,
    statusMessage:
      run.phase === "question"
        ? "Your own ladder — lock in when ready. You can see your friend's question but not answer it."
        : null,
    scoresHidden: false,
    jointScore: null,
    players: room.players.map((p) => {
      const pr = m.parallelRuns?.[p.id];
      const sc = pr?.finalAwardedPrize ?? pr?.securedPrize ?? 0;
      return {
        id: p.id,
        name: p.name,
        score: sc,
        hasAnswered: p.id === viewerId ? run.answerLocked : pr?.answerLocked ?? false,
        answerIndex: p.id === viewerId ? you.answer : null,
        wasCorrect:
          p.id === viewerId && run.phase === "reveal" && answerFeedback
            ? answerFeedback.correct
            : null,
      };
    }),
    question,
    correctIndex: answerFeedback?.correctIndex ?? null,
    answerFeedback,
    revealEndsAt: coreView.revealEndsAt,
    winnerIds: [],
    you: {
      id: you.id,
      name: you.name,
      score: prizeDisplay,
      answer: you.answer,
    },
    results: null,
    scorecard: buildScorecard(room),
    millionaireView: {
      playStyle: "parallel",
      opponentWatch,
      ...coreView,
    },
  };
}

export function toMillionaireClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  if (isParallelMillionaireRoom(room)) {
    return toParallelMillionaireClientState(room, viewerId);
  }
  const you = room.players.find((p) => p.id === viewerId)!;
  const bankId = room.questionOrder[room.questionIndex];
  let question = null;
  if (
    bankId !== undefined &&
    (room.phase === "question" ||
      room.phase === "discussion" ||
      room.phase === "reveal")
  ) {
    question = toPublicQuestion(getQuestionByBankId(bankId));
  }

  let correctIndex: number | null = null;
  let answerFeedback: ClientRoomState["answerFeedback"] = null;
  if (room.phase === "reveal") {
    const entry = room.answerLog.filter(
      (e) => e.sessionId === room.sessionId && e.turnIndex === room.questionIndex,
    ).pop();
    if (entry) {
      const q = getQuestionByBankId(entry.bankId);
      correctIndex = q.correctIndex;
      answerFeedback = {
        correct: entry.correct,
        choiceIndex: entry.choiceIndex,
        correctIndex: q.correctIndex,
        chosenLabel: q.options[entry.choiceIndex] ?? "",
        correctLabel: q.options[q.correctIndex] ?? "",
      };
    }
  }

  const m = room.millionaire!;
  const prizeDisplay = m.finalAwardedPrize ?? m.securedPrize;

  return {
    code: room.code,
    hostId: room.hostId,
    gameMode: room.gameMode,
    quizCategoryId: room.quizCategoryId,
    quizCategoryTitle: categoryTitle(room.quizCategoryId),
    quizDifficulty: room.quizDifficulty,
    quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
    phase: room.phase,
    questionIndex: room.questionIndex,
    totalQuestions: MILLIONAIRE_QUESTION_COUNT,
    turnIndex: room.turnIndex,
    activePlayerId: null,
    isYourTurn: true,
    canSubmitAnswer: false,
    statusMessage:
      room.phase === "discussion"
        ? disagreementMessage(room)
        : room.phase === "question"
          ? "Lock the same answer to continue. If you disagree, the host must pick the team answer."
          : null,
    scoresHidden: false,
    jointScore: prizeDisplay,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: prizeDisplay,
      hasAnswered: m.locks[p.id]?.locked ?? false,
      answerIndex: p.answer,
      wasCorrect:
        room.phase === "reveal" && answerFeedback && p.id === room.hostId
          ? answerFeedback.correct
          : null,
    })),
    question,
    correctIndex,
    answerFeedback,
    revealEndsAt: null,
    winnerIds: [],
    you: {
      id: you.id,
      name: you.name,
      score: prizeDisplay,
      answer: you.answer,
    },
    results: null,
    scorecard: buildScorecard(room),
    millionaireView: {
      ...buildMillionaireClientView(room, viewerId),
      playStyle: "shared",
      opponentWatch: null,
    },
  };
}

export function wrapMillionaireIfNeeded(room: QuizRoom, viewerId: string, base: ClientRoomState): ClientRoomState {
  if (!isMillionaireRoom(room)) {
    return { ...base, millionaireView: null };
  }
  return toMillionaireClientState(room, viewerId);
}
