export const MOVIE_DIFFICULTY_EASY = "easy" as const;
export const MOVIE_DIFFICULTY_MEDIUM = "medium" as const;
export const MOVIE_DIFFICULTY_HARD = "hard" as const;

export const MOVIE_DIFFICULTIES = [
  MOVIE_DIFFICULTY_EASY,
  MOVIE_DIFFICULTY_MEDIUM,
  MOVIE_DIFFICULTY_HARD,
] as const;

export type MovieDifficulty = (typeof MOVIE_DIFFICULTIES)[number];

export const MOVIE_DIFFICULTY_OPTIONS: {
  id: MovieDifficulty;
  title: string;
  description: string;
}[] = [
  {
    id: MOVIE_DIFFICULTY_EASY,
    title: "Easy",
    description: "Familiar faces, but not the biggest billboards.",
  },
  {
    id: MOVIE_DIFFICULTY_MEDIUM,
    title: "Medium",
    description: "Character actors and well-known faces from serious films.",
  },
  {
    id: MOVIE_DIFFICULTY_HARD,
    title: "Hard",
    description: "Harder faces. No superstar posters.",
  },
];

export const MOVIE_CATEGORIES = ["Hollywood"] as const;

export type MovieCategory = (typeof MOVIE_CATEGORIES)[number];

export const QUESTIONS_PER_GAME = 8;

export const MOVIE_MODE_TAKE_TURNS = "take_turns" as const;
export const MOVIE_MODE_PLAY_TOGETHER = "play_together" as const;
export const MOVIE_MODE_SINGLE = "single" as const;

export const MOVIE_PLAY_MODES = [
  {
    id: MOVIE_MODE_SINGLE,
    title: "Single player",
    description: "Name the faces on your own. No second player.",
  },
  {
    id: MOVIE_MODE_PLAY_TOGETHER,
    title: "Play together",
    description:
      "Answer 8 shared pictures. Discuss each face, and the room creator submits the team's answer.",
  },
  {
    id: MOVIE_MODE_TAKE_TURNS,
    title: "Play separate",
    description:
      "Answer 8 different pictures each. Take turns naming the person, then compare scores.",
  },
] as const;

export type MoviePlayMode = (typeof MOVIE_PLAY_MODES)[number]["id"];

export function isMoviePlayMode(value: string): value is MoviePlayMode {
  return value === MOVIE_MODE_TAKE_TURNS || value === MOVIE_MODE_PLAY_TOGETHER || value === MOVIE_MODE_SINGLE;
}

export function sharesMovieRound(mode: string) {
  return mode === MOVIE_MODE_PLAY_TOGETHER || mode === MOVIE_MODE_SINGLE;
}

export function movieModeTitle(mode: MoviePlayMode): string {
  return MOVIE_PLAY_MODES.find((option) => option.id === mode)?.title ?? "Take turns";
}

export type MovieQuestion = {
  id: string;
  quote: string;
  film: string;
  image: string;
  distractors: readonly [string, string, string];
  difficulty: MovieDifficulty;
  category: MovieCategory;
};

export type PresentedQuestion = {
  id: string;
  quote: string;
  film: string;
  image: string;
  difficulty: MovieDifficulty;
  category: MovieCategory;
  options: readonly string[];
  correctIndex: number;
};

export function isMovieDifficulty(value: string): value is MovieDifficulty {
  return (MOVIE_DIFFICULTIES as readonly string[]).includes(value);
}

export function difficultyTitle(id: MovieDifficulty): string {
  return MOVIE_DIFFICULTY_OPTIONS.find((d) => d.id === id)?.title ?? id;
}
