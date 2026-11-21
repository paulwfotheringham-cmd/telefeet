import { questionsForDifficulty, selectGameQuestions } from "./game";
import {
  QUESTIONS_PER_GAME,
  difficultyTitle,
  type MovieDifficulty,
  type PresentedQuestion,
} from "./types";

export const MAX_PLAYERS = 2;
export const QUESTIONS_PER_PLAYER = QUESTIONS_PER_GAME;
export const TURNS_PER_MATCH = QUESTIONS_PER_PLAYER * MAX_PLAYERS;
export const REVEAL_MS = 4500;
export const ROOM_TTL_MS = 4 * 60 * 60 * 1000;

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type MoviePhase = "lobby" | "question" | "reveal" | "finished";

export type MoviePlayer = {
  id: string;
  name: string;
  score: number;
};

export type MovieAnswer = {
  turnIndex: number;
  playerId: string;
  questionId: string;
  choiceIndex: number;
  correct: boolean;
};

export type MovieRoom = {
  code: string;
  hostId: string;
  difficulty: MovieDifficulty;
  phase: MoviePhase;
  turnIndex: number;
  activePlayerId: string | null;
  questions: PresentedQuestion[];
  answers: MovieAnswer[];
  seenIds: string[];
  revealStartedAt: number | null;
  revision: number;
  players: MoviePlayer[];
  createdAt: number;
  updatedAt: number;
  dbUpdatedAtIso?: string;
};

export type MovieResultRow = {
  turnIndex: number;
  playerId: string;
  playerName: string;
  quote: string;
  chosenLabel: string;
  correctLabel: string;
  correct: boolean;
};

export type MovieClientState = {
  code: string;
  hostId: string;
  difficulty: MovieDifficulty;
  difficultyTitle: string;
  phase: MoviePhase;
  turnIndex: number;
  totalTurns: number;
  questionsPerPlayer: number;
  activePlayerId: string | null;
  isYourTurn: boolean;
  canSubmitAnswer: boolean;
  statusMessage: string | null;
  revision: number;
  players: Array<{ id: string; name: string; score: number }>;
  you: { id: string; name: string; score: number };
  question: { quote: string; options: string[] } | null;
  feedback: {
    correct: boolean;
    choiceIndex: number;
    correctIndex: number;
    chosenLabel: string;
    correctLabel: string;
    playerName: string;
  } | null;
  revealEndsAt: number | null;
  winnerIds: string[];
  results: MovieResultRow[] | null;
  error?: string;
};

export function generateMovieRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function cleanPlayerName(name: string): string {
  const trimmed = name.trim().slice(0, 24);
  if (!trimmed) {
    throw new Error("Enter your name first.");
  }
  return trimmed;
}

function touch(room: MovieRoom, patch: Partial<MovieRoom>, now: number): MovieRoom {
  return {
    ...room,
    ...patch,
    revision: room.revision + 1,
    updatedAt: now,
  };
}

export function createMovieRoom(
  playerId: string,
  playerName: string,
  code: string,
  difficulty: MovieDifficulty,
  now = Date.now(),
): MovieRoom {
  return {
    code,
    hostId: playerId,
    difficulty,
    phase: "lobby",
    turnIndex: 0,
    activePlayerId: null,
    questions: [],
    answers: [],
    seenIds: [],
    revealStartedAt: null,
    revision: 1,
    players: [{ id: playerId, name: cleanPlayerName(playerName), score: 0 }],
    createdAt: now,
    updatedAt: now,
  };
}

export function addMoviePlayer(room: MovieRoom, playerId: string, playerName: string): MovieRoom {
  if (room.players.some((player) => player.id === playerId)) {
    return room;
  }
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }
  if (room.players.length >= MAX_PLAYERS) {
    throw new Error("Room is full");
  }
  return touch(
    room,
    {
      players: [
        ...room.players,
        { id: playerId, name: cleanPlayerName(playerName), score: 0 },
      ],
    },
    Date.now(),
  );
}

function guestId(room: MovieRoom): string {
  const guest = room.players.find((player) => player.id !== room.hostId);
  if (!guest) {
    throw new Error("Waiting for a second player");
  }
  return guest.id;
}

export function playerForTurn(room: MovieRoom, turnIndex: number): string {
  return turnIndex % 2 === 0 ? room.hostId : guestId(room);
}

export function dealMatchQuestions(
  difficulty: MovieDifficulty,
  seenIds: readonly string[],
  rng: () => number = Math.random,
): { questions: PresentedQuestion[]; seenIds: string[] } {
  const all = questionsForDifficulty(difficulty);
  const fresh = all.filter((question) => !seenIds.includes(question.id));
  const recycling = fresh.length < TURNS_PER_MATCH;
  const pool = recycling ? all : fresh;
  const questions = selectGameQuestions(difficulty, TURNS_PER_MATCH, rng, pool);
  const dealtIds = questions.map((question) => question.id);
  return {
    questions,
    seenIds: recycling ? dealtIds : [...seenIds, ...dealtIds],
  };
}

export function startMovieGame(
  room: MovieRoom,
  playerId: string,
  rng: () => number = Math.random,
  now = Date.now(),
): MovieRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start");
  }
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }
  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  const dealt = dealMatchQuestions(room.difficulty, room.seenIds, rng);
  return touch(
    room,
    {
      phase: "question",
      turnIndex: 0,
      activePlayerId: room.hostId,
      questions: dealt.questions,
      answers: [],
      seenIds: dealt.seenIds,
      revealStartedAt: null,
      players: room.players.map((player) => ({ ...player, score: 0 })),
    },
    now,
  );
}

export function submitMovieAnswer(
  room: MovieRoom,
  playerId: string,
  choiceIndexRaw: unknown,
  now = Date.now(),
): MovieRoom {
  if (room.phase !== "question") {
    throw new Error("Not accepting answers right now");
  }
  if (playerId !== room.activePlayerId) {
    throw new Error("It is not your turn");
  }
  if (room.answers.some((answer) => answer.turnIndex === room.turnIndex)) {
    return room;
  }
  if (!Number.isInteger(choiceIndexRaw)) {
    throw new Error("Choose one of the four films");
  }
  const choiceIndex = choiceIndexRaw as number;
  const question = room.questions[room.turnIndex];
  if (!question || choiceIndex < 0 || choiceIndex >= question.options.length) {
    throw new Error("Choose one of the four films");
  }
  const correct = choiceIndex === question.correctIndex;
  return touch(
    room,
    {
      phase: "reveal",
      revealStartedAt: now,
      answers: [
        ...room.answers,
        {
          turnIndex: room.turnIndex,
          playerId,
          questionId: question.id,
          choiceIndex,
          correct,
        },
      ],
      players: room.players.map((player) =>
        player.id === playerId && correct ? { ...player, score: player.score + 1 } : player,
      ),
    },
    now,
  );
}

function advanceFromReveal(room: MovieRoom, now: number): MovieRoom {
  const nextTurn = room.turnIndex + 1;
  if (nextTurn >= TURNS_PER_MATCH) {
    return touch(
      room,
      {
        phase: "finished",
        turnIndex: nextTurn,
        activePlayerId: null,
        revealStartedAt: null,
      },
      now,
    );
  }
  return touch(
    room,
    {
      phase: "question",
      turnIndex: nextTurn,
      activePlayerId: playerForTurn(room, nextTurn),
      revealStartedAt: null,
    },
    now,
  );
}

export function tickMovieRoom(room: MovieRoom, now = Date.now()): MovieRoom {
  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= REVEAL_MS) {
      return advanceFromReveal(room, now);
    }
  }
  return room;
}

export function resetMovieRoomToLobby(room: MovieRoom, playerId: string, now = Date.now()): MovieRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start a new game");
  }
  if (room.phase !== "finished") {
    throw new Error("Finish the current game before starting a new one");
  }
  return touch(
    room,
    {
      phase: "lobby",
      turnIndex: 0,
      activePlayerId: null,
      questions: [],
      answers: [],
      revealStartedAt: null,
      players: room.players.map((player) => ({ ...player, score: 0 })),
    },
    now,
  );
}

function winnerIds(players: MoviePlayer[]): string[] {
  const best = Math.max(...players.map((player) => player.score));
  return players.filter((player) => player.score === best).map((player) => player.id);
}

function buildResults(room: MovieRoom): MovieResultRow[] {
  const names = new Map(room.players.map((player) => [player.id, player.name]));
  return [...room.answers]
    .sort((a, b) => a.turnIndex - b.turnIndex)
    .map((answer) => {
      const question = room.questions[answer.turnIndex];
      return {
        turnIndex: answer.turnIndex,
        playerId: answer.playerId,
        playerName: names.get(answer.playerId) ?? "Player",
        quote: question?.quote ?? "",
        chosenLabel: question?.options[answer.choiceIndex] ?? "",
        correctLabel: question?.film ?? "",
        correct: answer.correct,
      };
    });
}

export function toMovieClientState(room: MovieRoom, viewerId: string): MovieClientState {
  const you = room.players.find((player) => player.id === viewerId);
  if (!you) {
    return {
      code: room.code,
      hostId: room.hostId,
      difficulty: room.difficulty,
      difficultyTitle: difficultyTitle(room.difficulty),
      phase: room.phase,
      turnIndex: room.turnIndex,
      totalTurns: TURNS_PER_MATCH,
      questionsPerPlayer: QUESTIONS_PER_PLAYER,
      activePlayerId: room.activePlayerId,
      isYourTurn: false,
      canSubmitAnswer: false,
      statusMessage: null,
      revision: room.revision,
      players: [],
      you: { id: viewerId, name: "", score: 0 },
      question: null,
      feedback: null,
      revealEndsAt: null,
      winnerIds: [],
      results: null,
      error: "You are not in this room",
    };
  }

  const current =
    room.phase === "question" || room.phase === "reveal"
      ? room.questions[Math.min(room.turnIndex, room.questions.length - 1)]
      : undefined;
  const revealAnswer =
    room.phase === "reveal"
      ? room.answers.find((answer) => answer.turnIndex === room.turnIndex)
      : undefined;
  const active = room.players.find((player) => player.id === room.activePlayerId);
  const isYourTurn = room.phase === "question" && viewerId === room.activePlayerId;
  let statusMessage: string | null = null;
  if (room.phase === "question" && !isYourTurn && active) {
    statusMessage = `It's ${active.name}'s turn — watch along!`;
  }
  if (room.phase === "reveal" && revealAnswer) {
    const answerer = room.players.find((player) => player.id === revealAnswer.playerId);
    if (answerer && answerer.id !== viewerId) {
      statusMessage = revealAnswer.correct
        ? `${answerer.name} got it.`
        : `${answerer.name} missed it.`;
    }
  }

  return {
    code: room.code,
    hostId: room.hostId,
    difficulty: room.difficulty,
    difficultyTitle: difficultyTitle(room.difficulty),
    phase: room.phase,
    turnIndex: room.turnIndex,
    totalTurns: TURNS_PER_MATCH,
    questionsPerPlayer: QUESTIONS_PER_PLAYER,
    activePlayerId: room.activePlayerId,
    isYourTurn,
    canSubmitAnswer: isYourTurn,
    statusMessage,
    revision: room.revision,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
    })),
    you: { id: you.id, name: you.name, score: you.score },
    question: current
      ? { quote: current.quote, options: [...current.options] }
      : null,
    feedback:
      current && revealAnswer
        ? {
            correct: revealAnswer.correct,
            choiceIndex: revealAnswer.choiceIndex,
            correctIndex: current.correctIndex,
            chosenLabel: current.options[revealAnswer.choiceIndex] ?? "",
            correctLabel: current.film,
            playerName:
              room.players.find((player) => player.id === revealAnswer.playerId)?.name ?? "Player",
          }
        : null,
    revealEndsAt:
      room.phase === "reveal" && room.revealStartedAt !== null
        ? room.revealStartedAt + REVEAL_MS
        : null,
    winnerIds: room.phase === "finished" ? winnerIds(room.players) : [],
    results: room.phase === "finished" ? buildResults(room) : null,
  };
}
