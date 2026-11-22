import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { weeklyGame } from "./weekly";

const ONLINE_MS = 40_000;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const CHALLENGE_MS = 2 * 60 * 60 * 1000;

export type ClubAccount = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  lastSeen: string | null;
  currentPath: string;
  roomCode: string;
};

export type ClubScore = {
  id: string;
  accountId: string;
  game: string;
  matchKey: string;
  score: number;
  won: boolean;
  weekly: boolean;
  playedAt: string;
};

export type ClubChallenge = {
  id: string;
  fromId: string;
  toId: string;
  game: string;
  path: string;
  roomCode: string;
  createdAt: string;
};

type Memory = {
  accounts: Map<string, ClubAccount>;
  sessions: Map<string, { accountId: string; expiresAt: number }>;
  scores: ClubScore[];
  challenges: ClubChallenge[];
  weeklyRooms: Map<string, { game: string; weekStart: string }>;
};

const memoryGlobal = globalThis as typeof globalThis & { __funquizClub?: Memory };

function memory(): Memory {
  if (!memoryGlobal.__funquizClub) {
    memoryGlobal.__funquizClub = {
      accounts: new Map(),
      sessions: new Map(),
      scores: [],
      challenges: [],
      weeklyRooms: new Map(),
    };
  }
  return memoryGlobal.__funquizClub;
}

function usesSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const previous = Buffer.from(hash, "hex");
  if (next.length !== previous.length) return false;
  return timingSafeEqual(next, previous);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateCredentials(email: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 72) return "Password is too long.";
  return null;
}

function displayName(email: string, taken: Set<string>) {
  const raw = email.split("@")[0]?.replace(/[^a-z0-9]+/gi, " ").trim() || "Player";
  const base = raw.slice(0, 24);
  let name = base;
  let extra = 2;
  while (taken.has(name.toLowerCase())) {
    name = `${base.slice(0, 20)}${extra}`;
    extra += 1;
  }
  return name;
}

function publicAccount(account: ClubAccount) {
  return { id: account.id, email: account.email, name: account.name };
}

function gameLabel(path: string) {
  if (path.startsWith("/funquiz")) return "Fun Quiz";
  if (path.startsWith("/name-that-movie")) return "Name That Movie";
  if (path.startsWith("/name-that-tune")) return "Name That Tune";
  if (path.startsWith("/name-that-show")) return "Name That Show";
  if (path.startsWith("/name-that-game")) return "Name That Game";
  if (path.startsWith("/draw-the-")) {
    const slug = path.slice("/draw-the-".length).split("/")[0] ?? "";
    const titled = slug.split("-").filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
    return titled ? `Draw the ${titled}` : "A game";
  }
  return "Online";
}

async function issueSession(accountId: string) {
  const token = randomBytes(32).toString("base64url");
  const hash = tokenHash(token);
  const expiresAt = Date.now() + SESSION_MS;
  if (!usesSupabase()) {
    memory().sessions.set(hash, { accountId, expiresAt });
    return token;
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("funquiz_sessions").insert({
    token_hash: hash,
    account_id: accountId,
    expires_at: new Date(expiresAt).toISOString(),
  });
  if (error) throw new Error(error.message);
  return token;
}

export async function signup(emailRaw: string, password: string) {
  const email = normalizeEmail(emailRaw);
  const problem = validateCredentials(email, password);
  if (problem) return { error: problem, status: 400 as const };
  if (!usesSupabase()) {
    const store = memory();
    if ([...store.accounts.values()].some((account) => account.email === email)) {
      return { error: "That email already has an account. Log in instead.", status: 409 as const };
    }
    const taken = new Set([...store.accounts.values()].map((account) => account.name.toLowerCase()));
    const account: ClubAccount = {
      id: crypto.randomUUID(),
      email,
      name: displayName(email, taken),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      lastSeen: null,
      currentPath: "",
      roomCode: "",
    };
    store.accounts.set(account.id, account);
    const token = await issueSession(account.id);
    return { token, account: publicAccount(account) };
  }
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from("funquiz_accounts").select("id").eq("email", email).maybeSingle();
  if (existing) return { error: "That email already has an account. Log in instead.", status: 409 as const };
  const { data: names } = await supabase.from("funquiz_accounts").select("name");
  const taken = new Set((names ?? []).map((row) => String(row.name).toLowerCase()));
  const name = displayName(email, taken);
  const { data, error } = await supabase
    .from("funquiz_accounts")
    .insert({ email, name, password_hash: hashPassword(password) })
    .select("id, email, name")
    .single();
  if (error || !data) return { error: error?.message ?? "Could not create the account.", status: 500 as const };
  const token = await issueSession(data.id);
  return { token, account: { id: data.id as string, email: data.email as string, name: data.name as string } };
}

export async function login(emailRaw: string, password: string) {
  const email = normalizeEmail(emailRaw);
  const problem = validateCredentials(email, password);
  if (problem) return { error: problem, status: 400 as const };
  if (!usesSupabase()) {
    const account = [...memory().accounts.values()].find((item) => item.email === email);
    if (!account || !checkPassword(password, account.passwordHash)) {
      return { error: "Email or password is wrong.", status: 401 as const };
    }
    const token = await issueSession(account.id);
    return { token, account: publicAccount(account) };
  }
  const supabase = createAdminClient();
  const { data } = await supabase.from("funquiz_accounts").select("id, email, name, password_hash").eq("email", email).maybeSingle();
  if (!data || !checkPassword(password, String(data.password_hash))) {
    return { error: "Email or password is wrong.", status: 401 as const };
  }
  const token = await issueSession(String(data.id));
  return { token, account: { id: String(data.id), email: String(data.email), name: String(data.name) } };
}

async function accountById(id: string): Promise<ClubAccount | null> {
  if (!usesSupabase()) return memory().accounts.get(id) ?? null;
  const supabase = createAdminClient();
  const { data } = await supabase.from("funquiz_accounts").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: String(data.id),
    email: String(data.email),
    name: String(data.name),
    passwordHash: String(data.password_hash),
    createdAt: String(data.created_at),
    lastSeen: data.last_seen ? String(data.last_seen) : null,
    currentPath: String(data.current_path ?? ""),
    roomCode: String(data.room_code ?? ""),
  };
}

export async function accountFromToken(token: string) {
  const hash = tokenHash(token);
  if (!usesSupabase()) {
    const session = memory().sessions.get(hash);
    if (!session || session.expiresAt < Date.now()) return null;
    return accountById(session.accountId);
  }
  const supabase = createAdminClient();
  const { data } = await supabase.from("funquiz_sessions").select("account_id, expires_at").eq("token_hash", hash).maybeSingle();
  if (!data || Date.parse(String(data.expires_at)) < Date.now()) return null;
  return accountById(String(data.account_id));
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

export async function touchPresence(token: string, path: string, roomCode: string) {
  const account = await accountFromToken(token);
  if (!account) return { error: "Sign in again.", status: 401 as const };
  const seen = new Date().toISOString();
  const cleanPath = path.slice(0, 120);
  const cleanRoom = roomCode.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  if (!usesSupabase()) {
    const stored = memory().accounts.get(account.id);
    if (stored) {
      stored.lastSeen = seen;
      stored.currentPath = cleanPath;
      stored.roomCode = cleanRoom;
    }
    return { ok: true };
  }
  const supabase = createAdminClient();
  await supabase.from("funquiz_accounts").update({
    last_seen: seen,
    current_path: cleanPath,
    room_code: cleanRoom,
  }).eq("id", account.id);
  return { ok: true };
}

export async function markWeeklyRoom(roomCode: string, game: string) {
  const week = weeklyGame().weekStart;
  if (!usesSupabase()) {
    memory().weeklyRooms.set(roomCode, { game, weekStart: week });
    return;
  }
  const supabase = createAdminClient();
  await supabase.from("funquiz_weekly_rooms").upsert({ room_code: roomCode, game, week_start: week });
}

async function weeklyRoom(roomCode: string) {
  const week = weeklyGame();
  if (!usesSupabase()) {
    const row = memory().weeklyRooms.get(roomCode);
    if (!row || row.weekStart !== week.weekStart || row.game !== week.title) return false;
    return true;
  }
  const supabase = createAdminClient();
  const { data } = await supabase.from("funquiz_weekly_rooms").select("game, week_start").eq("room_code", roomCode).maybeSingle();
  return Boolean(data && data.game === week.title && String(data.week_start).slice(0, 10) === week.weekStart);
}

export async function recordScore(token: string, input: { game: string; roomCode: string; score: number; won: boolean }) {
  const account = await accountFromToken(token);
  if (!account) return { error: "Sign in again.", status: 401 as const };
  const game = input.game.trim().slice(0, 80);
  const roomCode = input.roomCode.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  if (!game || roomCode.length !== 6 || !Number.isFinite(input.score)) {
    return { error: "Score could not be saved.", status: 400 as const };
  }
  const score = Math.max(0, Math.round(input.score));
  const matchKey = `${game}:${roomCode}:${score}`;
  const weekly = await weeklyRoom(roomCode);
  if (!usesSupabase()) {
    const store = memory();
    if (!store.scores.some((row) => row.accountId === account.id && row.matchKey === matchKey)) {
      store.scores.push({
        id: crypto.randomUUID(),
        accountId: account.id,
        game,
        matchKey,
        score,
        won: input.won,
        weekly,
        playedAt: new Date().toISOString(),
      });
    }
    return { ok: true };
  }
  const supabase = createAdminClient();
  await supabase.from("funquiz_scores").upsert({
    account_id: account.id,
    game,
    match_key: matchKey,
    score,
    won: input.won,
    weekly,
    played_at: new Date().toISOString(),
  }, { onConflict: "account_id,match_key", ignoreDuplicates: true });
  return { ok: true };
}

export async function createChallenge(token: string, input: { toId: string; game: string; path: string; roomCode: string }) {
  const account = await accountFromToken(token);
  if (!account) return { error: "Sign in again.", status: 401 as const };
  const roomCode = input.roomCode.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  const path = input.path.split("?")[0] ?? "";
  const allowedPath = path === "/funquiz" || path.startsWith("/draw-the-") || path.startsWith("/name-that-");
  if (!input.toId || input.toId === account.id || roomCode.length !== 6 || !allowedPath || path.includes("//")) {
    return { error: "Could not send the challenge.", status: 400 as const };
  }
  const row: ClubChallenge = {
    id: crypto.randomUUID(),
    fromId: account.id,
    toId: input.toId,
    game: input.game.slice(0, 80),
    path: path.slice(0, 80),
    roomCode,
    createdAt: new Date().toISOString(),
  };
  if (!usesSupabase()) {
    memory().challenges.push(row);
    return { ok: true, roomCode };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("funquiz_challenges").insert({
    id: row.id,
    from_id: row.fromId,
    to_id: row.toId,
    game: row.game,
    path: row.path,
    room_code: row.roomCode,
  });
  if (error) return { error: error.message, status: 500 as const };
  return { ok: true, roomCode };
}

async function allAccounts(): Promise<ClubAccount[]> {
  if (!usesSupabase()) return [...memory().accounts.values()];
  const supabase = createAdminClient();
  const { data } = await supabase.from("funquiz_accounts").select("*");
  return (data ?? []).map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: "",
    createdAt: String(row.created_at),
    lastSeen: row.last_seen ? String(row.last_seen) : null,
    currentPath: String(row.current_path ?? ""),
    roomCode: String(row.room_code ?? ""),
  }));
}

async function allScores(): Promise<ClubScore[]> {
  if (!usesSupabase()) return memory().scores;
  const supabase = createAdminClient();
  const { data } = await supabase.from("funquiz_scores").select("*").order("played_at", { ascending: false }).limit(2000);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    accountId: String(row.account_id),
    game: String(row.game),
    matchKey: String(row.match_key),
    score: Number(row.score),
    won: Boolean(row.won),
    weekly: Boolean(row.weekly),
    playedAt: String(row.played_at),
  }));
}

async function challengesFor(accountId: string): Promise<ClubChallenge[]> {
  const cutoff = Date.now() - CHALLENGE_MS;
  if (!usesSupabase()) {
    return memory().challenges.filter((row) => row.toId === accountId && Date.parse(row.createdAt) >= cutoff);
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("funquiz_challenges")
    .select("*")
    .eq("to_id", accountId)
    .gte("created_at", new Date(cutoff).toISOString())
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    fromId: String(row.from_id),
    toId: String(row.to_id),
    game: String(row.game),
    path: String(row.path),
    roomCode: String(row.room_code),
    createdAt: String(row.created_at),
  }));
}

export async function clubHome(token: string) {
  const account = await accountFromToken(token);
  if (!account) return { error: "Sign in again.", status: 401 as const };
  const [accounts, scores, challenges] = await Promise.all([
    allAccounts(),
    allScores(),
    challengesFor(account.id),
  ]);
  const names = new Map(accounts.map((item) => [item.id, item.name]));
  const now = Date.now();
  const online = accounts
    .filter((item) => item.id !== account.id && item.lastSeen && now - Date.parse(item.lastSeen) < ONLINE_MS)
    .map((item) => ({
      id: item.id,
      name: item.name,
      game: gameLabel(item.currentPath),
      path: item.currentPath || "/funquiz",
      roomCode: item.roomCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const totals = new Map<string, { name: string; points: number; wins: number; games: number }>();
  for (const item of accounts) totals.set(item.id, { name: item.name, points: 0, wins: 0, games: 0 });
  for (const row of scores) {
    const total = totals.get(row.accountId);
    if (!total) continue;
    total.points += row.score;
    total.games += 1;
    if (row.won) total.wins += 1;
  }
  const board = [...totals.values()].sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
  const recent = [...scores].sort((a, b) => b.playedAt.localeCompare(a.playedAt)).slice(0, 12).map((row) => ({
    name: names.get(row.accountId) ?? "Player",
    game: row.game,
    score: row.score,
    playedAt: row.playedAt,
  }));
  const week = weeklyGame();
  const best = new Map<string, number>();
  for (const row of scores) {
    if (!row.weekly || row.game !== week.title || row.playedAt.slice(0, 10) < week.weekStart) continue;
    best.set(row.accountId, Math.max(best.get(row.accountId) ?? 0, row.score));
  }
  const leaders = [...best.entries()]
    .map(([id, score]) => ({ name: names.get(id) ?? "Player", score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return {
    me: publicAccount(account),
    online,
    board,
    recent,
    weekly: { title: week.title, path: week.path, ends: week.ends, leaders },
    challenges: challenges.map((row) => ({
      id: row.id,
      fromName: names.get(row.fromId) ?? "A friend",
      game: row.game,
      path: row.path,
      roomCode: row.roomCode,
    })),
  };
}
