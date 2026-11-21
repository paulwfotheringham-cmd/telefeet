export const INTRO_SECONDS = 12;

export const SHOW_MODE_TAKE_TURNS = "take_turns" as const;
export const SHOW_MODE_PLAY_TOGETHER = "play_together" as const;

export const SHOW_PLAY_MODES = [
  {
    id: SHOW_MODE_TAKE_TURNS,
    title: "Take turns",
    description: "Hear a different theme each turn. Name the UK gameshow, then compare scores.",
  },
  {
    id: SHOW_MODE_PLAY_TOGETHER,
    title: "Play together",
    description:
      "Hear shared themes. Discuss each one, and the room creator submits the team's answer.",
  },
] as const;

export type ShowPlayMode = (typeof SHOW_PLAY_MODES)[number]["id"];

export const SHOW_ERAS = [
  { id: "80s", title: "1980s", description: "Gameshows that were on in the 1980s." },
  { id: "90s", title: "1990s", description: "Gameshows that were on in the 1990s." },
  { id: "both", title: "80s and 90s", description: "A mix from both decades." },
] as const;

export type ShowEra = (typeof SHOW_ERAS)[number]["id"];
export type ShowDecade = "80s" | "90s";

export type ShowQuestion = {
  id: string;
  title: string;
  year: number;
  decades: readonly ShowDecade[];
  distractors: readonly [string, string, string];
  search: string;
  artistIncludes: string;
  trackIncludes: string;
  collectionIncludes?: string;
  trackEquals?: string;
};

export type PresentedShow = {
  id: string;
  title: string;
  year: number;
  options: readonly string[];
  correctIndex: number;
};

export function isShowPlayMode(value: string): value is ShowPlayMode {
  return value === SHOW_MODE_TAKE_TURNS || value === SHOW_MODE_PLAY_TOGETHER;
}

export function isShowEra(value: string): value is ShowEra {
  return value === "80s" || value === "90s" || value === "both";
}

export function showModeTitle(mode: ShowPlayMode): string {
  return SHOW_PLAY_MODES.find((option) => option.id === mode)?.title ?? "Take turns";
}

export function showEraTitle(era: ShowEra): string {
  return SHOW_ERAS.find((option) => option.id === era)?.title ?? "80s and 90s";
}
