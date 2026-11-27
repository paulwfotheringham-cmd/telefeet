import { createAdminClient } from "@/lib/supabase/admin";
import { ROOM_TTL_MS, type BlackjackRoom } from "./room";

export class BlackjackStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlackjackStoreUnavailableError";
  }
}

export class BlackjackRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "BlackjackRoomConflictError";
  }
}

type MemoryEntry = { room: BlackjackRoom; expiresAt: number };

const memoryGlobal = globalThis as typeof globalThis & {
  __blackjackRooms?: Map<string, MemoryEntry>;
};

function memoryRooms(): Map<string, MemoryEntry> {
  if (!memoryGlobal.__blackjackRooms) {
    memoryGlobal.__blackjackRooms = new Map();
  }
  return memoryGlobal.__blackjackRooms;
}

export function blackjackStoreMode(): "supabase" | "memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : "memory";
}

function usesSupabase(): boolean {
  return blackjackStoreMode() === "supabase";
}

function stripDbStamp(room: BlackjackRoom): BlackjackRoom {
  const next = { ...room };
  delete next.dbUpdatedAtIso;
  return next;
}

async function loadFromSupabase(code: string): Promise<BlackjackRoom | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blackjack_rooms")
    .select("state, updated_at, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("blackjack_rooms").delete().eq("code", code);
    return null;
  }
  const room = data.state as BlackjackRoom;
  room.dbUpdatedAtIso = data.updated_at as string;
  return room;
}

function loadFromMemory(code: string): BlackjackRoom | null {
  const entry = memoryRooms().get(code);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryRooms().delete(code);
    return null;
  }
  return structuredClone(entry.room);
}

export async function loadBlackjackRoom(code: string): Promise<BlackjackRoom | null> {
  const normalized = code.toUpperCase();
  return usesSupabase() ? loadFromSupabase(normalized) : loadFromMemory(normalized);
}

async function saveBlackjackRoom(room: BlackjackRoom): Promise<BlackjackRoom> {
  const normalized = room.code.toUpperCase();
  const expiresAt = Date.now() + ROOM_TTL_MS;
  if (!usesSupabase()) {
    const stamped: BlackjackRoom = { ...room, code: normalized };
    memoryRooms().set(normalized, { room: stamped, expiresAt });
    return stamped;
  }

  const supabase = createAdminClient();
  const basis = room.dbUpdatedAtIso;
  const payload = {
    code: normalized,
    state: stripDbStamp({ ...room, code: normalized }),
    expires_at: new Date(expiresAt).toISOString(),
  };

  if (basis) {
    const { data, error } = await supabase
      .from("blackjack_rooms")
      .update({
        state: payload.state,
        expires_at: payload.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("code", normalized)
      .eq("updated_at", basis)
      .select("updated_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new BlackjackRoomConflictError();
    return { ...room, code: normalized, dbUpdatedAtIso: data.updated_at as string };
  }

  const { data, error } = await supabase
    .from("blackjack_rooms")
    .upsert(payload)
    .select("updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return {
    ...room,
    code: normalized,
    dbUpdatedAtIso: (data?.updated_at as string | undefined) ?? new Date().toISOString(),
  };
}

export async function persistNewBlackjackRoom(room: BlackjackRoom): Promise<BlackjackRoom> {
  const existing = await loadBlackjackRoom(room.code);
  if (existing) throw new Error("Room code already in use");
  return saveBlackjackRoom({ ...room, dbUpdatedAtIso: undefined });
}

export async function mutateBlackjackRoom(
  code: string,
  mutate: (room: BlackjackRoom) => BlackjackRoom,
): Promise<BlackjackRoom> {
  const normalized = code.toUpperCase();
  let lastConflict: BlackjackRoomConflictError | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadBlackjackRoom(normalized);
    if (!loaded) throw new Error("Room not found");
    const next = mutate(loaded);
    try {
      return await saveBlackjackRoom(next);
    } catch (err) {
      if (err instanceof BlackjackRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }
  throw lastConflict ?? new BlackjackRoomConflictError("Too many concurrent room updates");
}

export function clearBlackjackRoomsForTests(): void {
  memoryRooms().clear();
}
