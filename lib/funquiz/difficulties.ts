export const QUIZ_DIFFICULTY_INTERMEDIATE = "intermediate" as const;
export const QUIZ_DIFFICULTY_HARD = "hard" as const;

export type QuizDifficulty =
  | typeof QUIZ_DIFFICULTY_INTERMEDIATE
  | typeof QUIZ_DIFFICULTY_HARD;

export const QUIZ_DIFFICULTIES: {
  id: QuizDifficulty;
  title: string;
  description: string;
}[] = [
  {
    id: QUIZ_DIFFICULTY_INTERMEDIATE,
    title: "Intermediate",
    description:
      "A balanced challenge covering established knowledge and less obvious facts.",
  },
  {
    id: QUIZ_DIFFICULTY_HARD,
    title: "Hard",
    description:
      "A more challenging quiz with specialist knowledge, less familiar facts and more demanding questions.",
  },
];

export function isQuizDifficulty(value: string): value is QuizDifficulty {
  return QUIZ_DIFFICULTIES.some((d) => d.id === value);
}

export function difficultyTitle(id: QuizDifficulty): string {
  return QUIZ_DIFFICULTIES.find((d) => d.id === id)?.title ?? id;
}
