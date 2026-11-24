export const QUESTIONS_PER_GAME = 10;
export const INTRO_SECONDS = 12;

export const TUNE_MODE_TAKE_TURNS = "take_turns" as const;
export const TUNE_MODE_PLAY_TOGETHER = "play_together" as const;
export const TUNE_MODE_SINGLE = "single" as const;

export const TUNE_PLAY_MODES = [
  {
    id: TUNE_MODE_SINGLE,
    title: "Single player",
    description: "Name the artists on your own. No second player.",
  },
  {
    id: TUNE_MODE_PLAY_TOGETHER,
    title: "Play together",
    description:
      "Hear 10 shared intros. Discuss each one, and the room creator submits the team's answer.",
  },
  {
    id: TUNE_MODE_TAKE_TURNS,
    title: "Play separate",
    description: "Hear 10 different intros each. Take turns naming the artist, then compare scores.",
  },
] as const;

export type TunePlayMode = (typeof TUNE_PLAY_MODES)[number]["id"];

export const TUNE_ERAS = [
  { id: "80s", title: "1980s", description: "Hits from 1980 through 1989." },
  { id: "90s", title: "1990s", description: "Hits from 1990 through 1999." },
  { id: "both", title: "80s and 90s", description: "A mix from both decades." },
] as const;

export type TuneEra = (typeof TUNE_ERAS)[number]["id"];
export type TuneDecade = "80s" | "90s";

export type TuneQuestion = {
  id: string;
  title: string;
  artist: string;
  year: number;
  decade: TuneDecade;
  distractors: readonly [string, string, string];
};

export type PresentedTune = {
  id: string;
  title: string;
  artist: string;
  year: number;
  decade: TuneDecade;
  options: readonly string[];
  correctIndex: number;
};

export function isTunePlayMode(value: string): value is TunePlayMode {
  return value === TUNE_MODE_TAKE_TURNS || value === TUNE_MODE_PLAY_TOGETHER || value === TUNE_MODE_SINGLE;
}

export function sharesTuneRound(mode: string) {
  return mode === TUNE_MODE_PLAY_TOGETHER || mode === TUNE_MODE_SINGLE;
}

export function isTuneEra(value: string): value is TuneEra {
  return value === "80s" || value === "90s" || value === "both";
}

export function tuneModeTitle(mode: TunePlayMode): string {
  return TUNE_PLAY_MODES.find((option) => option.id === mode)?.title ?? "Take turns";
}

export function tuneEraTitle(era: TuneEra): string {
  return TUNE_ERAS.find((option) => option.id === era)?.title ?? "80s and 90s";
}
