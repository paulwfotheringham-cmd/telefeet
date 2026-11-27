"use client";

const PREFIX = "games311:";

export const STORAGE_KEYS = {
  visitorId: `${PREFIX}visitor_id`,
  sessionId: `${PREFIX}session_id`,
  consent: `${PREFIX}consent`,
  feedbackStatus: `${PREFIX}feedback_status`,
  activeMs: `${PREFIX}active_ms`,
  visitCount: `${PREFIX}visit_count`,
} as const;

export type ConsentValue = "accepted" | "declined";
export type FeedbackStatus = "pending" | "eligible" | "shown" | "submitted" | "dismissed";

function canUseStorage(store: Storage | undefined): store is Storage {
  if (!store) return false;
  try {
    const k = `${PREFIX}__probe`;
    store.setItem(k, "1");
    store.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (canUseStorage(window.localStorage)) {
      const v = window.localStorage.getItem(key);
      if (v != null) return v;
    }
    if (canUseStorage(window.sessionStorage)) {
      return window.sessionStorage.getItem(key);
    }
  } catch {
    /* private mode / blocked */
  }
  return null;
}

export function writeStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (canUseStorage(window.localStorage)) {
      window.localStorage.setItem(key, value);
      return true;
    }
    if (canUseStorage(window.sessionStorage)) {
      window.sessionStorage.setItem(key, value);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
