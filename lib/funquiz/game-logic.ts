import {
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_TAKE_TURNS,
  MAX_PLAYERS,
  QUESTIONS_PER_GAME,
  REVEAL_MS,
  ROOM_CODE_LENGTH,
  TAKE_TURNS_QUESTIONS_PER_PLAYER,
} from "./constants";
import { toMillionaireClientState } from "./millionaire/client-state";
import {
  initMillionaireOnCreate,
  isMillionaireRoom,
  millionaireSelectAnswer,
  millionaireTickRoom,
  startMillionaireGame,
} from "./millionaire/logic";
import { createInitialMillionaireState } from "./millionaire/types";
import type { QuizCategoryId } from "./categories";
import { categoryTitle } from "./categories";
import type { QuizDifficulty } from "./difficulties";
import { difficultyTitle } from "./difficulties";
import { gradeAnswer, normalizeChoiceIndex } from "./answer-validation";
import {
  emptyPlayedBankIdsByTopic,
  playedIdsForTopic,
  reserveBankIdsForTopic,
} from "./question-history";
import { selectQuestionIdsForCategory } from "./question-selection";
import { buildScorecard } from "./scorecard";
import { allocatedBankIdsForSession, assertRoomQuestionAllocation } from "./session-questions";
import { getQuestionByBankId, toPublicQuestion } from "./questions";
import type {
  AnswerLogEntry,
  ClientRoomState,
  GameMode,
  QuizPlayer,
  QuizRoom,
  ResultRow,
} from "./types";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function allocateQuestionsForGame(
  quizCategoryId: QuizCategoryId,
  quizDifficulty: QuizDifficulty,
  excludeBankIds: number[] = [],
): {
  questionOrder: number[];
  hostQuestionOrder: number[];
  guestQuestionOrder: number[];
} {
  const questionOrder = selectQuestionIdsForCategory(
    quizCategoryId,
    quizDifficulty,
    excludeBankIds,
  );
  const hostQuestionOrder = shuffleInPlace(
    questionOrder.slice(0, TAKE_TURNS_QUESTIONS_PER_PLAYER),
  );
  const guestQuestionOrder = shuffleInPlace(
    questionOrder.slice(TAKE_TURNS_QUESTIONS_PER_PLAYER, QUESTIONS_PER_GAME),
  );
  return { questionOrder, hostQuestionOrder, guestQuestionOrder };
}

export function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRoom(
  hostId: string,
  hostName: string,
  code: string,
  gameMode: GameMode,
  quizCategoryId: QuizCategoryId,
  quizDifficulty: QuizDifficulty,
): QuizRoom {
  const now = Date.now();
  return {
    code,
    hostId,
    gameMode,
    quizCategoryId,
    quizDifficulty,
    sessionId: newSessionId(),
    phase: "lobby",
    questionIndex: 0,
    questionOrder: [],
    hostQuestionOrder: [],
    guestQuestionOrder: [],
    turnIndex: 0,
    activePlayerId: null,
    jointScore: 0,
    answerLog: [],
    players: [{ id: hostId, name: hostName.trim().slice(0, 24), score: 0, answer: null }],
    revealStartedAt: null,
    millionaire:
      gameMode === GAME_MODE_SHARED_MILLIONAIRE
        ? createInitialMillionaireState()
        : undefined,
    playedBankIdsByTopic: emptyPlayedBankIdsByTopic(),
    createdAt: now,
    updatedAt: now,
  };
}

export function addPlayer(room: QuizRoom, playerId: string, playerName: string): QuizRoom {
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }
  if (room.players.some((p) => p.id === playerId)) {
    return room;
  }
  if (room.players.length >= MAX_PLAYERS) {
    throw new Error("Room is full");
  }
  return {
    ...room,
    players: [
      ...room.players,
      { id: playerId, name: playerName.trim().slice(0, 24), score: 0, answer: null },
    ],
    updatedAt: Date.now(),
  };
}

export function guestPlayerId(room: QuizRoom): string | null {
  return room.players.find((p) => p.id !== room.hostId)?.id ?? null;
}

function hasLogForTakeTurn(room: QuizRoom, turnIndex: number): boolean {
  return room.answerLog.some(
    (e) => e.sessionId === room.sessionId && e.turnIndex === turnIndex,
  );
}

function hasLogForTogetherQuestion(room: QuizRoom, questionIndex: number): boolean {
  return room.answerLog.some(
    (e) =>
      e.sessionId === room.sessionId &&
      e.turnIndex === questionIndex &&
      room.gameMode === GAME_MODE_PLAY_TOGETHER,
  );
}

export function startGame(room: QuizRoom, playerId: string): QuizRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start");
  }
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }

  if (room.gameMode === GAME_MODE_SHARED_MILLIONAIRE) {
    if (room.players.length < 1) {
      throw new Error("Waiting for at least one player");
    }
    return startMillionaireGame(initMillionaireOnCreate(room));
  }

  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }

  const exclude = playedIdsForTopic(
    room,
    room.quizCategoryId,
    room.quizDifficulty,
    room.gameMode,
  );
  const allocated = allocateQuestionsForGame(
    room.quizCategoryId,
    room.quizDifficulty,
    exclude,
  );
  const guestId = guestPlayerId(room);
  if (!guestId) {
    throw new Error("Waiting for a second player");
  }

  let started: QuizRoom = {
    ...room,
    ...allocated,
    phase: "question",
    questionIndex: 0,
    turnIndex: 0,
    activePlayerId: room.hostId,
    jointScore: 0,
    answerLog: [],
    revealStartedAt: null,
    players: room.players.map((p) => ({ ...p, score: 0, answer: null })),
    updatedAt: Date.now(),
  };
  assertRoomQuestionAllocation(started);
  started = reserveBankIdsForTopic(
    started,
    started.quizCategoryId,
    started.quizDifficulty,
    allocatedBankIdsForSession(started),
    started.gameMode,
  );
  return started;
}

export function resetRoomForNewGame(
  room: QuizRoom,
  playerId: string,
  gameMode: GameMode,
  quizCategoryId: QuizCategoryId,
  quizDifficulty: QuizDifficulty,
): QuizRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start a new game");
  }
  const terminal =
    room.phase === "finished" ||
    room.phase === "won" ||
    room.phase === "lost" ||
    room.phase === "walkaway";
  if (!terminal) {
    throw new Error("Finish the current game before starting a new one");
  }
  return {
    ...room,
    gameMode,
    quizCategoryId,
    quizDifficulty,
    sessionId: newSessionId(),
    phase: "lobby",
    questionIndex: 0,
    questionOrder: [],
    hostQuestionOrder: [],
    guestQuestionOrder: [],
    turnIndex: 0,
    activePlayerId: null,
    jointScore: 0,
    answerLog: [],
    revealStartedAt: null,
    millionaire:
      gameMode === GAME_MODE_SHARED_MILLIONAIRE
        ? createInitialMillionaireState()
        : undefined,
    players: room.players.map((p) => ({ ...p, score: 0, answer: null })),
    updatedAt: Date.now(),
  };
}

function bankIdForTakeTurn(room: QuizRoom, turnIndex: number): number {
  const half = Math.floor(turnIndex / 2);
  if (turnIndex % 2 === 0) {
    return room.hostQuestionOrder[half]!;
  }
  return room.guestQuestionOrder[half]!;
}

function expectedPlayerForTurn(room: QuizRoom, turnIndex: number): string {
  const guestId = guestPlayerId(room);
  if (!guestId) throw new Error("Missing guest player");
  return turnIndex % 2 === 0 ? room.hostId : guestId;
}

function submitTakeTurns(room: QuizRoom, playerId: string, choiceIndex: number): QuizRoom {
  if (room.phase !== "question") {
    throw new Error("Not accepting answers right now");
  }
  if (playerId !== room.activePlayerId) {
    throw new Error("It is not your turn");
  }
  if (hasLogForTakeTurn(room, room.turnIndex)) {
    return room;
  }
  const you = room.players.find((p) => p.id === playerId);
  if (!you) throw new Error("Player not in room");
  if (you.answer !== null) {
    return room;
  }

  const bankId = bankIdForTakeTurn(room, room.turnIndex);
  const graded = gradeAnswer(bankId, choiceIndex);
  const entry: AnswerLogEntry = {
    sessionId: room.sessionId,
    turnIndex: room.turnIndex,
    bankId,
    playerId,
    choiceIndex: graded.choiceIndex,
    correct: graded.correct,
  };

  const players = room.players.map((p) => {
    if (p.id !== playerId) return { ...p, answer: null };
    return {
      ...p,
      answer: graded.choiceIndex,
      score: graded.correct ? p.score + 1 : p.score,
    };
  });

  return {
    ...room,
    players,
    answerLog: [...room.answerLog, entry],
    phase: "reveal",
    revealStartedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function submitPlayTogether(room: QuizRoom, playerId: string, choiceIndex: number): QuizRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the room creator can submit answers in Play Together");
  }
  if (hasLogForTogetherQuestion(room, room.questionIndex)) {
    return room;
  }
  if (room.phase !== "question") {
    throw new Error("Not accepting answers right now");
  }
  const host = room.players.find((p) => p.id === room.hostId);
  if (!host) throw new Error("Host not in room");
  if (host.answer !== null) {
    return room;
  }

  const bankId = room.questionOrder[room.questionIndex]!;
  const graded = gradeAnswer(bankId, choiceIndex);
  const entry: AnswerLogEntry = {
    sessionId: room.sessionId,
    turnIndex: room.questionIndex,
    bankId,
    playerId,
    choiceIndex: graded.choiceIndex,
    correct: graded.correct,
  };
  const jointScore = room.jointScore + (graded.correct ? 1 : 0);
  const players = room.players.map((p) => ({
    ...p,
    answer: p.id === room.hostId ? graded.choiceIndex : null,
    score: jointScore,
  }));

  return {
    ...room,
    players,
    jointScore,
    answerLog: [...room.answerLog, entry],
    phase: "reveal",
    revealStartedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function submitAnswer(room: QuizRoom, playerId: string, choiceIndexRaw: unknown): QuizRoom {
  const choiceIndex = normalizeChoiceIndex(choiceIndexRaw);
  if (room.gameMode === GAME_MODE_SHARED_MILLIONAIRE) {
    return millionaireSelectAnswer(room, playerId, choiceIndex);
  }
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    return submitTakeTurns(room, playerId, choiceIndex);
  }
  return submitPlayTogether(room, playerId, choiceIndex);
}

function advanceFromRevealTakeTurns(room: QuizRoom): QuizRoom {
  const nextTurn = room.turnIndex + 1;
  const clearedPlayers = room.players.map((p) => ({ ...p, answer: null }));

  if (nextTurn >= QUESTIONS_PER_GAME) {
    return {
      ...room,
      phase: "finished",
      turnIndex: nextTurn,
      activePlayerId: null,
      revealStartedAt: null,
      players: clearedPlayers,
      updatedAt: Date.now(),
    };
  }

  const nextActive = expectedPlayerForTurn(room, nextTurn);
  return {
    ...room,
    phase: "question",
    turnIndex: nextTurn,
    activePlayerId: nextActive,
    questionIndex: Math.floor(nextTurn / 2),
    revealStartedAt: null,
    players: clearedPlayers,
    updatedAt: Date.now(),
  };
}

function advanceFromRevealPlayTogether(room: QuizRoom): QuizRoom {
  const nextIndex = room.questionIndex + 1;
  if (nextIndex >= QUESTIONS_PER_GAME) {
    return {
      ...room,
      phase: "finished",
      revealStartedAt: null,
      players: room.players.map((p) => ({ ...p, answer: null })),
      updatedAt: Date.now(),
    };
  }
  return {
    ...room,
    phase: "question",
    questionIndex: nextIndex,
    revealStartedAt: null,
    players: room.players.map((p) => ({ ...p, answer: null })),
    updatedAt: Date.now(),
  };
}

function advanceFromReveal(room: QuizRoom): QuizRoom {
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    return advanceFromRevealTakeTurns(room);
  }
  return advanceFromRevealPlayTogether(room);
}

export function tickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (isMillionaireRoom(room)) {
    return millionaireTickRoom(room, now);
  }
  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= REVEAL_MS) {
      return advanceFromReveal(room);
    }
  }
  return room;
}

function computeWinners(players: QuizPlayer[]): string[] {
  const max = Math.max(...players.map((p) => p.score));
  return players.filter((p) => p.score === max).map((p) => p.id);
}

export function buildResultRows(room: QuizRoom): ResultRow[] {
  const nameById = new Map(room.players.map((p) => [p.id, p.name]));
  const sorted = [...room.answerLog]
    .filter((e) => e.sessionId === room.sessionId)
    .sort((a, b) => a.turnIndex - b.turnIndex);

  return sorted.map((e) => {
    const q = getQuestionByBankId(e.bankId);
    const chosenLabel =
      e.choiceIndex === null || e.choiceIndex === undefined
        ? null
        : q.options[e.choiceIndex] ?? null;
    return {
      turnIndex: e.turnIndex,
      bankId: e.bankId,
      playerId: e.playerId,
      playerName: nameById.get(e.playerId) ?? "Player",
      choiceIndex: e.choiceIndex,
      correctIndex: q.correctIndex,
      correct: e.correct,
      prompt: q.prompt,
      options: q.options,
      chosenLabel,
      correctLabel: q.options[q.correctIndex],
    };
  });
}

function currentBankId(room: QuizRoom): number | null {
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    if (room.turnIndex >= QUESTIONS_PER_GAME) return null;
    if (room.phase === "question" || room.phase === "reveal") {
      return bankIdForTakeTurn(room, room.turnIndex);
    }
    return null;
  }
  if (room.gameMode === GAME_MODE_SHARED_MILLIONAIRE) {
    if (
      room.phase === "question" ||
      room.phase === "discussion" ||
      room.phase === "reveal"
    ) {
      return room.questionOrder[room.questionIndex] ?? null;
    }
    return null;
  }
  if (room.gameMode === GAME_MODE_PLAY_TOGETHER) {
    if (room.phase === "question" || room.phase === "reveal") {
      return room.questionOrder[room.questionIndex] ?? null;
    }
  }
  return null;
}

function revealLogEntryForCurrentStep(room: QuizRoom): AnswerLogEntry | null {
  const turnKey =
    room.gameMode === GAME_MODE_TAKE_TURNS ? room.turnIndex : room.questionIndex;
  const entries = room.answerLog.filter(
    (e) => e.sessionId === room.sessionId && e.turnIndex === turnKey,
  );
  return entries.length > 0 ? entries[entries.length - 1]! : null;
}

export function toClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  if (isMillionaireRoom(room)) {
    const you = room.players.find((p) => p.id === viewerId);
    if (!you) {
      return {
        ...toMillionaireClientState(room, room.hostId),
        error: "You are not in this room",
        millionaireView: null,
      };
    }
    return toMillionaireClientState(room, viewerId);
  }

  const you = room.players.find((p) => p.id === viewerId);
  if (!you) {
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
      totalQuestions: QUESTIONS_PER_GAME,
      turnIndex: room.turnIndex,
      activePlayerId: room.activePlayerId,
      isYourTurn: false,
      canSubmitAnswer: false,
      statusMessage: null,
      scoresHidden: false,
      jointScore: null,
      players: [],
      question: null,
      correctIndex: null,
      answerFeedback: null,
      revealEndsAt: null,
      winnerIds: [],
      you: { id: viewerId, name: "", score: 0, answer: null },
      results: null,
      scorecard: null,
      millionaireView: null,
      error: "You are not in this room",
    };
  }

  const scoresHidden = false;
  const jointScore =
    room.gameMode === GAME_MODE_PLAY_TOGETHER ? room.jointScore : null;

  let question = null;
  let correctIndex: number | null = null;
  let answerFeedback: ClientRoomState["answerFeedback"] = null;
  const bankId = currentBankId(room);
  const revealEntry =
    room.phase === "reveal" ? revealLogEntryForCurrentStep(room) : null;

  let isYourTurn = false;
  let canSubmitAnswer = false;
  let statusMessage: string | null = null;

  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    if (room.phase === "reveal" && revealEntry) {
      question = toPublicQuestion(getQuestionByBankId(revealEntry.bankId));
      const answerer = room.players.find((p) => p.id === revealEntry.playerId);
      if (answerer) {
        statusMessage =
          viewerId === revealEntry.playerId
            ? null
            : `${answerer.name} answered — see result below.`;
      }
    } else if (room.phase === "question" && room.activePlayerId) {
      isYourTurn = viewerId === room.activePlayerId;
      canSubmitAnswer = isYourTurn && you.answer === null;
      const activePlayer = room.players.find((p) => p.id === room.activePlayerId);
      if (!isYourTurn && activePlayer) {
        statusMessage = `It's ${activePlayer.name}'s turn — watch along!`;
      }
      if (bankId !== null) {
        question = toPublicQuestion(getQuestionByBankId(bankId));
      }
    }
  } else if (
    room.gameMode === GAME_MODE_PLAY_TOGETHER &&
    (room.phase === "question" || room.phase === "reveal")
  ) {
    if (bankId !== null) {
      question = toPublicQuestion(getQuestionByBankId(bankId));
    }
    isYourTurn = viewerId === room.hostId;
    canSubmitAnswer = room.phase === "question" && isYourTurn && you.answer === null;
    if (!isYourTurn && room.phase === "question") {
      statusMessage = "Discuss with your partner — only the room creator can submit.";
    }
  }

  if (room.phase === "reveal" && revealEntry) {
    const q = getQuestionByBankId(revealEntry.bankId);
    correctIndex = q.correctIndex;
    answerFeedback = {
      correct: revealEntry.correct,
      choiceIndex: revealEntry.choiceIndex,
      correctIndex: q.correctIndex,
      chosenLabel: q.options[revealEntry.choiceIndex] ?? "",
      correctLabel: q.options[q.correctIndex] ?? "",
    };
  }

  const revealEndsAt =
    room.phase === "reveal" && room.revealStartedAt
      ? room.revealStartedAt + REVEAL_MS
      : null;

  const displayScore = (p: QuizPlayer) => {
    if (scoresHidden) return 0;
    if (room.gameMode === GAME_MODE_PLAY_TOGETHER) return room.jointScore;
    return p.score;
  };

  const results = room.phase === "finished" ? buildResultRows(room) : null;
  const scorecard = buildScorecard(room);

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
    totalQuestions: QUESTIONS_PER_GAME,
    turnIndex: room.turnIndex,
    activePlayerId: room.activePlayerId,
    isYourTurn,
    canSubmitAnswer,
    statusMessage,
    scoresHidden,
    jointScore,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: displayScore(p),
      hasAnswered: p.answer !== null,
      answerIndex:
        room.phase === "reveal" && revealEntry && p.id === revealEntry.playerId
          ? revealEntry.choiceIndex
          : room.phase === "finished"
            ? p.answer
            : null,
      wasCorrect:
        room.phase === "reveal" && revealEntry && p.id === revealEntry.playerId
          ? revealEntry.correct
          : null,
    })),
    question,
    correctIndex,
    answerFeedback,
    revealEndsAt,
    winnerIds:
      room.phase === "finished" && room.gameMode === GAME_MODE_TAKE_TURNS
        ? computeWinners(room.players)
        : [],
    you: {
      id: you.id,
      name: you.name,
      score: displayScore(you),
      answer: you.answer,
    },
    results,
    scorecard,
    millionaireView: null,
  };
}

/** @deprecated use allocateQuestionsForGame in tests */
export function shuffleQuestionOrder(
  quizCategoryId: QuizCategoryId,
  quizDifficulty: QuizDifficulty,
): number[] {
  return allocateQuestionsForGame(quizCategoryId, quizDifficulty).questionOrder;
}
