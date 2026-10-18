import { createAdminClient } from "@/lib/supabase/admin";
import { dbRowsToRoom, roomToDbRows, type FunquizPlayerRow, type FunquizRoomRow } from "./db-mapper";
import { broadcastRoomSync } from "./realtime-server";
import type { QuizRoom } from "./types";

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

  await supabase.rpc("funquiz_purge_expired_rooms");

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

  const { data: playerRows, error: playerError } = await supabase
    .from("funquiz_players")
    .select("*")
    .eq("room_code", normalized);

  if (playerError) {
    throw new Error(playerError.message);
  }

  return dbRowsToRoom(row, (playerRows ?? []) as FunquizPlayerRow[]);
}

export async function saveRoom(room: QuizRoom): Promise<void> {
  assertSupabaseConfigured();
  const supabase = createAdminClient();
  const { room: roomInsert, players } = roomToDbRows(room);

  const existing = await supabase
    .from("funquiz_rooms")
    .select("created_at")
    .eq("code", roomInsert.code)
    .maybeSingle();

  const createdAt =
    existing.data?.created_at ?? new Date(room.createdAt).toISOString();

  const { error: roomError } = await supabase.from("funquiz_rooms").upsert({
    ...roomInsert,
    created_at: createdAt,
  });

  if (roomError) {
    throw new Error(roomError.message);
  }

  const { error: deletePlayersError } = await supabase
    .from("funquiz_players")
    .delete()
    .eq("room_code", roomInsert.code);
  if (deletePlayersError) {
    throw new Error(deletePlayersError.message);
  }

  if (players.length > 0) {
    const { error: playerError } = await supabase.from("funquiz_players").insert(players);
    if (playerError) {
      throw new Error(playerError.message);
    }
  }

  await broadcastRoomSync(roomInsert.code);
}
