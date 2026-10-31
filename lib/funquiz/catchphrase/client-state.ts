import type { ClientRoomState, QuizRoom } from "../types";
import { categoryTitle } from "../categories";
import { difficultyTitle } from "../difficulties";
import { getCatchphrasePuzzle } from "./puzzles";
import { CATCHPHRASE_ANSWER_REVEAL_MS, CATCHPHRASE_ROUNDS } from "./types";
import { isCatchphraseRoom } from "./logic";

export type CatchphraseClientView = {
  roundNumber: number;
  totalRounds: number;
  sceneKey: string;
  hiddenTileIndices: number[];
  gridCols: number;
  gridRows: number;
  buzzPlayerId: string | null;
  buzzPlayerName: string | null;
  canBuzz: boolean;
  canGuess: boolean;
  canPass: boolean;
  revealedAnswer: string | null;
  lastGuessText: string | null;
  lastGuessCorrect: boolean | null;
  statusMessage: string | null;
  revealEndsAt: number | null;
};

export function toCatchphraseClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  const you = room.players.find((p) => p.id === viewerId)!;
  const cp = room.catchphrase!;
  const puzzleId = cp.puzzleOrder[cp.roundIndex];
  const puzzle = puzzleId ? getCatchphrasePuzzle(puzzleId) : null;
  const buzzPlayerName =
    cp.buzzPlayerId === null
      ? null
      : (room.players.find((p) => p.id === cp.buzzPlayerId)?.name ?? "Player");

  const inQuestion = room.phase === "question";
  const canBuzz = inQuestion && cp.buzzPlayerId === null;
  const canGuess = inQuestion && cp.buzzPlayerId === viewerId;
  const canPass = canGuess;

  const revealEndsAt =
    room.phase === "reveal" && room.revealStartedAt
      ? room.revealStartedAt + CATCHPHRASE_ANSWER_REVEAL_MS
      : null;

  const catchphraseView: CatchphraseClientView = {
    roundNumber: cp.roundIndex + 1,
    totalRounds: CATCHPHRASE_ROUNDS,
    sceneKey: puzzle?.sceneKey ?? "unknown",
    hiddenTileIndices: [...cp.hiddenTiles],
    gridCols: cp.gridCols,
    gridRows: cp.gridRows,
    buzzPlayerId: cp.buzzPlayerId,
    buzzPlayerName,
    canBuzz,
    canGuess,
    canPass,
    revealedAnswer: room.phase === "reveal" ? cp.lastAnswer : null,
    lastGuessText: cp.lastGuess?.text ?? null,
    lastGuessCorrect: cp.lastGuess?.correct ?? null,
    statusMessage: cp.statusMessage,
    revealEndsAt,
  };

  const winnerIds =
    room.phase === "finished"
      ? (() => {
          const max = Math.max(...room.players.map((p) => p.score));
          return room.players.filter((p) => p.score === max).map((p) => p.id);
        })()
      : [];

  return {
    code: room.code,
    hostId: room.hostId,
    gameMode: room.gameMode,
    quizCategoryId: room.quizCategoryId,
    quizCategoryTitle: categoryTitle(room.quizCategoryId),
    quizDifficulty: room.quizDifficulty,
    quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
    phase: room.phase,
    questionIndex: cp.roundIndex,
    totalQuestions: CATCHPHRASE_ROUNDS,
    turnIndex: cp.roundIndex,
    activePlayerId: cp.buzzPlayerId,
    isYourTurn: cp.buzzPlayerId === viewerId,
    canSubmitAnswer: false,
    statusMessage: cp.statusMessage,
    scoresHidden: false,
    jointScore: null,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      hasAnswered: false,
      answerIndex: null,
      wasCorrect: null,
    })),
    question: null,
    correctIndex: null,
    answerFeedback: null,
    revealEndsAt,
    winnerIds,
    you: { id: you.id, name: you.name, score: you.score, answer: null },
    results: null,
    scorecard: null,
    millionaireView: null,
    holdemView: null,
    catchphraseView,
    blockbustersView: null,
  };
}

export function catchphraseClientStateOrNull(
  room: QuizRoom,
  viewerId: string,
): ClientRoomState | null {
  if (!isCatchphraseRoom(room) || !room.catchphrase) return null;
  if (!room.players.some((p) => p.id === viewerId)) return null;
  return toCatchphraseClientState(room, viewerId);
}
