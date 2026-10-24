import { createAdminClient } from "@/lib/supabase/admin";
import {
  dbRowsToRoom,
  playerRowsFromSnapshot,
  roomToDbRows,
  type FunquizPlayerRow,
  type FunquizRoomRow,
} from "./db-mapper";
import { MAX_PLAYERS } from "./constants";
import { broadcastRoomSync } from "./realtime-server";
import type { QuizPlayer, QuizRoom } from "./types";

/** Keep concurrent joins: in-memory mutations win; players only in DB are retained. */
export function mergePlayersForSave(inMemory: QuizPlayer[], fromDb: QuizPlayer[]): QuizPlayer[] {
  const memById = new Map(inMemory.map((p) => [p.id, p]));
  const dbById = new Map(fromDb.map((p) => [p.id, p]));
  const ids = new Set([...memById.keys(), ...dbById.keys()]);
  const merged = [...ids].map((id) => memById.get(id) ?? dbById.get(id)!);
  if (merged.length <= MAX_PLAYERS) {
    return merged;
  }
  const memIds = new Set(inMemory.map((p) => p.id));
  const prioritized = [
    ...merged.filter((p) => memIds.has(p.id)),
    ...merged.filter((p) => !memIds.has(p.id)),
  ];
  return prioritized.slice(0, MAX_PLAYERS);
}

/** Merge player rows from multiple read paths (table select + JSON RPC). Later groups win on id clash. */
export function mergePlayerRowsForRead(...groups: FunquizPlayerRow[][]): FunquizPlayerRow[] {
  const byId = new Map<string, FunquizPlayerRow>();
  for (const group of groups) {
    for (const row of group) {
      byId.set(row.player_id, row);
    }
  }
  return [...byId.values()].slice(0, MAX_PLAYERS);
}

/** Monotonic merge across poll attempts — never drop a player id we already observed. */
export function absorbPlayerRowsIntoMap(
  bestById: Map<string, FunquizPlayerRow>,
  ...groups: FunquizPlayerRow[][]
): FunquizPlayerRow[] {
  for (const row of mergePlayerRowsForRead(...groups)) {
    bestById.set(row.player_id, row);
  }
  return [...bestById.values()].slice(0, MAX_PLAYERS);
}

/** True while lobby reads should keep retrying (count can be as stale as row selects). */
export function shouldContinueLobbyPlayerRead(visibleCount: number, lobbyWait: boolean): boolean {
  return lobbyWait && visibleCount < MAX_PLAYERS;
}

const LOBBY_PLAYER_READ_MAX_MS = 2_000;
const LOBBY_PLAYER_READ_INTERVAL_MS = 75;

export class QuizStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizStoreUnavailableError";
  }
}

function assertSupabaseConfigured(): void {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new QuizStoreUnavailableError(
      "Fun Quiz storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
}

export function isQuizStoreConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function quizStoreMode(): "supabase" | "none" {
  return isQuizStoreConfigured() ? "supabase" : "none";
}

async function purgeExpiredRoom(code: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("funquiz_rooms").delete().eq("code", code.toUpperCase());
}

export async function loadRoom(code: string): Promise<QuizRoom | null> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const normalized = code.toUpperCase();

  const { data: roomRow, error: roomError } = await supabase
    .from("funquiz_rooms")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }
  if (!roomRow) {
    return null;
  }

  const row = roomRow as FunquizRoomRow;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await purgeExpiredRoom(normalized);
    return null;
  }

  const snapshotRows = playerRowsFromSnapshot(normalized, row.players_snapshot);
  const playerRows = await fetchPlayerRows(supabase, normalized, {
    lobbyWait: row.phase === "lobby",
    seedRows: snapshotRows,
  });

  return dbRowsToRoom(row, playerRows);
}

async function loadPlayersForMerge(code: string): Promise<QuizPlayer[]> {
  const supabase = createAdminClient();
  const rows = await fetchPlayerRows(supabase, code.toUpperCase());
  return rows.map((p) => ({
    id: p.player_id,
    name: p.name,
    score: p.score,
    answer: p.answer,
  }));
}

async function readPlayerRowGroups(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
): Promise<{ groups: FunquizPlayerRow[][] }> {
  const groups: FunquizPlayerRow[][] = [];

  const { data: jsonRows, error: jsonError } = await supabase.rpc("funquiz_list_players_json", {
    p_room_code: roomCode,
  });
  if (!jsonError && jsonRows != null) {
    let parsed: unknown = jsonRows;
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed) as unknown;
    }
    if (Array.isArray(parsed)) {
      groups.push(parsed as FunquizPlayerRow[]);
    }
  }

  const { data: playerRows, error: playerError } = await supabase
    .from("funquiz_players")
    .select("*")
    .eq("room_code", roomCode);

  if (playerError) {
    throw new Error(playerError.message);
  }
  groups.push((playerRows ?? []) as FunquizPlayerRow[]);
  return { groups };
}

async function fetchPlayerCount(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("funquiz_player_count", {
    p_room_code: roomCode,
  });
  if (error || data == null || typeof data !== "number") {
    return null;
  }
  return data;
}

type FetchPlayerRowsOptions = {
  /** When true, retry until DB count matches visible rows or budget elapses (lobby join lag). */
  lobbyWait?: boolean;
  /** Rows from funquiz_rooms.players_snapshot (same row fetch as room metadata). */
  seedRows?: FunquizPlayerRow[];
};

async function fetchPlayerRows(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
  options: FetchPlayerRowsOptions = {},
): Promise<FunquizPlayerRow[]> {
  const bestById = new Map<string, FunquizPlayerRow>();
  if (options.seedRows?.length) {
    absorbPlayerRowsIntoMap(bestById, options.seedRows);
  }
  const deadline =
    options.lobbyWait === true ? Date.now() + LOBBY_PLAYER_READ_MAX_MS : Date.now();

  do {
    const { groups } = await readPlayerRowGroups(supabase, roomCode);
    absorbPlayerRowsIntoMap(bestById, ...groups);
    const visible = bestById.size;
    const dbCount = await fetchPlayerCount(supabase, roomCode);
    if (dbCount !== null && dbCount > visible) {
      for (let extra = 0; extra < 3 && bestById.size < dbCount; extra++) {
        await new Promise((resolve) => setTimeout(resolve, LOBBY_PLAYER_READ_INTERVAL_MS));
        const again = await readPlayerRowGroups(supabase, roomCode);
        absorbPlayerRowsIntoMap(bestById, ...again.groups);
      }
    }

    if (!shouldContinueLobbyPlayerRead(bestById.size, options.lobbyWait === true)) {
      break;
    }
    if (Date.now() >= deadline) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, LOBBY_PLAYER_READ_INTERVAL_MS));
  } while (true);

  return [...bestById.values()].slice(0, MAX_PLAYERS);
}

export async function saveRoom(room: QuizRoom): Promise<void> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const normalized = room.code.toUpperCase();

  const dbPlayers = await loadPlayersForMerge(normalized);
  const mergedRoom: QuizRoom = {
    ...room,
    players: mergePlayersForSave(room.players, dbPlayers),
  };

  const { room: roomInsert, players } = roomToDbRows(mergedRoom);

  const existing = await supabase
    .from("funquiz_rooms")
    .select("created_at")
    .eq("code", roomInsert.code)
    .maybeSingle();

  const createdAt =
    existing.data?.created_at ?? new Date(mergedRoom.createdAt).toISOString();

  const { error: roomError } = await supabase.from("funquiz_rooms").upsert({
    ...roomInsert,
    created_at: createdAt,
  });

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (players.length > 0) {
    const { error: playerError } = await supabase
      .from("funquiz_players")
      .upsert(players, { onConflict: "room_code,player_id" });
    if (playerError) {
      throw new Error(playerError.message);
    }
  }

  await broadcastRoomSync(roomInsert.code);
}

/** Initial room write: upsert room row and host player only (no player-table delete). */
export async function persistNewRoom(room: QuizRoom): Promise<void> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const { room: roomInsert, players } = roomToDbRows(room);
  const host = players[0];
  if (!host) {
    throw new Error("Room must include the host player");
  }

  const { error: roomError } = await supabase.from("funquiz_rooms").upsert({
    ...roomInsert,
    created_at: new Date(room.createdAt).toISOString(),
  });
  if (roomError) {
    throw new Error(roomError.message);
  }

  const { error: playerError } = await supabase
    .from("funquiz_players")
    .upsert(host, { onConflict: "room_code,player_id" });
  if (playerError) {
    throw new Error(playerError.message);
  }

  await broadcastRoomSync(roomInsert.code);
}

/** Persist a single lobby join without rewriting other player rows (avoids join/poll races). */
export async function persistJoinedPlayer(room: QuizRoom, playerId: string): Promise<void> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("Player not in room state");
  }
  const normalized = room.code.toUpperCase();
  const { room: roomInsert } = roomToDbRows(room);

  const { room: roomPatch, players: allPlayers } = roomToDbRows(room);
  const { error: roomError } = await supabase
    .from("funquiz_rooms")
    .update({
      updated_at: roomPatch.updated_at,
      players_snapshot: allPlayers,
    })
    .eq("code", normalized);
  if (roomError) {
    throw new Error(roomError.message);
  }

  const { error: playerError } = await supabase.from("funquiz_players").upsert(
    {
      room_code: normalized,
      player_id: player.id,
      name: player.name,
      score: player.score,
      answer: player.answer,
    },
    { onConflict: "room_code,player_id" },
  );
  if (playerError) {
    throw new Error(playerError.message);
  }

  await broadcastRoomSync(normalized);
}
