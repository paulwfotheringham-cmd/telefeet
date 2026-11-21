import { GAME_QUESTIONS } from "./question-bank";

type CachedShot = { bytes: Uint8Array; mime: string; at: number };

const cache = new Map<string, CachedShot>();
const CACHE_MS = 12 * 60 * 60 * 1000;
const MAX_BYTES = 4_000_000;

function wikiHeaders(): HeadersInit {
  return { "User-Agent": "TeleFeetQuiz/1.0 (name-that-game screenshot proxy)" };
}

async function fetchRetry(url: URL, init: RequestInit): Promise<Response | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.status === 429 && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
        continue;
      }
      return response;
    } catch {
      if (attempt === 2) return null;
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  return null;
}

export async function loadGameShot(gameId: string): Promise<{ bytes: Uint8Array; mime: string } | null> {
  const game = GAME_QUESTIONS.find((question) => question.id === gameId);
  if (!game) throw new Error("Unknown game");
  const cached = cache.get(gameId);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached;

  const lookup = new URL("https://en.wikipedia.org/w/api.php");
  lookup.searchParams.set("action", "query");
  lookup.searchParams.set("titles", game.wikiFile);
  lookup.searchParams.set("prop", "imageinfo");
  lookup.searchParams.set("iiprop", "url|mime");
  lookup.searchParams.set("format", "json");

  const infoRes = await fetchRetry(lookup, { headers: wikiHeaders(), cache: "no-store" });
  if (!infoRes?.ok) return null;
  const info = (await infoRes.json()) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ url?: string; mime?: string }> }> };
  };
  const page = Object.values(info.query?.pages ?? {})[0];
  const image = page?.imageinfo?.[0];
  if (!image?.url) return null;
  const imageUrl = new URL(image.url);
  if (!imageUrl.hostname.endsWith("wikimedia.org")) return null;

  const imageRes = await fetchRetry(imageUrl, { headers: wikiHeaders(), cache: "no-store" });
  if (!imageRes?.ok) return null;
  const mime = imageRes.headers.get("content-type")?.split(";")[0]?.trim() || image.mime || "image/png";
  if (!mime.startsWith("image/")) return null;
  const bytes = new Uint8Array(await imageRes.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;
  const shot = { bytes, mime, at: Date.now() };
  cache.set(gameId, shot);
  return shot;
}
