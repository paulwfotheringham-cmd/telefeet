import https from "node:https";
import { GAME_QUESTIONS } from "./question-bank";

type CachedShot = { bytes: Uint8Array; mime: string; at: number };

const cache = new Map<string, CachedShot>();
const CACHE_MS = 12 * 60 * 60 * 1000;
const MAX_BYTES = 1_500_000;
const CONTACT_UA =
  "TeleFeetQuiz/1.0 (https://abstractartscouse.vercel.app/name-that-game; screenshot proxy)";

type Download = { status: number; mime: string; bytes: Uint8Array; finalUrl: string };

function allowedHost(hostname: string): boolean {
  return (
    hostname === "wikipedia.org" ||
    hostname.endsWith(".wikipedia.org") ||
    hostname === "wikimedia.org" ||
    hostname.endsWith(".wikimedia.org")
  );
}

function download(url: URL, redirects = 0): Promise<Download | { status: number; error: string }> {
  return new Promise((resolve) => {
    if (!allowedHost(url.hostname)) {
      resolve({ status: 0, error: `blocked host ${url.hostname}` });
      return;
    }
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": CONTACT_UA,
          "Api-User-Agent": CONTACT_UA,
          Accept: "image/avif,image/webp,image/png,image/gif,image/jpeg,application/json;q=0.8,*/*;q=0.5",
        },
        timeout: 8000,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers.location;
        if (status >= 300 && status < 400 && location && redirects < 4) {
          res.resume();
          const next = new URL(location, url);
          resolve(download(next, redirects + 1));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        let tooBig = false;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            tooBig = true;
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => {
          if (tooBig) {
            resolve({ status, error: `larger than ${MAX_BYTES}` });
            return;
          }
          const mime = String(res.headers["content-type"] ?? "")
            .split(";")[0]
            .trim();
          resolve({
            status,
            mime,
            bytes: new Uint8Array(Buffer.concat(chunks)),
            finalUrl: url.toString(),
          });
        });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, error: "timed out" });
    });
    req.on("error", (err) => resolve({ status: 0, error: err.message }));
    req.end();
  });
}

async function downloadImage(url: URL): Promise<{ shot: CachedShot; note: string } | { note: string }> {
  let lastNote = "no response";
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await download(url);
    if ("error" in result) {
      lastNote = result.error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
        continue;
      }
      return { note: lastNote };
    }
    if (result.status === 429 && attempt < 2) {
      lastNote = "429";
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      continue;
    }
    if (result.status !== 200) return { note: String(result.status) };
    if (!result.mime.startsWith("image/")) return { note: result.mime || "not an image" };
    if (result.bytes.byteLength === 0) return { note: "empty image" };
    return {
      shot: { bytes: result.bytes, mime: result.mime, at: Date.now() },
      note: "ok",
    };
  }
  return { note: lastNote };
}

type ImageInfo = { url?: string; mime?: string; size?: number; thumburl?: string; thumbmime?: string };

async function imageInfo(apiHost: string, title: string): Promise<{ image?: ImageInfo; note: string }> {
  const lookup = new URL(`https://${apiHost}/w/api.php`);
  lookup.searchParams.set("action", "query");
  lookup.searchParams.set("titles", title);
  lookup.searchParams.set("prop", "imageinfo");
  lookup.searchParams.set("iiprop", "url|mime|size");
  lookup.searchParams.set("iiurlwidth", "640");
  lookup.searchParams.set("format", "json");
  const result = await download(lookup);
  if ("error" in result) return { note: `${apiHost} ${result.error}` };
  if (result.status !== 200) return { note: `${apiHost} ${result.status}` };
  try {
    const info = JSON.parse(Buffer.from(result.bytes).toString("utf8")) as {
      query?: { pages?: Record<string, { imageinfo?: ImageInfo[] }> };
    };
    const page = Object.values(info.query?.pages ?? {}).find((entry) => entry.imageinfo?.[0]?.url);
    const image = page?.imageinfo?.[0];
    if (!image?.url && !image?.thumburl) return { note: `${apiHost} no image` };
    return { image, note: "ok" };
  } catch {
    return { note: `${apiHost} bad json` };
  }
}

function candidateUrls(image: ImageInfo): URL[] {
  const urls: URL[] = [];
  const originalSmall = (image.size ?? Number.MAX_SAFE_INTEGER) <= MAX_BYTES;
  const ordered = originalSmall
    ? [image.url, image.thumburl]
    : [image.thumburl, image.url];
  for (const value of ordered) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (allowedHost(url.hostname)) urls.push(url);
    } catch {
      /* skip a malformed image url */
    }
  }
  return urls;
}

function filePathUrl(host: string, wikiFile: string): URL {
  const name = wikiFile.replace(/^File:/i, "").replace(/ /g, "_");
  const url = new URL(`https://${host}/wiki/Special:FilePath/${encodeURIComponent(name)}`);
  url.searchParams.set("width", "640");
  return url;
}

export async function loadGameShot(
  gameId: string,
): Promise<{ bytes: Uint8Array; mime: string } | { error: string }> {
  const game = GAME_QUESTIONS.find((question) => question.id === gameId);
  if (!game) return { error: "Unknown game" };
  const cached = cache.get(gameId);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached;

  const notes: string[] = [];
  const direct = [
    filePathUrl("en.wikipedia.org", game.wikiFile),
    filePathUrl("commons.wikimedia.org", game.wikiFile),
  ];
  for (const apiHost of ["en.wikipedia.org", "commons.wikimedia.org"]) {
    const info = await imageInfo(apiHost, game.wikiFile);
    if (!info.image) {
      notes.push(info.note);
      continue;
    }
    for (const url of candidateUrls(info.image)) {
      const image = await downloadImage(url);
      if ("shot" in image && image.shot) {
        cache.set(gameId, image.shot);
        return image.shot;
      }
      notes.push(image.note);
    }
  }
  for (const url of direct) {
    const image = await downloadImage(url);
    if ("shot" in image && image.shot) {
      cache.set(gameId, image.shot);
      return image.shot;
    }
    notes.push(`${url.hostname} ${image.note}`);
  }
  return { error: notes.filter(Boolean).join("; ") || "Screenshot unavailable" };
}
