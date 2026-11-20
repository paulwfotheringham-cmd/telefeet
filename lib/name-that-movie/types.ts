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
    description: "Household lines from films almost everyone knows.",
  },
  {
    id: MOVIE_DIFFICULTY_MEDIUM,
    title: "Medium",
    description: "Familiar films, with lines that take a second thought.",
  },
  {
    id: MOVIE_DIFFICULTY_HARD,
    title: "Hard",
    description: "Accurate lines for players who really know their films.",
  },
];

export const MOVIE_CATEGORIES = [
  "Action",
  "Adventure",
  "Comedy",
  "Science fiction",
  "Fantasy",
  "Horror",
  "Crime and gangster",
  "Thrillers",
  "War films",
  "British cinema",
  "Animated films",
] as const;

export type MovieCategory = (typeof MOVIE_CATEGORIES)[number];

export const QUESTIONS_PER_GAME = 10;

export type MovieQuestion = {
  id: string;
  quote: string;
  film: string;
  distractors: readonly [string, string, string];
  difficulty: MovieDifficulty;
  category: MovieCategory;
};

export type PresentedQuestion = {
  id: string;
  quote: string;
  film: string;
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
