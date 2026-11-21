import { SHOW_QUESTIONS } from "./question-bank";
import type { ShowQuestion } from "./types";

type ItunesResult = {
  previewUrl?: string;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
};

const cache = new Map<string, { previewUrl: string | null; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matches(result: ItunesResult, show: ShowQuestion): boolean {
  if (!result.previewUrl) return false;
  const artist = compact(result.artistName ?? "");
  const track = compact(result.trackName ?? "");
  const collection = compact(result.collectionName ?? "");
  if (!artist.includes(show.artistIncludes)) return false;
  if (!track.includes(show.trackIncludes)) return false;
  if (show.trackEquals && track !== show.trackEquals) return false;
  if (show.collectionIncludes && !collection.includes(show.collectionIncludes)) return false;
  return true;
}

export async function lookupShowPreview(showId: string): Promise<string | null> {
  const show = SHOW_QUESTIONS.find((question) => question.id === showId);
  if (!show) throw new Error("Unknown show");
  const cached = cache.get(showId);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.previewUrl;

  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", show.search);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "8");
  url.searchParams.set("country", "gb");

  let previewUrl: string | null = null;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) {
      const body = (await response.json()) as { results?: ItunesResult[] };
      previewUrl = body.results?.find((result) => matches(result, show))?.previewUrl ?? null;
    }
  } catch {
    previewUrl = null;
  }
  cache.set(showId, { previewUrl, at: Date.now() });
  return previewUrl;
}
