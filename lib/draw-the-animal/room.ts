import { cleanStrokes, type Stroke } from "./drawing";
import { compareDrawings } from "./judge";
import { ANIMAL_ROUNDS, ANIMALS } from "./animals";

export const MAX_PLAYERS = 2;
export const REVEAL_MS = 8000;
export const ROOM_TTL_MS = 4 * 60 * 60 * 1000;

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type DrawPhase = "lobby" | "draw" | "vote" | "reveal" | "finished";

export type DrawPlayer = {
  id: string;
  name: string;
  score: number;
};

export type DrawVote = {
  playerId: string;
  choice: string;
};

export type DrawScore = {
  playerId: string;
  score: number;
};

export type DrawRound = {
  organ: string;
  winnerIds: string[];
  scores?: DrawScore[];
};


export type DrawPlayMode = "single" | "together" | "separate";

function drawMode(room: { mode?: DrawPlayMode }): DrawPlayMode {
  return room.mode === "single" || room.mode === "together" ? room.mode : "separate";
}

export type DrawRoom = {
  code: string;
  hostId: string;
  mode: DrawPlayMode;
  phase: DrawPhase;
  turnIndex: number;
  organs: string[];
  drawings: Record<string, Stroke[]>;
  submitted: string[];
  votes: DrawVote[];
  rounds: DrawRound[];
  revision: number;
  players: DrawPlayer[];
  revealStartedAt: number | null;
  createdAt: number;
  updatedAt: number;
  dbUpdatedAtIso?: string;
};

export type DrawClientState = {
  code: string;
  hostId: string;
  mode: DrawPlayMode;
  phase: DrawPhase;
  turnIndex: number;
  totalRounds: number;
  organ: string | null;
  youSubmitted: boolean;
  youVoted: boolean;
  yourDrawing: Stroke[];
  boards: Array<{ playerId: string; name: string; strokes: Stroke[] }>;
  players: DrawPlayer[];
  you: DrawPlayer;
  statusMessage: string | null;
  roundWinnerIds: string[];
  roundScores: DrawScore[];
  results: DrawRound[] | null;
  revision: number;
  error?: string;
};

export function generateDrawRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function cleanPlayerName(name: string): string {
  const trimmed = name.trim().slice(0, 24);
  if (!trimmed) throw new Error("Enter your name first.");
  return trimmed;
}

function touch(room: DrawRoom, patch: Partial<DrawRoom>, now: number): DrawRoom {
  return { ...room, ...patch, revision: room.revision + 1, updatedAt: now };
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const current = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = current;
  }
  return arr;
}

export function createDrawRoom(
  playerId: string,
  playerName: string,
  code: string,
  mode: DrawPlayMode = "separate",
  now = Date.now(),
): DrawRoom {
  return {
    code,
    hostId: playerId,
    mode,
    phase: "lobby",
    turnIndex: 0,
    organs: [],
    drawings: {},
    submitted: [],
    votes: [],
    rounds: [],
    revision: 1,
    players: [{ id: playerId, name: cleanPlayerName(playerName), score: 0 }],
    revealStartedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function addDrawPlayer(room: DrawRoom, playerId: string, playerName: string): DrawRoom {
  if (room.players.some((player) => player.id === playerId)) return room;
  if (room.phase !== "lobby") throw new Error("Game already started");
  if (room.players.length >= MAX_PLAYERS) throw new Error("Room is full");
  return touch(
    room,
    { players: [...room.players, { id: playerId, name: cleanPlayerName(playerName), score: 0 }] },
    Date.now(),
  );
}

export function startDrawGame(room: DrawRoom, playerId: string, rng: () => number = Math.random, now = Date.now()): DrawRoom {
  if (playerId !== room.hostId) throw new Error("Only the host can start");
  if (room.phase !== "lobby") throw new Error("Game already started");
  if (drawMode(room) !== "single" && room.players.length < MAX_PLAYERS) throw new Error("Waiting for a second player");
  const organs = shuffle(ANIMALS, rng).slice(0, ANIMAL_ROUNDS).map((organ) => organ.title);
  return touch(
    room,
    {
      phase: "draw",
      turnIndex: 0,
      organs,
      drawings: {},
      submitted: [],
      votes: [],
      rounds: [],
      revealStartedAt: null,
      players: room.players.map((player) => ({ ...player, score: 0 })),
    },
    now,
  );
}

export function submitDrawing(room: DrawRoom, playerId: string, rawStrokes: unknown, now = Date.now()): DrawRoom {
  if (room.phase !== "draw") throw new Error("Not accepting drawings right now");
  if (!room.players.some((player) => player.id === playerId)) throw new Error("You are not in this room");
  if (room.submitted.includes(playerId)) return room;
  const strokes = cleanStrokes(rawStrokes);
  const submitted = [...room.submitted, playerId];
  const drawings = { ...room.drawings, [playerId]: strokes };
  const ready = room.players.every((player) => submitted.includes(player.id));
  if (!ready) {
    return touch(room, { drawings, submitted }, now);
  }
  const organ = room.organs[room.turnIndex] ?? "Animal";
  const judged = compareDrawings(
    organ,
    room.players.map((player) => ({ playerId: player.id, strokes: drawings[player.id] ?? [] })),
  );
  const winnerIds =
    drawMode(room) === "together" && judged.winnerIds.length > 0
      ? room.players.map((player) => player.id)
      : judged.winnerIds;
  return touch(
    room,
    {
      drawings,
      submitted,
      votes: [],
      phase: "reveal",
      revealStartedAt: now,
      rounds: [...room.rounds, { organ, winnerIds, scores: judged.scores }],
      players: room.players.map((player) =>
        winnerIds.includes(player.id) ? { ...player, score: player.score + 1 } : player,
      ),
    },
    now,
  );
}

function winnerIdsForVotes(room: DrawRoom): string[] {
  const tally = new Map(room.players.map((player) => [player.id, 0]));
  for (const vote of room.votes) {
    if (vote.choice === "tie") {
      for (const playerId of tally.keys()) tally.set(playerId, (tally.get(playerId) ?? 0) + 1);
      continue;
    }
    if (tally.has(vote.choice)) tally.set(vote.choice, (tally.get(vote.choice) ?? 0) + 1);
  }
  const best = Math.max(0, ...tally.values());
  if (best === 0) return [];
  return [...tally.entries()].filter(([, score]) => score === best).map(([playerId]) => playerId);
}

export function submitVote(room: DrawRoom, playerId: string, choice: string, now = Date.now()): DrawRoom {
  if (room.phase !== "vote") throw new Error("Not ready to judge the drawings");
  if (!room.players.some((player) => player.id === playerId)) throw new Error("You are not in this room");
  if (room.votes.some((vote) => vote.playerId === playerId)) return room;
  if (choice !== "tie" && !room.players.some((player) => player.id === choice)) {
    throw new Error("Choose a drawing");
  }
  const votes = [...room.votes, { playerId, choice }];
  if (votes.length < room.players.length) {
    return touch(room, { votes }, now);
  }
  const judged = { ...room, votes };
  const winnerIds = winnerIdsForVotes(judged);
  const organ = room.organs[room.turnIndex] ?? "Animal";
  return touch(
    room,
    {
      votes,
      phase: "reveal",
      revealStartedAt: now,
      rounds: [...room.rounds, { organ, winnerIds }],
      players: room.players.map((player) =>
        winnerIds.includes(player.id) ? { ...player, score: player.score + 1 } : player,
      ),
    },
    now,
  );
}

function nextRound(room: DrawRoom, now: number): DrawRoom {
  const nextTurn = room.turnIndex + 1;
  if (nextTurn >= room.organs.length) {
    return touch(
      room,
      { phase: "finished", turnIndex: nextTurn, revealStartedAt: null, drawings: {}, submitted: [], votes: [] },
      now,
    );
  }
  return touch(
    room,
    {
      phase: "draw",
      turnIndex: nextTurn,
      drawings: {},
      submitted: [],
      votes: [],
      revealStartedAt: null,
    },
    now,
  );
}

export function tickDrawRoom(room: DrawRoom, now = Date.now()): DrawRoom {
  if (room.phase === "reveal" && room.revealStartedAt !== null && now - room.revealStartedAt >= REVEAL_MS) {
    return nextRound(room, now);
  }
  return room;
}

export function resetDrawRoomToLobby(room: DrawRoom, playerId: string, now = Date.now()): DrawRoom {
  if (playerId !== room.hostId) throw new Error("Only the host can start a new game");
  if (room.phase !== "finished") throw new Error("Finish the current game before starting a new one");
  return touch(
    room,
    {
      phase: "lobby",
      turnIndex: 0,
      organs: [],
      drawings: {},
      submitted: [],
      votes: [],
      rounds: [],
      revealStartedAt: null,
      players: room.players.map((player) => ({ ...player, score: 0 })),
    },
    now,
  );
}

export function toDrawClientState(room: DrawRoom, viewerId: string): DrawClientState {
  const you = room.players.find((player) => player.id === viewerId);
  const showBoards = room.phase === "vote" || room.phase === "reveal";
  if (!you) {
    return {
      code: room.code,
      hostId: room.hostId,
      mode: drawMode(room),
      phase: room.phase,
      turnIndex: room.turnIndex,
      totalRounds: room.organs.length || ANIMAL_ROUNDS,
      organ: null,
      youSubmitted: false,
      youVoted: false,
      yourDrawing: [],
      boards: [],
      players: [],
      you: { id: viewerId, name: "", score: 0 },
      statusMessage: null,
      roundWinnerIds: [],
      roundScores: [],
      results: null,
      revision: room.revision,
      error: "You are not in this room",
    };
  }
  const opponent = room.players.find((player) => player.id !== viewerId);
  let statusMessage: string | null = null;
  if (room.phase === "draw" && room.submitted.includes(viewerId) && opponent) {
    statusMessage = `Waiting for ${opponent.name} to finish drawing.`;
  } else if (room.phase === "vote" && room.votes.some((vote) => vote.playerId === viewerId) && opponent) {
    statusMessage = `Waiting for ${opponent.name} to choose the closer drawing.`;
  } else if (room.phase === "draw") {
    statusMessage = drawMode(room) === "single"
      ? "Draw on your board, then press Done."
      : "Draw on your board. Your friend cannot see it until you both press Done.";
  }
  const currentRound = room.rounds[room.turnIndex];
  if (room.phase === "reveal" && currentRound) {
    if (currentRound.winnerIds.length === 0) {
      statusMessage = "Neither drawing was close.";
    } else if (currentRound.winnerIds.length > 1) {
      statusMessage = "Too close to call. You both score.";
    } else {
      const winner = room.players.find((player) => player.id === currentRound.winnerIds[0]);
      statusMessage = `${winner?.name ?? "One drawing"} is closer.`;
    }
  }
  return {
    code: room.code,
    hostId: room.hostId,
    mode: drawMode(room),
    phase: room.phase,
    turnIndex: room.turnIndex,
    totalRounds: room.organs.length || ANIMAL_ROUNDS,
    organ: room.phase === "lobby" || room.phase === "finished" ? null : room.organs[room.turnIndex] ?? null,
    youSubmitted: room.submitted.includes(viewerId),
    youVoted: room.votes.some((vote) => vote.playerId === viewerId),
    yourDrawing: room.drawings[viewerId] ?? [],
    boards: showBoards
      ? room.players.map((player) => ({
          playerId: player.id,
          name: player.name,
          strokes: room.drawings[player.id] ?? [],
        }))
      : [],
    players: room.players,
    you,
    statusMessage,
    roundWinnerIds: room.phase === "reveal" && currentRound ? currentRound.winnerIds : [],
    roundScores: room.phase === "reveal" && currentRound?.scores ? currentRound.scores : [],
    results: room.phase === "finished" ? room.rounds : null,
    revision: room.revision,
  };
}
