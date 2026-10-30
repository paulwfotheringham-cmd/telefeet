import { ROOM_CODE_LENGTH } from "./constants";

/** Strip spaces, dashes, and other separators; uppercase; max 6 chars (Fun Quiz room codes). */
export function normalizeRoomCode(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(normalized: string): boolean {
  return normalized.length === ROOM_CODE_LENGTH && /^[A-Z0-9]+$/.test(normalized);
}

/** Visual spacing only — always copy/share with {@link normalizeRoomCode} instead. */
export function formatRoomCodeSpaced(normalized: string): string {
  return normalizeRoomCode(normalized).split("").join(" ");
}
