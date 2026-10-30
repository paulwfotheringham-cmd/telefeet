export const QUIZ_CATEGORY_GENERAL_KNOWLEDGE = "general_knowledge" as const;
export const QUIZ_CATEGORY_SPACE = "space" as const;
export const QUIZ_CATEGORY_HISTORY = "history" as const;
export const QUIZ_CATEGORY_MILITARY_BATTLES = "military_battles" as const;
export const QUIZ_CATEGORY_GENERAL_MILITARY = "general_military" as const;
export const QUIZ_CATEGORY_CAPITAL_CITIES = "capital_cities" as const;
export const QUIZ_CATEGORY_COUNTRY_OUTLINES = "country_outlines" as const;
export const QUIZ_CATEGORY_GEOGRAPHY = "geography" as const;
export const QUIZ_CATEGORY_MOVIES_POP_CULTURE = "movies_pop_culture" as const;
export const QUIZ_CATEGORY_WORLD_FLAGS = "world_flags" as const;

export type QuizCategoryId =
  | typeof QUIZ_CATEGORY_GENERAL_KNOWLEDGE
  | typeof QUIZ_CATEGORY_SPACE
  | typeof QUIZ_CATEGORY_HISTORY
  | typeof QUIZ_CATEGORY_MILITARY_BATTLES
  | typeof QUIZ_CATEGORY_GENERAL_MILITARY
  | typeof QUIZ_CATEGORY_CAPITAL_CITIES
  | typeof QUIZ_CATEGORY_COUNTRY_OUTLINES
  | typeof QUIZ_CATEGORY_GEOGRAPHY
  | typeof QUIZ_CATEGORY_MOVIES_POP_CULTURE
  | typeof QUIZ_CATEGORY_WORLD_FLAGS;

export const QUIZ_CATEGORIES: {
  id: QuizCategoryId;
  title: string;
  description: string;
}[] = [
  {
    id: QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    title: "General Knowledge",
    description:
      "A balanced mix of science, history, space, geography, nature, technology, culture and other subjects.",
  },
  {
    id: QUIZ_CATEGORY_SPACE,
    title: "Space",
    description:
      "Astronomy, planets, moons, stars, galaxies, spacecraft, exploration and cosmology.",
  },
  {
    id: QUIZ_CATEGORY_HISTORY,
    title: "History",
    description:
      "Ancient civilizations, empires, rulers, revolutions, discoveries and major historical events.",
  },
  {
    id: QUIZ_CATEGORY_MILITARY_BATTLES,
    title: "Military Battles",
    description:
      "Famous battles, campaigns, strategy, commanders and historically significant operations.",
  },
  {
    id: QUIZ_CATEGORY_GENERAL_MILITARY,
    title: "General Military",
    description:
      "Military history, equipment, aircraft, naval forces, technology and international developments.",
  },
  {
    id: QUIZ_CATEGORY_CAPITAL_CITIES,
    title: "Capital Cities",
    description: "Countries and their capital cities, including less familiar states.",
  },
  {
    id: QUIZ_CATEGORY_COUNTRY_OUTLINES,
    title: "Country Outlines",
    description: "Identify the country from its outline silhouette.",
  },
  {
    id: QUIZ_CATEGORY_GEOGRAPHY,
    title: "Geography",
    description:
      "Rivers, mountains, lakes, deserts, islands, seas, continents and geographical features.",
  },
  {
    id: QUIZ_CATEGORY_MOVIES_POP_CULTURE,
    title: "Movies & Pop Culture",
    description:
      "Films, TV, music, franchises, awards, quotes, and the celebrities and moments that define pop culture.",
  },
  {
    id: QUIZ_CATEGORY_WORLD_FLAGS,
    title: "Flags of the World",
    description: "Identify countries from their national flags — from familiar banners to trickier ones.",
  },
];

export function isQuizCategoryId(value: string): value is QuizCategoryId {
  return QUIZ_CATEGORIES.some((c) => c.id === value);
}

export function categoryTitle(id: QuizCategoryId): string {
  return QUIZ_CATEGORIES.find((c) => c.id === id)?.title ?? id;
}
