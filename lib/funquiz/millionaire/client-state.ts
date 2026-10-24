import { categoryTitle } from "../categories";
import { difficultyTitle } from "../difficulties";
import { MILLIONAIRE_REVEAL_MS } from "../constants";
import { getQuestionByBankId, toPublicQuestion } from "../questions";
import type {
  ClientRoomState,
  MillionaireClientView,
  QuizRoom,
} from "../types";
import {
  MILLIONAIRE_DISCUSSION_MS,
  MILLIONAIRE_LADDER,
  MILLIONAIRE_QUESTION_COUNT,
  MILLIONAIRE_SAFETY_NET_INDICES,
  targetPrizeForQuestionIndex,
} from "./config";
import { isMillionaireRoom } from "./logic";
import type { MillionaireState } from "./types";

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
    return "Ask the Team — discuss, then lock the same answer or the host finalises.";
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
      ask_team: !m.lifelinesUsed.ask_team,
      change_question: !m.lifelinesUsed.change_question,
    },
    eliminatedOptionIndices: [...m.eliminatedOptionIndices],
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

export function toMillionaireClientState(room: QuizRoom, viewerId: string): ClientRoomState {
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
    millionaireView: buildMillionaireClientView(room, viewerId),
  };
}

export function wrapMillionaireIfNeeded(room: QuizRoom, viewerId: string, base: ClientRoomState): ClientRoomState {
  if (!isMillionaireRoom(room)) {
    return { ...base, millionaireView: null };
  }
  return toMillionaireClientState(room, viewerId);
}
