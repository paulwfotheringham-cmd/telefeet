import { createAdminClient } from "@/lib/supabase/admin";
import { ROOM_TTL_MS, tickDrawRoom, type DrawRoom } from "./room";

export class DrawStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DrawStoreUnavailableError";
  }
}

export class DrawRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "DrawRoomConflictError";
  }
}

type MemoryEntry = { room: DrawRoom; expiresAt: number };

const memoryGlobal = globalThis as typeof globalThis & {
  __drawTheWeaponRooms?: Map<string, MemoryEntry>;
};

function memoryRooms(): Map<string, MemoryEntry> {
  if (!memoryGlobal.__drawTheWeaponRooms) memoryGlobal.__drawTheWeaponRooms = new Map();
  return memoryGlobal.__drawTheWeaponRooms;
}

export function drawStoreMode(): "supabase" | "memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "memory";
}

function usesSupabase(): boolean {
  return drawStoreMode() === "supabase";
}

function stripDbStamp(room: DrawRoom): DrawRoom {
  const next = { ...room };
  delete next.dbUpdatedAtIso;
  return next;
}

async function broadcastDrawSync(roomCode: string): Promise<void> {
  if (!usesSupabase()) return;
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(`draw-the-weapon:${roomCode}`, {
      config: { broadcast: { ack: false, self: false } },
    });
    await new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        if (status === "CHANNEL_ERROR") reject(new Error("Realtime channel error"));
      });
    });
    await channel.send({ type: "broadcast", event: "sync", payload: { t: Date.now() } });
    await supabase.removeChannel(channel);
  } catch {
    /* Clients still poll */
  }
}

async function loadFromSupabase(code: string): Promise<DrawRoom | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("draw_the_weapon_rooms")
    .select("state, updated_at, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("draw_the_weapon_rooms").delete().eq("code", code);
    return null;
  }
  const room = data.state as DrawRoom;
  room.dbUpdatedAtIso = data.updated_at as string;
  return room;
}

function loadFromMemory(code: string): DrawRoom | null {
  const entry = memoryRooms().get(code);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryRooms().delete(code);
    return null;
  }
  return structuredClone(entry.room);
}

export async function loadDrawRoom(code: string): Promise<DrawRoom | null> {
  const normalized = code.toUpperCase();
  return usesSupabase() ? loadFromSupabase(normalized) : loadFromMemory(normalized);
}

async function saveDrawRoom(room: DrawRoom): Promise<DrawRoom> {
  const normalized = room.code.toUpperCase();
  const expiresAt = Date.now() + ROOM_TTL_MS;
  if (!usesSupabase()) {
    const stamped: DrawRoom = { ...room, code: normalized };
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
      .from("draw_the_weapon_rooms")
      .update({ state: payload.state, expires_at: payload.expires_at, updated_at: new Date().toISOString() })
      .eq("code", normalized)
      .eq("updated_at", basis)
      .select("updated_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new DrawRoomConflictError();
    const saved = { ...room, code: normalized, dbUpdatedAtIso: data.updated_at as string };
    await broadcastDrawSync(normalized);
    return saved;
  }
  const { data, error } = await supabase.from("draw_the_weapon_rooms").upsert(payload).select("updated_at").maybeSingle();
  if (error) throw new Error(error.message);
  const saved = {
    ...room,
    code: normalized,
    dbUpdatedAtIso: (data?.updated_at as string | undefined) ?? new Date().toISOString(),
  };
  await broadcastDrawSync(normalized);
  return saved;
}

export async function persistNewDrawRoom(room: DrawRoom): Promise<DrawRoom> {
  const existing = await loadDrawRoom(room.code);
  if (existing) throw new Error("Room code already in use");
  return saveDrawRoom({ ...room, dbUpdatedAtIso: undefined });
}

export async function saveTickedDrawRoom(code: string): Promise<DrawRoom> {
  const loaded = await loadDrawRoom(code);
  if (!loaded) throw new Error("Room not found");
  const ticked = tickDrawRoom(loaded);
  if (ticked === loaded) return loaded;
  return mutateDrawRoom(code, (room) => tickDrawRoom(room));
}

export async function mutateDrawRoom(code: string, mutate: (room: DrawRoom) => DrawRoom): Promise<DrawRoom> {
  const normalized = code.toUpperCase();
  let lastConflict: DrawRoomConflictError | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadDrawRoom(normalized);
    if (!loaded) throw new Error("Room not found");
    const next = mutate(tickDrawRoom(loaded));
    try {
      return await saveDrawRoom(next);
    } catch (err) {
      if (err instanceof DrawRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }
  throw lastConflict ?? new DrawRoomConflictError("Too many concurrent room updates");
}
