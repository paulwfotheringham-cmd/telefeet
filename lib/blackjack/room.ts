import { AI_NAMES, STARTING_BALANCE, TABLE_SEAT_COUNT, aiSeatsForHumanCount } from "./constants";
import { blackjackReducer, createInitialState } from "./engine";
import { defaultStats } from "./storage";
import type { BlackjackAction, BlackjackGameState, SeatState, SessionStats } from "./types";

export const MAX_HUMAN_PLAYERS = 2;
export const ROOM_TTL_MS = 4 * 60 * 60 * 1000;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type BlackjackRoomPhase = "lobby" | "playing";

export type BlackjackRoomPlayer = {
  id: string;
  name: string;
};

export type BlackjackRoom = {
  code: string;
  hostId: string;
  phase: BlackjackRoomPhase;
  players: BlackjackRoomPlayer[];
  game: BlackjackGameState | null;
  revision: number;
  createdAt: number;
  updatedAt: number;
  dbUpdatedAtIso?: string;
};

export type BlackjackClientState = {
  code: string;
  hostId: string;
  phase: BlackjackRoomPhase;
  players: BlackjackRoomPlayer[];
  isHost: boolean;
  waitingForGuest: boolean;
  canStart: boolean;
  revision: number;
  game: BlackjackGameState | null;
  you: BlackjackRoomPlayer;
};

export function generateBlackjackRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]!;
  }
  return code;
}

export function cleanPlayerName(name: string): string {
  const trimmed = name.trim().slice(0, 24);
  if (!trimmed) throw new Error("Enter your name first.");
  return trimmed;
}

function touch(room: BlackjackRoom, patch: Partial<BlackjackRoom>, now = Date.now()): BlackjackRoom {
  return {
    ...room,
    ...patch,
    revision: room.revision + 1,
    updatedAt: now,
  };
}

function makeSeat(id: string, name: string, isHuman: boolean, balance: number): SeatState {
  return {
    id,
    name,
    isHuman,
    balance,
    pendingBet: 0,
    hands: [],
    betPlaced: false,
  };
}

/** Build a five-seat table: humans first, AI fill the rest. */
export function createMultiHumanGame(
  humans: BlackjackRoomPlayer[],
  stats: SessionStats = defaultStats(),
): BlackjackGameState {
  const seats: SeatState[] = humans.map((h) =>
    makeSeat(h.id, h.name || "Player", true, stats.balance || STARTING_BALANCE),
  );
  const aiCount = aiSeatsForHumanCount(humans.length);
  for (let i = 0; i < aiCount; i++) {
    seats.push(makeSeat(`ai-${i}`, AI_NAMES[i] ?? `Guest ${i + 1}`, false, STARTING_BALANCE));
  }
  while (seats.length < TABLE_SEAT_COUNT) {
    const i = seats.filter((s) => !s.isHuman).length;
    seats.push(makeSeat(`ai-${i}`, AI_NAMES[i] ?? `Guest ${i + 1}`, false, STARTING_BALANCE));
  }
  return {
    phase: "betting",
    mode: "hostTable",
    aiSeatCount: seats.filter((s) => !s.isHuman).length,
    seats,
    dealer: { cards: [] },
    deck: [],
    activeSeatIndex: 0,
    activeHandIndex: 0,
    dealerRevealed: false,
    banner: "Place your bet",
    humanSeatId: humans[0]!.id,
  };
}

export function createBlackjackRoom(
  playerId: string,
  playerName: string,
  code: string,
  now = Date.now(),
): BlackjackRoom {
  return {
    code,
    hostId: playerId,
    phase: "lobby",
    players: [{ id: playerId, name: cleanPlayerName(playerName) }],
    game: null,
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function addBlackjackPlayer(room: BlackjackRoom, playerId: string, playerName: string): BlackjackRoom {
  if (room.players.some((p) => p.id === playerId)) {
    return room;
  }
  if (room.phase !== "lobby") {
    throw new Error("This table already started. Ask the host for a new room code.");
  }
  if (room.players.length >= MAX_HUMAN_PLAYERS) {
    throw new Error("This table already has two players.");
  }
  const name = cleanPlayerName(playerName);
  const players = [...room.players, { id: playerId, name }];
  // Auto-deal when the second human sits — fill with AI and enter betting.
  if (players.length >= MAX_HUMAN_PLAYERS) {
    const game = createMultiHumanGame(players);
    return touch(room, { players, phase: "playing", game });
  }
  return touch(room, { players });
}

export function startBlackjackRoom(room: BlackjackRoom, playerId: string): BlackjackRoom {
  if (playerId !== room.hostId) {
    throw new Error("Only the host can start the table.");
  }
  if (room.phase === "playing" && room.game) return room;
  if (room.players.length < 1) {
    throw new Error("No players at the table.");
  }
  // Host can start solo (1 human + 4 AI) or wait for a guest (2 + 3 AI).
  const game = createMultiHumanGame(room.players);
  return touch(room, { phase: "playing", game });
}

export function applyBlackjackRoomAction(
  room: BlackjackRoom,
  playerId: string,
  action: BlackjackAction,
): BlackjackRoom {
  if (room.phase !== "playing" || !room.game) {
    throw new Error("The table has not started yet.");
  }
  if (!room.players.some((p) => p.id === playerId)) {
    throw new Error("You are not seated at this table.");
  }
  // Scope reducer to the acting human so bets/actions hit their seat only.
  const scoped: BlackjackGameState = { ...room.game, humanSeatId: playerId };
  const next = blackjackReducer(scoped, action);
  return touch(room, { game: { ...next, humanSeatId: room.game.humanSeatId } });
}

export function toBlackjackClientState(room: BlackjackRoom, playerId: string): BlackjackClientState {
  const you = room.players.find((p) => p.id === playerId);
  if (!you) {
    throw new Error("You are not seated at this table.");
  }
  const game = room.game
    ? ({ ...room.game, humanSeatId: playerId } satisfies BlackjackGameState)
    : null;
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    players: room.players,
    isHost: room.hostId === playerId,
    waitingForGuest: room.phase === "lobby" && room.players.length < MAX_HUMAN_PLAYERS,
    canStart: room.phase === "lobby" && room.hostId === playerId,
    revision: room.revision,
    game,
    you,
  };
}

/** Local solo still uses createInitialState — re-export for clarity. */
export { createInitialState };
