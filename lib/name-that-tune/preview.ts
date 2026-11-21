import { TUNE_QUESTIONS } from "./question-bank";

type ItunesResult = {
  previewUrl?: string;
  trackName?: string;
  artistName?: string;
};

const cache = new Map<string, { previewUrl: string | null; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function lookupTunePreview(songId: string): Promise<string | null> {
  const song = TUNE_QUESTIONS.find((question) => question.id === songId);
  if (!song) {
    throw new Error("Unknown song");
  }
  const cached = cache.get(songId);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.previewUrl;
  }

  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", `${song.title} ${song.artist}`);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "8");

  let previewUrl: string | null = null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) {
      const body = (await response.json()) as { results?: ItunesResult[] };
      const results = (body.results ?? []).filter((result) => result.previewUrl);
      const title = compact(song.title).slice(0, 18);
      const artist = compact(song.artist.split("&")[0] ?? song.artist).slice(0, 12);
      const match =
        results.find((result) => {
          const track = compact(result.trackName ?? "");
          const name = compact(result.artistName ?? "");
          return track.includes(title) && (!artist || name.includes(artist));
        }) ?? results[0];
      previewUrl = match?.previewUrl ?? null;
    }
  } catch {
    previewUrl = null;
  }

  cache.set(songId, { previewUrl, at: Date.now() });
  return previewUrl;
}

export function clearTunePreviewCacheForTests(): void {
  cache.clear();
}
