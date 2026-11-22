export const ROOM_DIRECTORIES = [
  { id: "funquiz", path: "/funquiz", nameKey: "funquiz-player-name" },
  { id: "movie", path: "/name-that-movie", nameKey: "name-that-movie-player-name" },
  { id: "tune", path: "/name-that-tune", nameKey: "name-that-tune-player-name" },
  { id: "show", path: "/name-that-show", nameKey: "name-that-show-player-name" },
  { id: "game", path: "/name-that-game", nameKey: "name-that-game-player-name" },
  { id: "organ", path: "/draw-the-organ", nameKey: "draw-the-organ-player-name" },
  { id: "animal", path: "/draw-the-animal", nameKey: "draw-the-animal-player-name" },
  { id: "country", path: "/draw-the-country", nameKey: "draw-the-country-player-name" },
  { id: "continent", path: "/draw-the-continent", nameKey: "draw-the-continent-player-name" },
  { id: "appliance", path: "/draw-the-appliance", nameKey: "draw-the-appliance-player-name" },
  { id: "landmark", path: "/draw-the-landmark", nameKey: "draw-the-landmark-player-name" },
  { id: "flower", path: "/draw-the-flower", nameKey: "draw-the-flower-player-name" },
  { id: "weapon", path: "/draw-the-weapon", nameKey: "draw-the-weapon-player-name" },
  { id: "geography", path: "/draw-the-geography", nameKey: "draw-the-geography-player-name" },
] as const;

export type RoomDirectoryId = (typeof ROOM_DIRECTORIES)[number]["id"];

export function roomDirectory(id: string) {
  return ROOM_DIRECTORIES.find((entry) => entry.id === id) ?? null;
}

/** Send the player to the game that owns this code. Returns true when navigation starts. */
export async function openRoomByCode(code: string, name: string, currentPath: string): Promise<boolean> {
  const res = await fetch(`/api/room-code/${encodeURIComponent(code)}`, { cache: "no-store" });
  if (!res.ok) return false;
  const body = (await res.json()) as { path?: string; nameKey?: string };
  if (!body.path || body.path === currentPath) return false;
  const trimmed = name.trim();
  if (trimmed && body.nameKey) localStorage.setItem(body.nameKey, trimmed);
  window.location.assign(`${body.path}?join=${encodeURIComponent(code)}`);
  return true;
}
