import { MAX_PLAYERS, REVEAL_MS, ROOM_CODE_LENGTH } from "./constants";
import { getQuestionByBankId, QUIZ_QUESTION_COUNT, toPublicQuestion } from "./questions";
import type { ClientRoomState, QuizPlayer, QuizRoom } from "./types";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function shuffleQuestionOrder(): number[] {
  const order = Array.from({ length: QUIZ_QUESTION_COUNT }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function createRoom(hostId: string, hostName: string, code: string): QuizRoom {
  const now = Date.now();
  return {
    code,
    hostId,
    phase: "lobby",
    questionIndex: 0,
    questionOrder: shuffleQuestionOrder(),
    players: [{ id: hostId, name: hostName.trim().slice(0, 24), score: 0, answer: null }],
    revealStartedAt: null,
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

export function startGame(room: QuizRoom, playerId: string): QuizRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start");
  }
  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }
  return {
    ...room,
    phase: "question",
    questionIndex: 0,
    revealStartedAt: null,
    players: room.players.map((p) => ({ ...p, answer: null })),
    updatedAt: Date.now(),
  };
}

function allAnswered(players: QuizPlayer[]): boolean {
  return players.every((p) => p.answer !== null);
}

function scoreCurrentQuestion(room: QuizRoom): QuizPlayer[] {
  const bankId = room.questionOrder[room.questionIndex];
  const q = getQuestionByBankId(bankId);
  return room.players.map((p) => {
    if (p.answer === q.correctIndex) {
      return { ...p, score: p.score + 1 };
    }
    return p;
  });
}

function advanceFromReveal(room: QuizRoom): QuizRoom {
  const nextIndex = room.questionIndex + 1;
  if (nextIndex >= QUIZ_QUESTION_COUNT) {
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

export function tickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= REVEAL_MS) {
      return advanceFromReveal(room);
    }
  }
  return room;
}

export function submitAnswer(
  room: QuizRoom,
  playerId: string,
  choiceIndex: number,
): QuizRoom {
  if (room.phase !== "question") {
    throw new Error("Not accepting answers right now");
  }
  if (choiceIndex < 0 || choiceIndex > 2) {
    throw new Error("Invalid answer");
  }
  const players = room.players.map((p) =>
    p.id === playerId ? { ...p, answer: choiceIndex } : p,
  );
  if (!players.some((p) => p.id === playerId)) {
    throw new Error("Player not in room");
  }
  let next: QuizRoom = { ...room, players, updatedAt: Date.now() };
  if (allAnswered(players)) {
    const scored = scoreCurrentQuestion(next);
    next = {
      ...next,
      players: scored,
      phase: "reveal",
      revealStartedAt: Date.now(),
    };
  }
  return next;
}

function computeWinners(players: QuizPlayer[]): string[] {
  const max = Math.max(...players.map((p) => p.score));
  const winners = players.filter((p) => p.score === max).map((p) => p.id);
  return winners;
}

export function toClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  const you = room.players.find((p) => p.id === viewerId);
  if (!you) {
    return {
      code: room.code,
      hostId: room.hostId,
      phase: room.phase,
      questionIndex: room.questionIndex,
      totalQuestions: QUIZ_QUESTION_COUNT,
      players: [],
      question: null,
      correctIndex: null,
      revealEndsAt: null,
      winnerIds: [],
      you: { id: viewerId, name: "", score: 0, answer: null },
      error: "You are not in this room",
    };
  }

  let question = null;
  let correctIndex: number | null = null;
  let revealCorrect: number | null = null;
  if (room.phase === "question" || room.phase === "reveal") {
    const bankId = room.questionOrder[room.questionIndex];
    const q = getQuestionByBankId(bankId);
    question = toPublicQuestion(q);
    if (room.phase === "reveal") {
      correctIndex = q.correctIndex;
      revealCorrect = q.correctIndex;
    }
  }

  const revealEndsAt =
    room.phase === "reveal" && room.revealStartedAt
      ? room.revealStartedAt + REVEAL_MS
      : null;

  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    questionIndex: room.questionIndex,
    totalQuestions: QUIZ_QUESTION_COUNT,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      hasAnswered: p.answer !== null,
      answerIndex: room.phase === "reveal" ? p.answer : null,
      wasCorrect:
        room.phase === "reveal" && p.answer !== null && revealCorrect !== null
          ? p.answer === revealCorrect
          : null,
    })),
    question,
    correctIndex,
    revealEndsAt,
    winnerIds: room.phase === "finished" ? computeWinners(room.players) : [],
    you: {
      id: you.id,
      name: you.name,
      score: you.score,
      answer: you.answer,
    },
  };
}
