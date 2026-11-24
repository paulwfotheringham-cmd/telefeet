export const AFTER_DARK_HEATS = ["warm", "warmer", "hot"] as const;

export type AfterDarkHeat = (typeof AFTER_DARK_HEATS)[number];

export type AfterDarkStill = {
  id: string;
  heat: AfterDarkHeat;
  src: string;
};

export const AFTER_DARK_ROUND = 8;

export const AFTER_DARK_STILLS: AfterDarkStill[] = [
  { id: "warm-01", heat: "warm", src: "/funquiz/after-dark/reel-warm-01.jpg" },
  { id: "warm-02", heat: "warm", src: "/funquiz/after-dark/reel-warm-02.jpg" },
  { id: "warm-03", heat: "warm", src: "/funquiz/after-dark/reel-warm-03.jpg" },
  { id: "warm-04", heat: "warm", src: "/funquiz/after-dark/reel-warm-04.jpg" },
  { id: "warm-05", heat: "warm", src: "/funquiz/after-dark/reel-warm-05.jpg" },
  { id: "warm-06", heat: "warm", src: "/funquiz/after-dark/reel-warm-06.jpg" },
  { id: "warm-07", heat: "warm", src: "/funquiz/after-dark/reel-warm-07.jpg" },
  { id: "warm-08", heat: "warm", src: "/funquiz/after-dark/reel-warm-08.jpg" },
  { id: "warmer-01", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-01.jpg" },
  { id: "warmer-02", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-02.jpg" },
  { id: "warmer-03", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-03.jpg" },
  { id: "warmer-04", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-04.jpg" },
  { id: "warmer-05", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-05.jpg" },
  { id: "warmer-06", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-06.jpg" },
  { id: "warmer-07", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-07.jpg" },
  { id: "warmer-08", heat: "warmer", src: "/funquiz/after-dark/reel-warmer-08.jpg" },
  { id: "hot-01", heat: "hot", src: "/funquiz/after-dark/reel-hot-01.jpg" },
  { id: "hot-02", heat: "hot", src: "/funquiz/after-dark/reel-hot-02.jpg" },
  { id: "hot-03", heat: "hot", src: "/funquiz/after-dark/reel-hot-03.jpg" },
  { id: "hot-04", heat: "hot", src: "/funquiz/after-dark/reel-hot-04.jpg" },
  { id: "hot-05", heat: "hot", src: "/funquiz/after-dark/reel-hot-05.jpg" },
  { id: "hot-06", heat: "hot", src: "/funquiz/after-dark/reel-hot-06.jpg" },
  { id: "hot-07", heat: "hot", src: "/funquiz/after-dark/reel-hot-07.jpg" },
  { id: "hot-08", heat: "hot", src: "/funquiz/after-dark/reel-hot-08.jpg" },
];

export function stillsForHeat(heat: AfterDarkHeat): AfterDarkStill[] {
  return AFTER_DARK_STILLS.filter((still) => still.heat === heat);
}

export function shuffleStills(stills: AfterDarkStill[], seed: number): AfterDarkStill[] {
  const copy = stills.slice();
  let state = seed >>> 0;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    const swap = state % (index + 1);
    const current = copy[index]!;
    copy[index] = copy[swap]!;
    copy[swap] = current;
  }
  return copy.slice(0, AFTER_DARK_ROUND);
}
