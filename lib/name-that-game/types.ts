export const GAME_MODE_TAKE_TURNS = "take_turns" as const;
export const GAME_MODE_PLAY_TOGETHER = "play_together" as const;
export const GAME_MODE_SINGLE = "single" as const;

export const GAME_PLAY_MODES = [
  {
    id: GAME_MODE_SINGLE,
    title: "Single player",
    description: "Name the games on your own. No second player.",
  },
  {
    id: GAME_MODE_PLAY_TOGETHER,
    title: "Play together",
    description:
      "Share each screenshot. Discuss it, and the room creator submits the team's answer.",
  },
  {
    id: GAME_MODE_TAKE_TURNS,
    title: "Play separate",
    description: "See a different screenshot each turn. Name the game, then compare scores.",
  },
] as const;

export type GamePlayMode = (typeof GAME_PLAY_MODES)[number]["id"];

export const GAME_ERAS = [
  { id: "80s", title: "1980s", description: "Arcade, home computer, and console games from the 1980s." },
  { id: "90s", title: "1990s", description: "PC and console games from the 1990s." },
  { id: "both", title: "80s and 90s", description: "A mix from both decades." },
] as const;

export type GameEra = (typeof GAME_ERAS)[number]["id"];
export type GameDecade = "80s" | "90s";

export const GAME_LEVELS = [
  {
    id: "medium",
    title: "Medium",
    description: "Familiar games. The console is shown when every choice is on it.",
  },
  {
    id: "hard",
    title: "Hard",
    description: "The full list, including obscure games. No console and no year.",
  },
] as const;

export type GameLevel = (typeof GAME_LEVELS)[number]["id"];

export type GameQuestion = {
  id: string;
  title: string;
  year: number;
  decade: GameDecade;
  platform: string;
  wikiFile: string;
};

export type PresentedGame = {
  id: string;
  title: string;
  year: number;
  platform: string;
  options: readonly string[];
  correctIndex: number;
};

export function isGamePlayMode(value: string): value is GamePlayMode {
  return value === GAME_MODE_TAKE_TURNS || value === GAME_MODE_PLAY_TOGETHER || value === GAME_MODE_SINGLE;
}

export function sharesGameRound(mode: string) {
  return mode === GAME_MODE_PLAY_TOGETHER || mode === GAME_MODE_SINGLE;
}

export function isGameEra(value: string): value is GameEra {
  return value === "80s" || value === "90s" || value === "both";
}

export function isGameLevel(value: string): value is GameLevel {
  return value === "medium" || value === "hard";
}

export function gameLevelTitle(level: GameLevel): string {
  return GAME_LEVELS.find((option) => option.id === level)?.title ?? "Hard";
}

export function gameModeTitle(mode: GamePlayMode): string {
  return GAME_PLAY_MODES.find((option) => option.id === mode)?.title ?? "Take turns";
}

export function gameEraTitle(era: GameEra): string {
  return GAME_ERAS.find((option) => option.id === era)?.title ?? "80s and 90s";
}
