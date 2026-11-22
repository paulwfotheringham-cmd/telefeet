export const CONTINENT_ROUNDS = 7;

export const CONTINENTS = [
  { id: "africa", title: "Africa" },
  { id: "antarctica", title: "Antarctica" },
  { id: "asia", title: "Asia" },
  { id: "europe", title: "Europe" },
  { id: "north-america", title: "North America" },
  { id: "australia", title: "Australia" },
  { id: "south-america", title: "South America" },
] as const;

export type ContinentId = (typeof CONTINENTS)[number]["id"];
