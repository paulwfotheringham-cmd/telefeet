import { Redis } from "@upstash/redis";
import type { QuizRoom } from "./types";
import { ROOM_TTL_SECONDS } from "./constants";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function redisKey(code: string) {
  return `funquiz:room:${code.toUpperCase()}`;
}

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redisUrl || !redisToken) return null;
  if (!redis) {
    redis = new Redis({ url: redisUrl, token: redisToken });
  }
  return redis;
}

type MemoryEntry = { room: QuizRoom; expiresAt: number };

const memoryRooms = new Map<string, MemoryEntry>();

function allowDevMemoryStore(): boolean {
  return process.env.NODE_ENV !== "production" && !getRedis();
}

export class QuizStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizStoreUnavailableError";
  }
}

export function isQuizStoreConfigured(): boolean {
  return Boolean(getRedis()) || allowDevMemoryStore();
}

export function quizStoreMode(): "redis" | "memory" | "none" {
  if (getRedis()) return "redis";
  if (allowDevMemoryStore()) return "memory";
  return "none";
}

export async function saveRoom(room: QuizRoom): Promise<void> {
  const key = redisKey(room.code);
  const payload = JSON.stringify(room);
  const client = getRedis();
  if (client) {
    await client.set(key, payload, { ex: ROOM_TTL_SECONDS });
    return;
  }
  if (allowDevMemoryStore()) {
    memoryRooms.set(key, {
      room,
      expiresAt: Date.now() + ROOM_TTL_SECONDS * 1000,
    });
    return;
  }
  throw new QuizStoreUnavailableError(
    "Multiplayer storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel.",
  );
}

export async function loadRoom(code: string): Promise<QuizRoom | null> {
  const key = redisKey(code);
  const client = getRedis();
  if (client) {
    const raw = await client.get<string>(key);
    if (!raw) return null;
    return typeof raw === "string" ? (JSON.parse(raw) as QuizRoom) : (raw as QuizRoom);
  }
  if (allowDevMemoryStore()) {
    const entry = memoryRooms.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryRooms.delete(key);
      return null;
    }
    return entry.room;
  }
  throw new QuizStoreUnavailableError(
    "Multiplayer storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel.",
  );
}
