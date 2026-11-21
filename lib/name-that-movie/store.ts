import { createAdminClient } from "@/lib/supabase/admin";
import { ROOM_TTL_MS, tickMovieRoom, type MovieRoom } from "./room";

export class MovieStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MovieStoreUnavailableError";
  }
}

export class MovieRoomConflictError extends Error {
  constructor(message = "Room was updated concurrently; retry the action") {
    super(message);
    this.name = "MovieRoomConflictError";
  }
}

type MemoryEntry = { room: MovieRoom; expiresAt: number };

const memoryGlobal = globalThis as typeof globalThis & {
  __nameThatMovieRooms?: Map<string, MemoryEntry>;
};

function memoryRooms(): Map<string, MemoryEntry> {
  if (!memoryGlobal.__nameThatMovieRooms) {
    memoryGlobal.__nameThatMovieRooms = new Map();
  }
  return memoryGlobal.__nameThatMovieRooms;
}

export function movieStoreMode(): "supabase" | "memory" {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : "memory";
}

function usesSupabase(): boolean {
  return movieStoreMode() === "supabase";
}

function stripDbStamp(room: MovieRoom): MovieRoom {
  const next = { ...room };
  delete next.dbUpdatedAtIso;
  return next;
}

async function broadcastMovieSync(roomCode: string): Promise<void> {
  if (!usesSupabase()) return;
  try {
    const supabase = createAdminClient();
    const channel = supabase.channel(`name-that-movie:${roomCode}`, {
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

async function loadFromSupabase(code: string): Promise<MovieRoom | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("name_that_movie_rooms")
    .select("state, updated_at, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  if (new Date(data.expires_at as string).getTime() < Date.now()) {
    await supabase.from("name_that_movie_rooms").delete().eq("code", code);
    return null;
  }
  const room = data.state as MovieRoom;
  room.dbUpdatedAtIso = data.updated_at as string;
  return room;
}

function loadFromMemory(code: string): MovieRoom | null {
  const entry = memoryRooms().get(code);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryRooms().delete(code);
    return null;
  }
  return structuredClone(entry.room);
}

export async function loadMovieRoom(code: string): Promise<MovieRoom | null> {
  const normalized = code.toUpperCase();
  return usesSupabase() ? loadFromSupabase(normalized) : loadFromMemory(normalized);
}

async function saveMovieRoom(room: MovieRoom): Promise<MovieRoom> {
  const normalized = room.code.toUpperCase();
  const expiresAt = Date.now() + ROOM_TTL_MS;
  if (!usesSupabase()) {
    const stamped: MovieRoom = { ...room, code: normalized };
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
      .from("name_that_movie_rooms")
      .update({ state: payload.state, expires_at: payload.expires_at, updated_at: new Date().toISOString() })
      .eq("code", normalized)
      .eq("updated_at", basis)
      .select("updated_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new MovieRoomConflictError();
    const saved = { ...room, code: normalized, dbUpdatedAtIso: data.updated_at as string };
    await broadcastMovieSync(normalized);
    return saved;
  }

  const { data, error } = await supabase
    .from("name_that_movie_rooms")
    .upsert(payload)
    .select("updated_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const saved = {
    ...room,
    code: normalized,
    dbUpdatedAtIso: (data?.updated_at as string | undefined) ?? new Date().toISOString(),
  };
  await broadcastMovieSync(normalized);
  return saved;
}

export async function persistNewMovieRoom(room: MovieRoom): Promise<MovieRoom> {
  const existing = await loadMovieRoom(room.code);
  if (existing) {
    throw new Error("Room code already in use");
  }
  return saveMovieRoom({ ...room, dbUpdatedAtIso: undefined });
}

/** Persist a reveal timeout when it is due. Idle polls leave the row untouched. */
export async function saveTickedMovieRoom(code: string): Promise<MovieRoom> {
  const loaded = await loadMovieRoom(code);
  if (!loaded) throw new Error("Room not found");
  const ticked = tickMovieRoom(loaded);
  if (ticked === loaded) return loaded;
  return mutateMovieRoom(code, (room) => tickMovieRoom(room));
}

export async function mutateMovieRoom(
  code: string,
  mutate: (room: MovieRoom) => MovieRoom,
): Promise<MovieRoom> {
  const normalized = code.toUpperCase();
  let lastConflict: MovieRoomConflictError | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const loaded = await loadMovieRoom(normalized);
    if (!loaded) throw new Error("Room not found");
    const current = tickMovieRoom(loaded);
    const next = mutate(current);
    try {
      return await saveMovieRoom(next);
    } catch (err) {
      if (err instanceof MovieRoomConflictError) {
        lastConflict = err;
        continue;
      }
      throw err;
    }
  }
  throw lastConflict ?? new MovieRoomConflictError("Too many concurrent room updates");
}

export function clearMovieRoomsForTests(): void {
  memoryRooms().clear();
}
