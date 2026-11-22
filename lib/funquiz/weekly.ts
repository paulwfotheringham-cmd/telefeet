export const WEEKLY_GAMES = [
  { id: "organ", title: "Draw the Organ", path: "/draw-the-organ" },
  { id: "animal", title: "Draw the Animal", path: "/draw-the-animal" },
  { id: "country", title: "Draw the Country", path: "/draw-the-country" },
  { id: "appliance", title: "Draw the Appliance", path: "/draw-the-appliance" },
  { id: "landmark", title: "Draw the Landmark", path: "/draw-the-landmark" },
  { id: "flower", title: "Draw the Flower", path: "/draw-the-flower" },
  { id: "weapon", title: "Draw the Weapon", path: "/draw-the-weapon" },
  { id: "geography", title: "Draw the Geography", path: "/draw-the-geography" },
  { id: "myth", title: "Draw the Myth", path: "/draw-the-myth" },
  { id: "fast-food", title: "Draw the Fast Food", path: "/draw-the-fast-food" },
] as const;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Monday 00:00 UTC of the week that ends on Sunday. */
export function weekStart(now = Date.now()): string {
  const date = new Date(now);
  const daysFromMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysFromMonday);
  return date.toISOString().slice(0, 10);
}

export function weekSunday(start = weekStart()): string {
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().slice(0, 10);
}

export function weeklyGame(now = Date.now()) {
  const start = weekStart(now);
  const index = Math.floor(Date.parse(`${start}T00:00:00Z`) / WEEK_MS);
  const game = WEEKLY_GAMES[((index % WEEKLY_GAMES.length) + WEEKLY_GAMES.length) % WEEKLY_GAMES.length]!;
  return { ...game, weekStart: start, ends: weekSunday(start) };
}

export function weekSeed(gamePath: string, now = Date.now()): number {
  const text = `${weekStart(now)}:${gamePath}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
