import {
  GAME_MODE_SINGLE,
  isSharedQuizMode,
  GAME_MODE_PARALLEL_MILLIONAIRE,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_TAKE_TURNS,
  GAME_MODE_CATCHPHRASE,
  GAME_MODE_BLOCKBUSTERS,
  GAME_MODE_TEXAS_HOLDEM,
  MAX_PLAYERS,
  QUESTIONS_PER_GAME,
  REVEAL_MS,
  ROOM_CODE_LENGTH,
  hostQuestionShare,
  type QuestionCount,
} from "./constants";
import {
  catchphraseTickRoom,
  initCatchphraseOnCreate,
  isCatchphraseRoom,
  startCatchphraseGame,
} from "./catchphrase/logic";
import { toCatchphraseClientState } from "./catchphrase/client-state";
import {
  blockbustersTickRoom,
  initBlockbustersOnCreate,
  isBlockbustersRoom,
  startBlockbustersGame,
} from "./blockbusters/logic";
import { toBlockbustersClientState } from "./blockbusters/client-state";
import { toHoldemClientState } from "./holdem/client-state";
import { toMillionaireClientState } from "./millionaire/client-state";
import {
  dealNewHand,
  initHoldemOnCreate,
  isHoldemRoom,
  startHoldemGame,
} from "./holdem/logic";
import {
  initMillionaireOnCreate,
  isMillionaireRoom,
  millionaireSelectAnswer,
  millionaireTickRoom,
  startMillionaireGame,
} from "./millionaire/logic";
import { createInitialCatchphraseState } from "./catchphrase/types";
import { createInitialBlockbustersState } from "./blockbusters/types";
import { createInitialHoldemState } from "./holdem/types";
import {
  createInitialMillionaireState,
  createInitialParallelMillionaireState,
} from "./millionaire/types";
import { QUIZ_CATEGORY_CLOSEST, categoryTitle, type QuizCategoryId } from "./categories";
import { formatClosest, parseClosestGuess } from "./closest";
import type { QuizDifficulty } from "./difficulties";
import { difficultyTitle } from "./difficulties";
import {
  choiceFromSubmission,
  describeScoredAnswer,
  gradeAnswer,
  normalizeChoiceIndex,
  persistedPlayerAnswer,
} from "./answer-validation";
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
  questionCount: QuestionCount = QUESTIONS_PER_GAME,
): {
  questionOrder: number[];
  hostQuestionOrder: number[];
  guestQuestionOrder: number[];
} {
  const questionOrder = selectQuestionIdsForCategory(
    quizCategoryId,
    quizDifficulty,
    excludeBankIds,
    questionCount,
  );
  const hostShare = hostQuestionShare(questionCount);
  const hostQuestionOrder = shuffleInPlace(questionOrder.slice(0, hostShare));
  const guestQuestionOrder = shuffleInPlace(questionOrder.slice(hostShare, questionCount));
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
  questionCount: QuestionCount = QUESTIONS_PER_GAME,
): QuizRoom {
  const now = Date.now();
  return {
    code,
    hostId,
    gameMode,
    quizCategoryId,
    quizDifficulty,
    questionCount,
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
        : gameMode === GAME_MODE_PARALLEL_MILLIONAIRE
          ? createInitialParallelMillionaireState()
          : undefined,
    holdem: gameMode === GAME_MODE_TEXAS_HOLDEM ? createInitialHoldemState() : undefined,
    catchphrase: gameMode === GAME_MODE_CATCHPHRASE ? createInitialCatchphraseState() : undefined,
    blockbusters:
      gameMode === GAME_MODE_BLOCKBUSTERS ? createInitialBlockbustersState() : undefined,
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

function isClosestRoom(room: QuizRoom): boolean {
  return room.quizCategoryId === QUIZ_CATEGORY_CLOSEST;
}

function closestLogs(room: QuizRoom, questionIndex: number): AnswerLogEntry[] {
  return room.answerLog.filter(
    (e) => e.sessionId === room.sessionId && e.turnIndex === questionIndex,
  );
}

function hasLogForTogetherQuestion(room: QuizRoom, questionIndex: number): boolean {
  return room.answerLog.some(
    (e) =>
      e.sessionId === room.sessionId &&
      e.turnIndex === questionIndex &&
      isSharedQuizMode(room.gameMode),
  );
}

export function startGame(room: QuizRoom, playerId: string): QuizRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start");
  }
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }

  if (room.gameMode === GAME_MODE_TEXAS_HOLDEM) {
    if (room.players.length < MAX_PLAYERS) {
      throw new Error("Waiting for a second player");
    }
    return startHoldemGame(initHoldemOnCreate(room));
  }

  if (room.gameMode === GAME_MODE_CATCHPHRASE) {
    if (room.players.length < MAX_PLAYERS) {
      throw new Error("Waiting for a second player");
    }
    return startCatchphraseGame(initCatchphraseOnCreate(room));
  }

  if (room.gameMode === GAME_MODE_BLOCKBUSTERS) {
    if (room.players.length < MAX_PLAYERS) {
      throw new Error("Waiting for a second player");
    }
    let started = startBlockbustersGame(initBlockbustersOnCreate(room));
    started = reserveBankIdsForTopic(
      started,
      started.quizCategoryId,
      started.quizDifficulty,
      started.questionOrder,
      started.gameMode,
    );
    return started;
  }

  if (
    room.gameMode === GAME_MODE_SHARED_MILLIONAIRE ||
    room.gameMode === GAME_MODE_PARALLEL_MILLIONAIRE
  ) {
    if (room.gameMode === GAME_MODE_PARALLEL_MILLIONAIRE && room.players.length < MAX_PLAYERS) {
      throw new Error("Waiting for a second player");
    }
    if (room.gameMode === GAME_MODE_SHARED_MILLIONAIRE && room.players.length < 1) {
      throw new Error("Waiting for at least one player");
    }
    return startMillionaireGame(initMillionaireOnCreate(room));
  }

  const solo = room.gameMode === GAME_MODE_SINGLE;
  if (!solo && room.players.length < MAX_PLAYERS) {
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
    room.questionCount,
  );
  const guestId = guestPlayerId(room);
  if (!solo && !guestId) {
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
  questionCount: QuestionCount = room.questionCount,
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
    questionCount,
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
        : gameMode === GAME_MODE_PARALLEL_MILLIONAIRE
          ? createInitialParallelMillionaireState()
          : undefined,
    holdem: gameMode === GAME_MODE_TEXAS_HOLDEM ? createInitialHoldemState() : undefined,
    catchphrase: gameMode === GAME_MODE_CATCHPHRASE ? createInitialCatchphraseState() : undefined,
    blockbusters:
      gameMode === GAME_MODE_BLOCKBUSTERS ? createInitialBlockbustersState() : undefined,
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

function scoreClosestBatch(room: QuizRoom, questionIndex: number): QuizRoom {
  const bankId = room.questionOrder[questionIndex];
  if (bankId === undefined) throw new Error("No question");
  const question = getQuestionByBankId(bankId);
  const actual = question.estimate?.value;
  if (actual === undefined || question.estimate?.scoring !== "closest") {
    throw new Error("Not a closest-wins question");
  }
  const logs = closestLogs(room, questionIndex);
  const best = Math.min(...logs.map((e) => Math.abs(e.choiceIndex - actual)));
  const competitive = room.gameMode === GAME_MODE_TAKE_TURNS && room.players.length > 1;
  const window = question.estimate.tolerance;
  const winners = new Set(
    logs
      .filter((e) => {
        const distance = Math.abs(e.choiceIndex - actual);
        return distance === best && (competitive || distance <= window);
      })
      .map((e) => e.playerId),
  );
  const answerLog = room.answerLog.map((e) => {
    if (e.sessionId !== room.sessionId || e.turnIndex !== questionIndex) return e;
    return { ...e, correct: winners.has(e.playerId) };
  });
  let jointScore = room.jointScore;
  let players = room.players;
  if (competitive) {
    players = players.map((p) => (winners.has(p.id) ? { ...p, score: p.score + 1 } : p));
  } else if (winners.size > 0) {
    jointScore += 1;
    players = players.map((p) => ({ ...p, score: jointScore }));
  }
  return {
    ...room,
    players,
    jointScore,
    answerLog,
    phase: "reveal",
    revealStartedAt: Date.now(),
    turnIndex: questionIndex,
    updatedAt: Date.now(),
  };
}

function submitClosest(room: QuizRoom, playerId: string, choiceRaw: unknown): QuizRoom {
  if (room.phase !== "question") {
    throw new Error("Not accepting answers right now");
  }
  const you = room.players.find((p) => p.id === playerId);
  if (!you) throw new Error("Player not in room");
  if (you.answer !== null) return room;
  const bankId = room.questionOrder[room.questionIndex];
  if (bankId === undefined) throw new Error("No question");
  if (closestLogs(room, room.questionIndex).some((e) => e.playerId === playerId)) return room;

  const guess = parseClosestGuess(choiceRaw);
  const entry: AnswerLogEntry = {
    sessionId: room.sessionId,
    turnIndex: room.questionIndex,
    bankId,
    playerId,
    choiceIndex: guess,
    correct: false,
  };
  const next: QuizRoom = {
    ...room,
    players: room.players.map((p) => (p.id === playerId ? { ...p, answer: 0 } : p)),
    answerLog: [...room.answerLog, entry],
    updatedAt: Date.now(),
  };
  if (closestLogs(next, room.questionIndex).length < room.players.length) return next;
  return scoreClosestBatch(next, room.questionIndex);
}

function closestNote(
  room: QuizRoom,
  mine: AnswerLogEntry | undefined,
): string {
  const competitive = room.gameMode === GAME_MODE_TAKE_TURNS && room.players.length > 1;
  if (!mine) return "Waiting for every guess.";
  if (competitive) {
    const winners = closestLogs(room, room.questionIndex).filter((e) => e.correct).length;
    if (mine.correct && winners > 1) return "It's a tie. The closest guesses score.";
    if (mine.correct) return "You were closest.";
    return "The other guess was closer.";
  }
  return mine.correct ? "Within 10%." : "Further than 10%.";
}

function submitTakeTurns(room: QuizRoom, playerId: string, choiceRaw: unknown): QuizRoom {
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
  const graded = gradeAnswer(bankId, choiceFromSubmission(bankId, choiceRaw));
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
      answer: persistedPlayerAnswer(graded.question, graded.choiceIndex),
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

function submitPlayTogether(room: QuizRoom, playerId: string, choiceRaw: unknown): QuizRoom {
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
  const graded = gradeAnswer(bankId, choiceFromSubmission(bankId, choiceRaw));
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
    answer: p.id === room.hostId ? persistedPlayerAnswer(graded.question, graded.choiceIndex) : null,
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
  if (
    room.gameMode === GAME_MODE_SHARED_MILLIONAIRE ||
    room.gameMode === GAME_MODE_PARALLEL_MILLIONAIRE
  ) {
    return millionaireSelectAnswer(room, playerId, normalizeChoiceIndex(choiceIndexRaw));
  }
  if (isClosestRoom(room)) {
    return submitClosest(room, playerId, choiceIndexRaw);
  }
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    return submitTakeTurns(room, playerId, choiceIndexRaw);
  }
  return submitPlayTogether(room, playerId, choiceIndexRaw);
}

function advanceFromRevealTakeTurns(room: QuizRoom): QuizRoom {
  const nextTurn = room.turnIndex + 1;
  const clearedPlayers = room.players.map((p) => ({ ...p, answer: null }));

  if (nextTurn >= room.questionCount) {
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
  if (nextIndex >= room.questionCount) {
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

function advanceClosest(room: QuizRoom): QuizRoom {
  const nextIndex = room.questionIndex + 1;
  const clearedPlayers = room.players.map((p) => ({ ...p, answer: null }));
  if (nextIndex >= room.questionCount) {
    return {
      ...room,
      phase: "finished",
      questionIndex: nextIndex,
      turnIndex: nextIndex,
      activePlayerId: null,
      revealStartedAt: null,
      players: clearedPlayers,
      updatedAt: Date.now(),
    };
  }
  return {
    ...room,
    phase: "question",
    questionIndex: nextIndex,
    turnIndex: nextIndex,
    activePlayerId: null,
    revealStartedAt: null,
    players: clearedPlayers,
    updatedAt: Date.now(),
  };
}

function advanceFromReveal(room: QuizRoom): QuizRoom {
  if (isClosestRoom(room)) return advanceClosest(room);
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    return advanceFromRevealTakeTurns(room);
  }
  return advanceFromRevealPlayTogether(room);
}

export function tickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (isMillionaireRoom(room)) {
    return millionaireTickRoom(room, now);
  }
  if (isCatchphraseRoom(room)) {
    return catchphraseTickRoom(room, now);
  }
  if (isBlockbustersRoom(room)) {
    return blockbustersTickRoom(room, now);
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
    const labels = describeScoredAnswer(q, e.choiceIndex);
    const chosenLabel = q.estimate
      ? labels.chosenLabel
      : e.choiceIndex === null || e.choiceIndex === undefined
        ? null
        : labels.chosenLabel || null;
    return {
      turnIndex: e.turnIndex,
      bankId: e.bankId,
      playerId: e.playerId,
      playerName: nameById.get(e.playerId) ?? "Player",
      choiceIndex: e.choiceIndex,
      correctIndex: q.estimate ? 0 : q.correctIndex,
      correct: e.correct,
      prompt: q.prompt,
      options: q.estimate ? [] : q.options,
      chosenLabel,
      correctLabel: labels.correctLabel,
    };
  });
}

function currentBankId(room: QuizRoom): number | null {
  if (isClosestRoom(room)) {
    if (room.phase === "question" || room.phase === "reveal") {
      return room.questionOrder[room.questionIndex] ?? null;
    }
    return null;
  }
  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    if (room.turnIndex >= room.questionCount) return null;
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
  if (isSharedQuizMode(room.gameMode)) {
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
  if (isBlockbustersRoom(room)) {
    const you = room.players.find((p) => p.id === viewerId);
    if (!you || !room.blockbusters) {
      return {
        code: room.code,
        hostId: room.hostId,
        gameMode: room.gameMode,
        quizCategoryId: room.quizCategoryId,
        quizCategoryTitle: categoryTitle(room.quizCategoryId),
        quizDifficulty: room.quizDifficulty,
        quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
        phase: room.phase,
        questionIndex: 0,
        totalQuestions: 0,
        turnIndex: 0,
        activePlayerId: null,
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
        holdemView: null,
        catchphraseView: null,
        blockbustersView: null,
        error: "You are not in this room",
      };
    }
    return toBlockbustersClientState(room, viewerId);
  }

  if (isCatchphraseRoom(room)) {
    const you = room.players.find((p) => p.id === viewerId);
    if (!you || !room.catchphrase) {
      return {
        code: room.code,
        hostId: room.hostId,
        gameMode: room.gameMode,
        quizCategoryId: room.quizCategoryId,
        quizCategoryTitle: categoryTitle(room.quizCategoryId),
        quizDifficulty: room.quizDifficulty,
        quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
        phase: room.phase,
        questionIndex: 0,
        totalQuestions: 0,
        turnIndex: 0,
        activePlayerId: null,
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
        holdemView: null,
        catchphraseView: null,
        blockbustersView: null,
        error: "You are not in this room",
      };
    }
    return toCatchphraseClientState(room, viewerId);
  }

  if (isHoldemRoom(room)) {
    const you = room.players.find((p) => p.id === viewerId);
    if (!you || !room.holdem) {
      return {
        code: room.code,
        hostId: room.hostId,
        gameMode: room.gameMode,
        quizCategoryId: room.quizCategoryId,
        quizCategoryTitle: categoryTitle(room.quizCategoryId),
        quizDifficulty: room.quizDifficulty,
        quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
        phase: room.phase,
        questionIndex: 0,
        totalQuestions: 0,
        turnIndex: 0,
        activePlayerId: null,
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
        holdemView: null,
        catchphraseView: null,
        blockbustersView: null,
        error: "You are not in this room",
      };
    }
    return toHoldemClientState(room, viewerId);
  }

  if (isMillionaireRoom(room)) {
    const you = room.players.find((p) => p.id === viewerId);
    if (!you) {
      return {
        ...toMillionaireClientState(room, room.hostId),
        error: "You are not in this room",
        millionaireView: null,
        holdemView: null,
        catchphraseView: null,
        blockbustersView: null,
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
      totalQuestions: room.questionCount,
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
      holdemView: null,
      catchphraseView: null,
      blockbustersView: null,
      error: "You are not in this room",
    };
  }

  const scoresHidden = false;
  const jointScore =
    isSharedQuizMode(room.gameMode) ? room.jointScore : null;

  let question = null;
  let correctIndex: number | null = null;
  let answerFeedback: ClientRoomState["answerFeedback"] = null;
  const bankId = currentBankId(room);
  const revealEntry =
    room.phase === "reveal" ? revealLogEntryForCurrentStep(room) : null;

  let isYourTurn = false;
  let canSubmitAnswer = false;
  let statusMessage: string | null = null;

  if (isClosestRoom(room) && (room.phase === "question" || room.phase === "reveal")) {
    if (bankId !== null) {
      question = toPublicQuestion(getQuestionByBankId(bankId));
    }
    isYourTurn = room.phase === "question" && you.answer === null;
    canSubmitAnswer = isYourTurn;
    if (room.phase === "question" && you.answer !== null && room.players.length > 1) {
      statusMessage = "Answer submitted. Waiting for the other player.";
    }
  } else if (room.gameMode === GAME_MODE_TAKE_TURNS) {
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
    isSharedQuizMode(room.gameMode) &&
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

  if (room.phase === "reveal" && isClosestRoom(room)) {
    const revealedId = room.questionOrder[room.questionIndex];
    if (revealedId !== undefined) {
      const q = getQuestionByBankId(revealedId);
      const logs = closestLogs(room, room.questionIndex);
      const mine = logs.find((e) => e.playerId === viewerId) ?? logs[logs.length - 1];
      const actual = q.estimate?.value ?? 0;
      if (mine) {
        const labels = describeScoredAnswer(q, mine.choiceIndex);
        answerFeedback = {
          correct: mine.correct,
          choiceIndex: mine.choiceIndex,
          correctIndex: 0,
          chosenLabel: labels.chosenLabel,
          correctLabel: labels.correctLabel,
          distance: labels.distance,
          guesses: logs.map((e) => ({
            name: room.players.find((p) => p.id === e.playerId)?.name ?? "Player",
            label: formatClosest(e.choiceIndex),
            distance: Math.abs(e.choiceIndex - actual),
            closest: e.correct,
          })),
          note: closestNote(room, mine),
        };
      }
      correctIndex = null;
    }
  } else if (room.phase === "reveal" && revealEntry) {
    const q = getQuestionByBankId(revealEntry.bankId);
    const labels = describeScoredAnswer(q, revealEntry.choiceIndex);
    correctIndex = q.estimate ? null : q.correctIndex;
    answerFeedback = {
      correct: revealEntry.correct,
      choiceIndex: revealEntry.choiceIndex,
      correctIndex: q.estimate ? 0 : q.correctIndex,
      chosenLabel: labels.chosenLabel,
      correctLabel: labels.correctLabel,
      distance: labels.distance,
    };
  }

  const revealEndsAt =
    room.phase === "reveal" && room.revealStartedAt
      ? room.revealStartedAt + REVEAL_MS
      : null;

  const displayScore = (p: QuizPlayer) => {
    if (scoresHidden) return 0;
    if (isSharedQuizMode(room.gameMode)) return room.jointScore;
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
    totalQuestions: room.questionCount,
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
        room.phase === "reveal" && isClosestRoom(room)
          ? closestLogs(room, room.questionIndex).find((e) => e.playerId === p.id)?.correct ?? null
          : room.phase === "reveal" && revealEntry && p.id === revealEntry.playerId
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
    holdemView: null,
    catchphraseView: null,
    blockbustersView: null,
  };
}

/** @deprecated use allocateQuestionsForGame in tests */
export function shuffleQuestionOrder(
  quizCategoryId: QuizCategoryId,
  quizDifficulty: QuizDifficulty,
): number[] {
  return allocateQuestionsForGame(quizCategoryId, quizDifficulty).questionOrder;
}
