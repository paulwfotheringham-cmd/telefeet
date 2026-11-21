import { createAdminClient } from "@/lib/supabase/admin";
import { ROOM_TTL_MS, tickTuneRoom, type TuneRoom } from "./room";

export class TuneStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TuneStoreUnavailableError";
  }
}

export class TuneRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "TuneRoomConflictError";
  }
}

type MemoryEntry = { room: TuneRoom; expiresAt: number };

const memoryGlobal = globalThis as typeof globalThis & {
  __nameThatTuneRooms?: Map<string, MemoryEntry>;
};

function memoryRooms(): Map<string, MemoryEntry> {
  if (!memoryGlobal.__nameThatTuneRooms) {
    memoryGlobal.__nameThatTuneRooms = new Map();
  }
  return memoryGlobal.__nameThatTuneRooms;
}

export function tuneStoreMode(): "supabase" | "memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : "memory";
}

function usesSupabase(): boolean {
  return tuneStoreMode() === "supabase";
}

function stripDbStamp(room: TuneRoom): TuneRoom {
  const next = { ...room };
  delete next.dbUpdatedAtIso;
  return next;
}

async function broadcastTuneSync(roomCode: string): Promise<void> {
  if (!usesSupabase()) return;
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(`name-that-tune:${roomCode}`, {
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

async function loadFromSupabase(code: string): Promise<TuneRoom | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("name_that_tune_rooms")
    .select("state, updated_at, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("name_that_tune_rooms").delete().eq("code", code);
    return null;
  }
  const room = data.state as TuneRoom;
  room.dbUpdatedAtIso = data.updated_at as string;
  return room;
}

function loadFromMemory(code: string): TuneRoom | null {
  const entry = memoryRooms().get(code);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryRooms().delete(code);
    return null;
  }
  return structuredClone(entry.room);
}

export async function loadTuneRoom(code: string): Promise<TuneRoom | null> {
  const normalized = code.toUpperCase();
  return usesSupabase() ? loadFromSupabase(normalized) : loadFromMemory(normalized);
}

async function saveTuneRoom(room: TuneRoom): Promise<TuneRoom> {
  const normalized = room.code.toUpperCase();
  const expiresAt = Date.now() + ROOM_TTL_MS;
  if (!usesSupabase()) {
    const stamped: TuneRoom = { ...room, code: normalized };
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
      .from("name_that_tune_rooms")
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
    if (!data) throw new TuneRoomConflictError();
    const saved = { ...room, code: normalized, dbUpdatedAtIso: data.updated_at as string };
    await broadcastTuneSync(normalized);
    return saved;
  }

  const { data, error } = await supabase
    .from("name_that_tune_rooms")
    .upsert(payload)
    .select("updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const saved = {
    ...room,
    code: normalized,
    dbUpdatedAtIso: (data?.updated_at as string | undefined) ?? new Date().toISOString(),
  };
  await broadcastTuneSync(normalized);
  return saved;
}

export async function persistNewTuneRoom(room: TuneRoom): Promise<TuneRoom> {
  const existing = await loadTuneRoom(room.code);
  if (existing) {
    throw new Error("Room code already in use");
  }
  return saveTuneRoom({ ...room, dbUpdatedAtIso: undefined });
}

export async function saveTickedTuneRoom(code: string): Promise<TuneRoom> {
  const loaded = await loadTuneRoom(code);
  if (!loaded) throw new Error("Room not found");
  const ticked = tickTuneRoom(loaded);
  if (ticked === loaded) return loaded;
  return mutateTuneRoom(code, (room) => tickTuneRoom(room));
}

export async function mutateTuneRoom(
  code: string,
  mutate: (room: TuneRoom) => TuneRoom,
): Promise<TuneRoom> {
  const normalized = code.toUpperCase();
  let lastConflict: TuneRoomConflictError | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadTuneRoom(normalized);
    if (!loaded) throw new Error("Room not found");
    const current = tickTuneRoom(loaded);
    const next = mutate(current);
    try {
      return await saveTuneRoom(next);
    } catch (err) {
      if (err instanceof TuneRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }
  throw lastConflict ?? new TuneRoomConflictError("Too many concurrent room updates");
}

export function clearTuneRoomsForTests(): void {
  memoryRooms().clear();
}
