import { createAdminClient } from "@/lib/supabase/admin";
import { ROOM_TTL_MS, tickGameRoom, type GameRoom } from "./room";

export class GameStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameStoreUnavailableError";
  }
}

export class GameRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "GameRoomConflictError";
  }
}

type MemoryEntry = { room: GameRoom; expiresAt: number };

const memoryGlobal = globalThis as typeof globalThis & {
  __nameThatGameRooms?: Map<string, MemoryEntry>;
};

function memoryRooms(): Map<string, MemoryEntry> {
  if (!memoryGlobal.__nameThatGameRooms) {
    memoryGlobal.__nameThatGameRooms = new Map();
  }
  return memoryGlobal.__nameThatGameRooms;
}

export function gameStoreMode(): "supabase" | "memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : "memory";
}

function usesSupabase(): boolean {
  return gameStoreMode() === "supabase";
}

function stripDbStamp(room: GameRoom): GameRoom {
  const next = { ...room };
  delete next.dbUpdatedAtIso;
  return next;
}

async function broadcastGameSync(roomCode: string): Promise<void> {
  if (!usesSupabase()) return;
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(`name-that-game:${roomCode}`, {
      config: { broadcast: { ack: false, self: false } },
    });
    await new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        if (status === "CHANNEL_ERROR") reject(new Error("Realtime channel error"));
      });
    });
    await channel.send({
      type: "broadcast",
      event: "sync",
      payload: { t: Date.now() },
    });
    await supabase.removeChannel(channel);
  } catch {
    /* Clients still poll */
  }
}

async function loadFromSupabase(code: string): Promise<GameRoom | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("name_that_game_rooms")
    .select("state, updated_at, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("name_that_game_rooms").delete().eq("code", code);
    return null;
  }
  const room = data.state as GameRoom;
  room.dbUpdatedAtIso = data.updated_at as string;
  return room;
}

function loadFromMemory(code: string): GameRoom | null {
  const entry = memoryRooms().get(code);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryRooms().delete(code);
    return null;
  }
  return structuredClone(entry.room);
}

export async function loadGameRoom(code: string): Promise<GameRoom | null> {
  const normalized = code.toUpperCase();
  return usesSupabase() ? loadFromSupabase(normalized) : loadFromMemory(normalized);
}

async function saveGameRoom(room: GameRoom): Promise<GameRoom> {
  const normalized = room.code.toUpperCase();
  const expiresAt = Date.now() + ROOM_TTL_MS;
  if (!usesSupabase()) {
    const stamped: GameRoom = { ...room, code: normalized };
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
      .from("name_that_game_rooms")
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
    if (!data) throw new GameRoomConflictError();
    const saved = { ...room, code: normalized, dbUpdatedAtIso: data.updated_at as string };
    await broadcastGameSync(normalized);
    return saved;
  }

  const { data, error } = await supabase
    .from("name_that_game_rooms")
    .upsert(payload)
    .select("updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const saved = {
    ...room,
    code: normalized,
    dbUpdatedAtIso: (data?.updated_at as string | undefined) ?? new Date().toISOString(),
  };
  await broadcastGameSync(normalized);
  return saved;
}

export async function persistNewGameRoom(room: GameRoom): Promise<GameRoom> {
  const existing = await loadGameRoom(room.code);
  if (existing) {
    throw new Error("Room code already in use");
  }
  return saveGameRoom({ ...room, dbUpdatedAtIso: undefined });
}

export async function saveTickedGameRoom(code: string): Promise<GameRoom> {
  const loaded = await loadGameRoom(code);
  if (!loaded) throw new Error("Room not found");
  const ticked = tickGameRoom(loaded);
  if (ticked === loaded) return loaded;
  return mutateGameRoom(code, (room) => tickGameRoom(room));
}

export async function mutateGameRoom(
  code: string,
  mutate: (room: GameRoom) => GameRoom,
): Promise<GameRoom> {
  const normalized = code.toUpperCase();
  let lastConflict: GameRoomConflictError | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadGameRoom(normalized);
    if (!loaded) throw new Error("Room not found");
    const current = tickGameRoom(loaded);
    const next = mutate(current);
    try {
      return await saveGameRoom(next);
    } catch (err) {
      if (err instanceof GameRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }
  throw lastConflict ?? new GameRoomConflictError("Too many concurrent room updates");
}

export function clearGameRoomsForTests(): void {
  memoryRooms().clear();
}
