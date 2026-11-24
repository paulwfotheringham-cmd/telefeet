export const CLUB_TOKEN_KEY = "funquiz-account-token";

export const CLUB_PLAYER_KEYS = [
  "funquiz",
  "name-that-movie",
  "name-that-star",
  "name-that-tune",
  "name-that-show",
  "name-that-game",
  "draw-the-organ",
  "draw-the-animal",
  "draw-the-country",
  "draw-the-continent",
  "draw-the-appliance",
  "draw-the-instrument",
  "draw-the-landmark",
  "draw-the-flower",
  "draw-the-weapon",
  "draw-the-geography",
  "draw-the-myth",
  "draw-the-fast-food",
];

export type ClubSession = { id: string; email: string; name: string; token: string };

export function clubToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CLUB_TOKEN_KEY) ?? "";
}

export function clubAuthHeaders(): HeadersInit {
  return { Authorization: `Bearer ${clubToken()}`, "Content-Type": "application/json" };
}

export function rememberClubPlayer(account: { id: string; name: string }) {
  for (const key of CLUB_PLAYER_KEYS) {
    localStorage.setItem(`${key}-player-id`, account.id);
    localStorage.setItem(`${key}-player-name`, account.name);
  }
}

export function saveClubSession(session: ClubSession) {
  localStorage.setItem(CLUB_TOKEN_KEY, session.token);
  rememberClubPlayer(session);
}

export function clearClubSession() {
  localStorage.removeItem(CLUB_TOKEN_KEY);
}
