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
export const QUIZ_CATEGORY_CAPITAL_POPULATIONS = "capital_populations" as const;
export const QUIZ_CATEGORY_SPORTS = "sports" as const;
export const QUIZ_CATEGORY_STAR_TREK = "star_trek" as const;
export const QUIZ_CATEGORY_WORLD_LEADERS = "world_leaders" as const;
export const QUIZ_CATEGORY_TRUE_OR_FALSE = "true_or_false" as const;
export const QUIZ_CATEGORY_CLOSEST = "closest_wins" as const;
export const QUIZ_CATEGORY_INVENTIONS = "inventions" as const;
export const QUIZ_CATEGORY_WILDLIFE = "wildlife" as const;
export const QUIZ_CATEGORY_MEDICAL = "medical" as const;
export const QUIZ_CATEGORY_WONDERS = "wonders" as const;
export const QUIZ_CATEGORY_CURRENCIES = "currencies" as const;
export const QUIZ_CATEGORY_COUNTRY_POPULATIONS = "country_populations" as const;

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
  | typeof QUIZ_CATEGORY_WORLD_FLAGS
  | typeof QUIZ_CATEGORY_CAPITAL_POPULATIONS
  | typeof QUIZ_CATEGORY_SPORTS
  | typeof QUIZ_CATEGORY_STAR_TREK
  | typeof QUIZ_CATEGORY_WORLD_LEADERS
  | typeof QUIZ_CATEGORY_TRUE_OR_FALSE
  | typeof QUIZ_CATEGORY_CLOSEST
  | typeof QUIZ_CATEGORY_INVENTIONS
  | typeof QUIZ_CATEGORY_WILDLIFE
  | typeof QUIZ_CATEGORY_MEDICAL
  | typeof QUIZ_CATEGORY_WONDERS
  | typeof QUIZ_CATEGORY_CURRENCIES
  | typeof QUIZ_CATEGORY_COUNTRY_POPULATIONS;

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
  {
    id: QUIZ_CATEGORY_CAPITAL_POPULATIONS,
    title: "Capital populations",
    description: "Type the population of the city. A guess within 2 million wins. There are no choices.",
  },
  {
    id: QUIZ_CATEGORY_SPORTS,
    title: "Sports",
    description: "Football, cricket, rugby, tennis, cycling, the Olympics, and other sports from around the world.",
  },
  {
    id: QUIZ_CATEGORY_STAR_TREK,
    title: "Star Trek",
    description: "Starships, captains, and alien worlds from the original series through Voyager and the films.",
  },
  {
    id: QUIZ_CATEGORY_WORLD_LEADERS,
    title: "Presidents & PMs",
    description:
      "Current prime ministers and presidents in South America, Europe, and Asia. Three choices, and the recent ones are the trap.",
  },
  {
    id: QUIZ_CATEGORY_TRUE_OR_FALSE,
    title: "True or false",
    description: "Two choices. The familiar version of the fact is often the wrong one.",
  },
  {
    id: QUIZ_CATEGORY_CLOSEST,
    title: "Closest wins",
    description: "Type a number. With two players, the closest guess scores. On your own, within 10% scores.",
  },
  {
    id: QUIZ_CATEGORY_INVENTIONS,
    title: "Inventions",
    description: "Who is credited with inventing it? Four choices, from the telephone to the harder patents.",
  },
  {
    id: QUIZ_CATEGORY_WILDLIFE,
    title: "Wildlife",
    description: "Name the animal in the picture. No elephants, dogs, or the usual easy ones.",
  },
  {
    id: QUIZ_CATEGORY_MEDICAL,
    title: "Medical",
    description: "Name the organ or bone in the picture.",
  },
  {
    id: QUIZ_CATEGORY_WONDERS,
    title: "Wonders of the world",
    description: "Ancient wonders and famous monuments. Four choices.",
  },
  {
    id: QUIZ_CATEGORY_CURRENCIES,
    title: "Currencies",
    description: "Name the currency of the country. Four choices.",
  },
  {
    id: QUIZ_CATEGORY_COUNTRY_POPULATIONS,
    title: "Country populations",
    description: "Type the population. Within about 10% scores.",
  },
];

export function isQuizCategoryId(value: string): value is QuizCategoryId {
  return QUIZ_CATEGORIES.some((c) => c.id === value);
}

export function categoryTitle(id: QuizCategoryId): string {
  return QUIZ_CATEGORIES.find((c) => c.id === id)?.title ?? id;
}
