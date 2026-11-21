import { createAdminClient } from "@/lib/supabase/admin";
import { ROOM_TTL_MS, tickShowRoom, type ShowRoom } from "./room";

export class ShowStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowStoreUnavailableError";
  }
}

export class ShowRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "ShowRoomConflictError";
  }
}

type MemoryEntry = { room: ShowRoom; expiresAt: number };

const memoryGlobal = globalThis as typeof globalThis & {
  __nameThatShowRooms?: Map<string, MemoryEntry>;
};

function memoryRooms(): Map<string, MemoryEntry> {
  if (!memoryGlobal.__nameThatShowRooms) {
    memoryGlobal.__nameThatShowRooms = new Map();
  }
  return memoryGlobal.__nameThatShowRooms;
}

export function showStoreMode(): "supabase" | "memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : "memory";
}

function usesSupabase(): boolean {
  return showStoreMode() === "supabase";
}

function stripDbStamp(room: ShowRoom): ShowRoom {
  const next = { ...room };
  delete next.dbUpdatedAtIso;
  return next;
}

async function broadcastShowSync(roomCode: string): Promise<void> {
  if (!usesSupabase()) return;
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(`name-that-show:${roomCode}`, {
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

async function loadFromSupabase(code: string): Promise<ShowRoom | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("name_that_show_rooms")
    .select("state, updated_at, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("name_that_show_rooms").delete().eq("code", code);
    return null;
  }
  const room = data.state as ShowRoom;
  room.dbUpdatedAtIso = data.updated_at as string;
  return room;
}

function loadFromMemory(code: string): ShowRoom | null {
  const entry = memoryRooms().get(code);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryRooms().delete(code);
    return null;
  }
  return structuredClone(entry.room);
}

export async function loadShowRoom(code: string): Promise<ShowRoom | null> {
  const normalized = code.toUpperCase();
  return usesSupabase() ? loadFromSupabase(normalized) : loadFromMemory(normalized);
}

async function saveShowRoom(room: ShowRoom): Promise<ShowRoom> {
  const normalized = room.code.toUpperCase();
  const expiresAt = Date.now() + ROOM_TTL_MS;
  if (!usesSupabase()) {
    const stamped: ShowRoom = { ...room, code: normalized };
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
      .from("name_that_show_rooms")
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
    if (!data) throw new ShowRoomConflictError();
    const saved = { ...room, code: normalized, dbUpdatedAtIso: data.updated_at as string };
    await broadcastShowSync(normalized);
    return saved;
  }

  const { data, error } = await supabase
    .from("name_that_show_rooms")
    .upsert(payload)
    .select("updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const saved = {
    ...room,
    code: normalized,
    dbUpdatedAtIso: (data?.updated_at as string | undefined) ?? new Date().toISOString(),
  };
  await broadcastShowSync(normalized);
  return saved;
}

export async function persistNewShowRoom(room: ShowRoom): Promise<ShowRoom> {
  const existing = await loadShowRoom(room.code);
  if (existing) {
    throw new Error("Room code already in use");
  }
  return saveShowRoom({ ...room, dbUpdatedAtIso: undefined });
}

export async function saveTickedShowRoom(code: string): Promise<ShowRoom> {
  const loaded = await loadShowRoom(code);
  if (!loaded) throw new Error("Room not found");
  const ticked = tickShowRoom(loaded);
  if (ticked === loaded) return loaded;
  return mutateShowRoom(code, (room) => tickShowRoom(room));
}

export async function mutateShowRoom(
  code: string,
  mutate: (room: ShowRoom) => ShowRoom,
): Promise<ShowRoom> {
  const normalized = code.toUpperCase();
  let lastConflict: ShowRoomConflictError | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadShowRoom(normalized);
    if (!loaded) throw new Error("Room not found");
    const current = tickShowRoom(loaded);
    const next = mutate(current);
    try {
      return await saveShowRoom(next);
    } catch (err) {
      if (err instanceof ShowRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }
  throw lastConflict ?? new ShowRoomConflictError("Too many concurrent room updates");
}

export function clearShowRoomsForTests(): void {
  memoryRooms().clear();
}
