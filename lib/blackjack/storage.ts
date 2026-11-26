import { STARTING_BALANCE } from "./constants";
import type { SessionStats } from "./types";

const STORAGE_KEY = "blackjack-session-v1";
const NAME_KEY = "blackjack-player-name";

export function defaultStats(balance = STARTING_BALANCE): SessionStats {
  return {
    balance,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    sessionPl: 0,
    startedAt: Date.now(),
  };
}

export function loadStats(): SessionStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as SessionStats;
    if (typeof parsed.balance !== "number") return defaultStats();
    return {
      ...defaultStats(parsed.balance),
      ...parsed,
      balance: Math.max(0, parsed.balance),
    };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: SessionStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function loadPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY)?.trim() ?? "";
}

export function savePlayerName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name.trim());
}