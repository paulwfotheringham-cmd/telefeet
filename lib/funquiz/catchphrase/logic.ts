import { GAME_MODE_CATCHPHRASE, MAX_PLAYERS } from "../constants";
import type { QuizRoom } from "../types";
import {
  CATCHPHRASE_PUZZLES,
  getCatchphrasePuzzle,
  guessMatchesPuzzle,
} from "./puzzles";
import {
  CATCHPHRASE_ANSWER_REVEAL_MS,
  CATCHPHRASE_ROUNDS,
  CATCHPHRASE_TILE_REVEAL_MS,
  createInitialCatchphraseState,
  type CatchphraseState,
} from "./types";

export type CatchphraseAction = "buzz" | "guess" | "pass";

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isCatchphraseRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_CATCHPHRASE;
}

function tileCount(state: CatchphraseState): number {
  return state.gridCols * state.gridRows;
}

function allTiles(state: CatchphraseState): number[] {
  return Array.from({ length: tileCount(state) }, (_, i) => i);
}

function currentPuzzleId(room: QuizRoom): string | null {
  const cp = room.catchphrase;
  if (!cp || cp.roundIndex >= cp.puzzleOrder.length) return null;
  return cp.puzzleOrder[cp.roundIndex] ?? null;
}

function startRound(room: QuizRoom): QuizRoom {
  const cp = room.catchphrase!;
  const hidden = allTiles(cp);
  shuffleInPlace(hidden);
  return {
    ...room,
    phase: "question",
    revealStartedAt: null,
    catchphrase: {
      ...cp,
      hiddenTiles: hidden,
      buzzPlayerId: null,
      lastGuess: null,
      lastAnswer: null,
      statusMessage: "Say what you see! Squares reveal automatically — buzz in to guess.",
      lastTileRevealAt: Date.now(),
    },
    players: room.players.map((p) => ({ ...p, answer: null })),
    updatedAt: Date.now(),
  };
}

export function initCatchphraseOnCreate(room: QuizRoom): QuizRoom {
  return {
    ...room,
    catchphrase: createInitialCatchphraseState(),
  };
}

export function startCatchphraseGame(room: QuizRoom): QuizRoom {
  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  const order = shuffleInPlace(CATCHPHRASE_PUZZLES.map((p) => p.id)).slice(
    0,
    CATCHPHRASE_ROUNDS,
  );

  const withState: QuizRoom = {
    ...room,
    phase: "question",
    questionIndex: 0,
    catchphrase: {
      ...createInitialCatchphraseState(),
      puzzleOrder: order,
      roundIndex: 0,
    },
    players: room.players.map((p) => ({ ...p, score: 0, answer: null })),
    updatedAt: Date.now(),
  };
  return startRound(withState);
}

function revealRandomTile(state: CatchphraseState): CatchphraseState {
  if (state.hiddenTiles.length === 0) return state;
  const idx = Math.floor(Math.random() * state.hiddenTiles.length);
  const tile = state.hiddenTiles[idx]!;
  const hiddenTiles = state.hiddenTiles.filter((_, i) => i !== idx);
  return { ...state, hiddenTiles, lastTileRevealAt: Date.now() };
}

export function catchphraseTickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (!isCatchphraseRoom(room) || !room.catchphrase) return room;

  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= CATCHPHRASE_ANSWER_REVEAL_MS) {
      return advanceCatchphraseRound(room);
    }
    return room;
  }

  if (room.phase !== "question" || room.catchphrase.buzzPlayerId) {
    return room;
  }

  const cp = room.catchphrase;
  if (cp.hiddenTiles.length === 0) {
    return room;
  }
  if (now - cp.lastTileRevealAt < CATCHPHRASE_TILE_REVEAL_MS) {
    return room;
  }

  return {
    ...room,
    catchphrase: revealRandomTile(cp),
    updatedAt: now,
  };
}

function awardPoint(room: QuizRoom, playerId: string, delta: number): QuizRoom {
  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId ? { ...p, score: p.score + delta } : p,
    ),
    updatedAt: Date.now(),
  };
}

function finishReveal(room: QuizRoom, answer: string, message: string): QuizRoom {
  return {
    ...room,
    phase: "reveal",
    revealStartedAt: Date.now(),
    catchphrase: {
      ...room.catchphrase!,
      buzzPlayerId: null,
      lastAnswer: answer,
      statusMessage: message,
    },
    updatedAt: Date.now(),
  };
}

function advanceCatchphraseRound(room: QuizRoom): QuizRoom {
  const cp = room.catchphrase!;
  const nextRound = cp.roundIndex + 1;
  if (nextRound >= cp.puzzleOrder.length) {
    return {
      ...room,
      phase: "finished",
      revealStartedAt: null,
      catchphrase: {
        ...cp,
        statusMessage: "Game over — highest score wins!",
      },
      updatedAt: Date.now(),
    };
  }
  const next: QuizRoom = {
    ...room,
    questionIndex: nextRound,
    catchphrase: { ...cp, roundIndex: nextRound },
  };
  return startRound(next);
}

export function catchphraseApplyAction(
  room: QuizRoom,
  playerId: string,
  action: CatchphraseAction,
  guess?: string,
): QuizRoom {
  if (!isCatchphraseRoom(room) || !room.catchphrase) {
    throw new Error("Not a Catchphrase room");
  }
  if (room.phase !== "question") {
    throw new Error("Wait for the next round");
  }
  if (!room.players.some((p) => p.id === playerId)) {
    throw new Error("You are not in this room");
  }

  const puzzleId = currentPuzzleId(room);
  if (!puzzleId) throw new Error("No puzzle active");

  const cp = room.catchphrase;
  const puzzle = getCatchphrasePuzzle(puzzleId);
  const buzzerName = room.players.find((p) => p.id === playerId)?.name ?? "Player";

  if (action === "buzz") {
    if (cp.buzzPlayerId) {
      throw new Error("Someone already buzzed in");
    }
    return {
      ...room,
      activePlayerId: playerId,
      catchphrase: {
        ...cp,
        buzzPlayerId: playerId,
        statusMessage: `${buzzerName} buzzed in — type the catchphrase!`,
      },
      updatedAt: Date.now(),
    };
  }

  if (action === "pass") {
    if (cp.buzzPlayerId !== playerId) {
      throw new Error("Only the player who buzzed can pass");
    }
    return {
      ...room,
      activePlayerId: null,
      catchphrase: {
        ...cp,
        buzzPlayerId: null,
        statusMessage: `${buzzerName} passed — squares keep revealing.`,
        lastGuess: { playerId, text: "(pass)", correct: false },
      },
      updatedAt: Date.now(),
    };
  }

  if (action === "guess") {
    if (cp.buzzPlayerId !== playerId) {
      throw new Error("Buzz in first to guess");
    }
    const text = guess?.trim() ?? "";
    if (!text) throw new Error("Enter your guess");

    const correct = guessMatchesPuzzle(puzzle, text);
    const lastGuess = { playerId, text, correct };

    if (correct) {
      const scored = awardPoint(room, playerId, 2);
      return finishReveal(
        scored,
        puzzle.answer,
        `Correct! ${buzzerName} — "${puzzle.answer}" (+2)`,
      );
    }

    return {
      ...room,
      activePlayerId: null,
      catchphrase: {
        ...cp,
        buzzPlayerId: null,
        lastGuess,
        statusMessage: `Not quite — "${text}". Keep watching and buzz again!`,
      },
      updatedAt: Date.now(),
    };
  }

  throw new Error("Unknown action");
}
