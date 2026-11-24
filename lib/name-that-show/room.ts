import { plannedShowLength, questionsForEra, selectGameQuestions } from "./game";
import {
  SHOW_MODE_PLAY_TOGETHER,
  SHOW_MODE_SINGLE,
  sharesShowRound,
  SHOW_MODE_TAKE_TURNS,
  showEraTitle,
  showModeTitle,
  type PresentedShow,
  type ShowEra,
  type ShowPlayMode,
} from "./types";

export const MAX_PLAYERS = 2;
export const REVEAL_MS = 4500;
export const ROOM_TTL_MS = 4 * 60 * 60 * 1000;

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type ShowPhase = "lobby" | "question" | "reveal" | "finished";

export type ShowPlayer = {
  id: string;
  name: string;
  score: number;
};

export type ShowAnswer = {
  turnIndex: number;
  playerId: string;
  questionId: string;
  choiceIndex: number;
  correct: boolean;
};

export type ShowRoom = {
  code: string;
  hostId: string;
  era: ShowEra;
  mode?: ShowPlayMode;
  jointScore?: number;
  phase: ShowPhase;
  turnIndex: number;
  activePlayerId: string | null;
  questions: PresentedShow[];
  answers: ShowAnswer[];
  seenIds: string[];
  revealStartedAt: number | null;
  revision: number;
  players: ShowPlayer[];
  createdAt: number;
  updatedAt: number;
  dbUpdatedAtIso?: string;
};

export type ShowResultRow = {
  turnIndex: number;
  playerId: string;
  playerName: string;
  songTitle: string;
  chosenLabel: string;
  correctLabel: string;
  correct: boolean;
};

export type ShowClientState = {
  code: string;
  hostId: string;
  era: ShowEra;
  eraTitle: string;
  mode: ShowPlayMode;
  modeTitle: string;
  jointScore: number | null;
  phase: ShowPhase;
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
  question: { year: number; options: string[] } | null;
  feedback: {
    correct: boolean;
    choiceIndex: number;
    correctIndex: number;
    chosenLabel: string;
    correctLabel: string;
    songTitle: string;
    playerName: string;
  } | null;
  revealEndsAt: number | null;
  winnerIds: string[];
  results: ShowResultRow[] | null;
  error?: string;
};

export function generateShowRoomCode(): string {
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

function touch(room: ShowRoom, patch: Partial<ShowRoom>, now: number): ShowRoom {
  return {
    ...room,
    ...patch,
    revision: room.revision + 1,
    updatedAt: now,
  };
}

export function roomMode(room: Pick<ShowRoom, "mode">): ShowPlayMode {
  if (room.mode === SHOW_MODE_PLAY_TOGETHER || room.mode === SHOW_MODE_SINGLE) return room.mode;
  return SHOW_MODE_TAKE_TURNS;
}

export function matchLength(room: Pick<ShowRoom, "mode" | "era">): number {
  return plannedShowLength(room.era, roomMode(room));
}

export function createShowRoom(
  playerId: string,
  playerName: string,
  code: string,
  era: ShowEra,
  mode: ShowPlayMode = SHOW_MODE_TAKE_TURNS,
  now = Date.now(),
): ShowRoom {
  return {
    code,
    hostId: playerId,
    era,
    mode,
    jointScore: 0,
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

export function addShowPlayer(room: ShowRoom, playerId: string, playerName: string): ShowRoom {
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
      players: [...room.players, { id: playerId, name: cleanPlayerName(playerName), score: 0 }],
    },
    Date.now(),
  );
}

function guestId(room: ShowRoom): string {
  const guest = room.players.find((player) => player.id !== room.hostId);
  if (!guest) {
    throw new Error("Waiting for a second player");
  }
  return guest.id;
}

export function playerForTurn(room: ShowRoom, turnIndex: number): string {
  return turnIndex % 2 === 0 ? room.hostId : guestId(room);
}

export function dealMatchQuestions(
  era: ShowEra,
  seenIds: readonly string[],
  rng: () => number = Math.random,
  count: number,
): { questions: PresentedShow[]; seenIds: string[] } {
  const all = questionsForEra(era);
  const fresh = all.filter((question) => !seenIds.includes(question.id));
  const recycling = fresh.length < count;
  const pool = recycling ? all : fresh;
  const questions = selectGameQuestions(era, count, rng, pool);
  const dealtIds = questions.map((question) => question.id);
  return {
    questions,
    seenIds: recycling ? dealtIds : [...seenIds, ...dealtIds],
  };
}

export function startShowGame(
  room: ShowRoom,
  playerId: string,
  rng: () => number = Math.random,
  now = Date.now(),
): ShowRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start");
  }
  if (room.phase !== "lobby") {
    throw new Error("Game already started");
  }
  if (room.mode !== "single" && room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  const dealt = dealMatchQuestions(room.era, room.seenIds, rng, matchLength(room));
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
      jointScore: 0,
      players: room.players.map((player) => ({ ...player, score: 0 })),
    },
    now,
  );
}

export function submitShowAnswer(
  room: ShowRoom,
  playerId: string,
  choiceIndexRaw: unknown,
  now = Date.now(),
): ShowRoom {
  if (room.phase !== "question") {
    throw new Error("Not accepting answers right now");
  }
  const together = sharesShowRound(roomMode(room));
  if (together && playerId !== room.hostId) {
    throw new Error("Only the room creator can submit answers in Play together");
  }
  if (!together && playerId !== room.activePlayerId) {
    throw new Error("It is not your turn");
  }
  if (room.answers.some((answer) => answer.turnIndex === room.turnIndex)) {
    return room;
  }
  if (!Number.isInteger(choiceIndexRaw)) {
    throw new Error("Choose one of the four shows");
  }
  const choiceIndex = choiceIndexRaw as number;
  const question = room.questions[room.turnIndex];
  if (!question || choiceIndex < 0 || choiceIndex >= question.options.length) {
    throw new Error("Choose one of the four shows");
  }
  const correct = choiceIndex === question.correctIndex;
  const jointScore = (room.jointScore ?? 0) + (together && correct ? 1 : 0);
  return touch(
    room,
    {
      phase: "reveal",
      revealStartedAt: now,
      jointScore: together ? jointScore : room.jointScore ?? 0,
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
      players: room.players.map((player) => {
        if (together) return { ...player, score: jointScore };
        if (player.id === playerId && correct) return { ...player, score: player.score + 1 };
        return player;
      }),
    },
    now,
  );
}

function advanceFromReveal(room: ShowRoom, now: number): ShowRoom {
  const nextTurn = room.turnIndex + 1;
  if (nextTurn >= matchLength(room)) {
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
      activePlayerId:
        sharesShowRound(roomMode(room)) ? room.hostId : playerForTurn(room, nextTurn),
      revealStartedAt: null,
    },
    now,
  );
}

export function tickShowRoom(room: ShowRoom, now = Date.now()): ShowRoom {
  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= REVEAL_MS) {
      return advanceFromReveal(room, now);
    }
  }
  return room;
}

export function resetShowRoomToLobby(room: ShowRoom, playerId: string, now = Date.now()): ShowRoom {
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
      jointScore: 0,
      revealStartedAt: null,
      players: room.players.map((player) => ({ ...player, score: 0 })),
    },
    now,
  );
}

export function currentShowQuestion(room: ShowRoom): PresentedShow | null {
  if (room.phase !== "question" && room.phase !== "reveal") return null;
  return room.questions[room.turnIndex] ?? null;
}

function winnerIds(players: ShowPlayer[]): string[] {
  const best = Math.max(...players.map((player) => player.score));
  return players.filter((player) => player.score === best).map((player) => player.id);
}

function buildResults(room: ShowRoom): ShowResultRow[] {
  const names = new Map(room.players.map((player) => [player.id, player.name]));
  return [...room.answers]
    .sort((a, b) => a.turnIndex - b.turnIndex)
    .map((answer) => {
      const question = room.questions[answer.turnIndex];
      return {
        turnIndex: answer.turnIndex,
        playerId: answer.playerId,
        playerName: names.get(answer.playerId) ?? "Player",
        songTitle: question?.title ?? "",
        chosenLabel: question?.options[answer.choiceIndex] ?? "",
        correctLabel: question?.title ?? "",
        correct: answer.correct,
      };
    });
}

export function toShowClientState(room: ShowRoom, viewerId: string): ShowClientState {
  const you = room.players.find((player) => player.id === viewerId);
  const mode = roomMode(room);
  if (!you) {
    return {
      code: room.code,
      hostId: room.hostId,
      era: room.era,
      eraTitle: showEraTitle(room.era),
      mode,
      modeTitle: showModeTitle(mode),
      jointScore: null,
      phase: room.phase,
      turnIndex: room.turnIndex,
      totalTurns: matchLength(room),
      questionsPerPlayer: sharesShowRound(roomMode(room)) ? matchLength(room) : matchLength(room) / 2,
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
  const together = sharesShowRound(mode);
  const active = room.players.find((player) => player.id === room.activePlayerId);
  const isYourTurn =
    room.phase === "question" &&
    (together ? viewerId === room.hostId : viewerId === room.activePlayerId);
  let statusMessage: string | null = null;
  if (together && room.phase === "question" && viewerId !== room.hostId) {
    statusMessage = "Discuss with your partner — only the room creator can submit.";
  } else if (room.phase === "question" && !isYourTurn && active) {
    statusMessage = `It's ${active.name}'s turn — listen along!`;
  }
  if (room.phase === "reveal" && revealAnswer && !together) {
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
    era: room.era,
    eraTitle: showEraTitle(room.era),
    mode,
    modeTitle: showModeTitle(mode),
    jointScore: together ? room.jointScore ?? 0 : null,
    phase: room.phase,
    turnIndex: room.turnIndex,
    totalTurns: matchLength(room),
    questionsPerPlayer: sharesShowRound(roomMode(room)) ? matchLength(room) : matchLength(room) / 2,
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
    question: current ? { year: current.year, options: [...current.options] } : null,
    feedback:
      current && revealAnswer
        ? {
            correct: revealAnswer.correct,
            choiceIndex: revealAnswer.choiceIndex,
            correctIndex: current.correctIndex,
            chosenLabel: current.options[revealAnswer.choiceIndex] ?? "",
            correctLabel: current.title,
            songTitle: current.title,
            playerName:
              room.players.find((player) => player.id === revealAnswer.playerId)?.name ?? "Player",
          }
        : null,
    revealEndsAt:
      room.phase === "reveal" && room.revealStartedAt !== null
        ? room.revealStartedAt + REVEAL_MS
        : null,
    winnerIds: room.phase === "finished" && !together ? winnerIds(room.players) : [],
    results: room.phase === "finished" ? buildResults(room) : null,
  };
}
