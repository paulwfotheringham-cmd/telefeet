import { createAdminClient } from "@/lib/supabase/admin";
import { dbRowsToRoom, roomToDbRows, type FunquizPlayerRow, type FunquizRoomRow } from "./db-mapper";
import { MAX_PLAYERS } from "./constants";
import { broadcastRoomSync } from "./realtime-server";
import type { QuizPlayer, QuizRoom } from "./types";

/** Keep concurrent joins: in-memory mutations win; players only in DB are retained. */
export function mergePlayersForSave(inMemory: QuizPlayer[], fromDb: QuizPlayer[]): QuizPlayer[] {
  const memById = new Map(inMemory.map((p) => [p.id, p]));
  const dbById = new Map(fromDb.map((p) => [p.id, p]));
  const ids = new Set([...memById.keys(), ...dbById.keys()]);
  return [...ids].map((id) => memById.get(id) ?? dbById.get(id)!);
}

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

  let playerRows = await fetchPlayerRows(supabase, normalized);
  if (row.phase === "lobby" && playerRows.length === 1) {
    playerRows = await waitForLobbyPlayers(supabase, normalized, playerRows);
  }

  return dbRowsToRoom(row, playerRows);
}

async function fetchPlayerRows(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
): Promise<FunquizPlayerRow[]> {
  const { data: playerRows, error: playerError } = await supabase.rpc("funquiz_list_players", {
    p_room_code: roomCode,
  });

  if (playerError) {
    const { data: fallbackRows, error: fallbackError } = await supabase
      .from("funquiz_players")
      .select("*")
      .eq("room_code", roomCode);
    if (fallbackError) {
      throw new Error(fallbackError.message);
    }
    return (fallbackRows ?? []) as FunquizPlayerRow[];
  }
  return (playerRows ?? []) as FunquizPlayerRow[];
}

/** PostgREST can briefly return a stale single-player lobby after a join upsert. */
async function waitForLobbyPlayers(
  supabase: ReturnType<typeof createAdminClient>,
  roomCode: string,
  initial: FunquizPlayerRow[],
): Promise<FunquizPlayerRow[]> {
  let best = initial;
  for (let attempt = 0; attempt < 6; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const rows = await fetchPlayerRows(supabase, roomCode);
    if (rows.length > best.length) {
      best = rows;
    }
    if (best.length >= MAX_PLAYERS) {
      break;
    }
  }
  return best;
}

export async function saveRoom(room: QuizRoom): Promise<void> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const normalized = room.code.toUpperCase();

  const latest = await loadRoom(normalized);
  const mergedRoom: QuizRoom = latest
    ? { ...room, players: mergePlayersForSave(room.players, latest.players) }
    : room;

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

  const { error: roomError } = await supabase
    .from("funquiz_rooms")
    .update({ updated_at: roomInsert.updated_at })
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
