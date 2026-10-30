import { createAdminClient } from "@/lib/supabase/admin";
import {
  dbRowsToRoom,
  playerRowsFromSnapshot,
  roomToDbRows,
  type FunquizPlayerRow,
  type FunquizRoomRow,
} from "./db-mapper";
import { MAX_PLAYERS } from "./constants";
import { normalizeRoomCode } from "./room-code";
import { broadcastRoomSync } from "./realtime-server";
import { tickRoom } from "./game-logic";
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

/** Stop lobby player load when full or DB reports a full lobby that matches visible rows. */
export function shouldStopLobbyPlayerLoad(
  visibleCount: number,
  dbCount: number | null,
  deadlinePassed: boolean,
): boolean {
  if (visibleCount >= MAX_PLAYERS) {
    return true;
  }
  if (dbCount !== null && dbCount >= MAX_PLAYERS && visibleCount >= dbCount) {
    return true;
  }
  return deadlinePassed;
}

const LOBBY_PLAYER_READ_MAX_MS = 2_000;
const LOBBY_PLAYER_READ_INTERVAL_MS = 75;

export class QuizStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizStoreUnavailableError";
  }
}

export class QuizRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "QuizRoomConflictError";
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

/** Test helper: remove a room row (no-op when store is not configured). */
export async function deleteRoomForTest(code: string): Promise<void> {
  if (!isQuizStoreConfigured()) {
    return;
  }
  await purgeExpiredRoom(code);
}

export async function loadRoom(code: string): Promise<QuizRoom | null> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const normalized = normalizeRoomCode(code);
  if (!normalized) {
    return null;
  }

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

  let row = roomRow as FunquizRoomRow;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await purgeExpiredRoom(normalized);
    return null;
  }

  const snapshotRows = playerRowsFromSnapshot(normalized, row.players_snapshot);
  const playerRows = await loadPlayerRowsForRoom(
    supabase,
    normalized,
    row.phase === "lobby",
    snapshotRows,
  );

  return dbRowsToRoom(row, playerRows);
}

async function loadPlayersForMerge(code: string): Promise<QuizPlayer[]> {
  const supabase = createAdminClient();
  const rows = await loadPlayerRowsForRoom(supabase, code.toUpperCase(), false);
  return playerRowsToQuizPlayers(rows);
}

export function parsePlayerJsonRows(payload: unknown): FunquizPlayerRow[] {
  let parsed: unknown = payload;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed as FunquizPlayerRow[];
}

function playerRowsToQuizPlayers(rows: FunquizPlayerRow[]): QuizPlayer[] {
  return rows.map((p) => ({
    id: p.player_id,
    name: p.name,
    score: p.score,
    answer: p.answer,
  }));
}

/** Primary player read: resolved JSON RPC, retry in lobby until count catches up. */
export async function loadPlayerRowsForRoom(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
  lobbyWait: boolean,
  seedRows: FunquizPlayerRow[] = [],
): Promise<FunquizPlayerRow[]> {
  const bestById = new Map<string, FunquizPlayerRow>();
  if (seedRows.length > 0) {
    absorbPlayerRowsIntoMap(bestById, seedRows);
  }
  const deadline = lobbyWait ? Date.now() + LOBBY_PLAYER_READ_MAX_MS : Date.now();

  do {
    const { data, error } = await supabase.rpc("funquiz_resolved_players_json", {
      p_room_code: roomCode,
    });
    if (!error && data != null) {
      absorbPlayerRowsIntoMap(bestById, parsePlayerJsonRows(data));
    }

    if (!lobbyWait) {
      break;
    }

    const dbCount = await fetchPlayerCount(supabase, roomCode);
    if (shouldStopLobbyPlayerLoad(bestById.size, dbCount, Date.now() >= deadline)) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, LOBBY_PLAYER_READ_INTERVAL_MS));
  } while (true);

  if (bestById.size === 0) {
    const { groups } = await readPlayerRowGroups(supabase, roomCode);
    absorbPlayerRowsIntoMap(bestById, ...groups);
  }

  return [...bestById.values()].slice(0, MAX_PLAYERS);
}

async function readPlayerRowGroups(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
): Promise<{ groups: FunquizPlayerRow[][] }> {
  const groups: FunquizPlayerRow[][] = [];

  const { data: resolvedRows, error: resolvedError } = await supabase.rpc(
    "funquiz_resolved_players_json",
    { p_room_code: roomCode },
  );
  if (!resolvedError && resolvedRows != null) {
    groups.push(parsePlayerJsonRows(resolvedRows));
  }

  const { data: jsonRows, error: jsonError } = await supabase.rpc("funquiz_list_players_json", {
    p_room_code: roomCode,
  });
  if (!jsonError && jsonRows != null) {
    groups.push(parsePlayerJsonRows(jsonRows));
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

export async function saveRoom(room: QuizRoom): Promise<QuizRoom> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const normalized = room.code.toUpperCase();

  const { data: roomMeta } = await supabase
    .from("funquiz_rooms")
    .select("players_snapshot")
    .eq("code", normalized)
    .maybeSingle();
  const snapshotPlayers: QuizPlayer[] = playerRowsFromSnapshot(
    normalized,
    roomMeta?.players_snapshot,
  ).map((p) => ({
    id: p.player_id,
    name: p.name,
    score: p.score,
    answer: p.answer,
  }));
  const supabaseForRead = createAdminClient();
  const resolvedRows = await loadPlayerRowsForRoom(supabaseForRead, normalized, false);
  const resolvedPlayers = playerRowsToQuizPlayers(resolvedRows);
  const dbPlayers = await loadPlayersForMerge(normalized);
  const mergedFromDb = mergePlayersForSave(
    mergePlayersForSave(dbPlayers, snapshotPlayers),
    resolvedPlayers,
  );
  let mergedPlayers = mergePlayersForSave(room.players, mergedFromDb);
  if (room.phase === "lobby" && resolvedPlayers.length > mergedPlayers.length) {
    mergedPlayers = mergePlayersForSave(mergedPlayers, resolvedPlayers);
  }
  const mergedRoom: QuizRoom = {
    ...room,
    players: mergedPlayers,
  };

  const { room: roomInsert, players } = roomToDbRows(mergedRoom);

  const existing = await supabase
    .from("funquiz_rooms")
    .select("created_at")
    .eq("code", roomInsert.code)
    .maybeSingle();

  const createdAt =
    existing.data?.created_at ?? new Date(mergedRoom.createdAt).toISOString();

  const basisUpdatedAt = mergedRoom.dbUpdatedAtIso;
  const roomPayload = {
    ...roomInsert,
    created_at: createdAt,
  };

  if (basisUpdatedAt && existing.data) {
    const { code: _code, created_at: _ca, ...updatePatch } = roomPayload;
    const { data: updatedRow, error: roomError } = await supabase
      .from("funquiz_rooms")
      .update(updatePatch)
      .eq("code", normalized)
      .eq("updated_at", basisUpdatedAt)
      .select("updated_at")
      .maybeSingle();

    if (roomError) {
      throw new Error(roomError.message);
    }
    if (!updatedRow) {
      throw new QuizRoomConflictError();
    }
    mergedRoom.dbUpdatedAtIso = updatedRow.updated_at as string;
  } else {
    const { error: roomError } = await supabase.from("funquiz_rooms").upsert(roomPayload);
    if (roomError) {
      throw new Error(roomError.message);
    }
    const { data: reread } = await supabase
      .from("funquiz_rooms")
      .select("updated_at")
      .eq("code", normalized)
      .maybeSingle();
    if (reread?.updated_at) {
      mergedRoom.dbUpdatedAtIso = reread.updated_at as string;
    }
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
  return mergedRoom;
}

const DEFAULT_MUTATE_ATTEMPTS = 4;

/**
 * Load room, apply server-side transition, and persist with optimistic concurrency.
 * Retries on concurrent write conflicts by reloading and re-applying the mutation.
 */
export async function mutateRoomPersisted(
  code: string,
  mutate: (room: QuizRoom) => QuizRoom,
  options?: { maxAttempts?: number },
): Promise<QuizRoom> {
  const normalized = code.toUpperCase();
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MUTATE_ATTEMPTS;
  let lastConflict: QuizRoomConflictError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let room = await loadRoom(normalized);
    if (!room) {
      throw new Error("Room not found");
    }
    room = tickRoom(room);
    const next = mutate(room);
    try {
      return await saveRoom(next);
    } catch (err) {
      if (err instanceof QuizRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }

  throw lastConflict ?? new QuizRoomConflictError("Too many concurrent room updates");
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

/**
 * @deprecated Use `mutateRoomPersisted` with `addPlayer` (join route) for CAS-safe joins.
 * Persist a single lobby join without rewriting other player rows (avoids join/poll races).
 */
export async function persistJoinedPlayer(room: QuizRoom, playerId: string): Promise<void> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("Player not in room state");
  }
  const normalized = room.code.toUpperCase();
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
