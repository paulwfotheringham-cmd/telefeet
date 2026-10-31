export type CatchphrasePuzzle = {
  id: string;
  sceneKey: string;
  /** Primary answer phrase (displayed after reveal). */
  answer: string;
  aliases: string[];
};

export const CATCHPHRASE_PUZZLES: CatchphrasePuzzle[] = [
  {
    id: "piece-of-cake",
    sceneKey: "piece_of_cake",
    answer: "Piece of cake",
    aliases: ["piece of cake", "its a piece of cake", "it's a piece of cake"],
  },
  {
    id: "break-a-leg",
    sceneKey: "break_a_leg",
    answer: "Break a leg",
    aliases: ["break a leg"],
  },
  {
    id: "spill-the-beans",
    sceneKey: "spill_the_beans",
    answer: "Spill the beans",
    aliases: ["spill the beans"],
  },
  {
    id: "under-the-weather",
    sceneKey: "under_the_weather",
    answer: "Under the weather",
    aliases: ["under the weather", "feeling under the weather"],
  },
  {
    id: "raining-cats-dogs",
    sceneKey: "raining_cats_dogs",
    answer: "Raining cats and dogs",
    aliases: ["raining cats and dogs", "its raining cats and dogs", "it's raining cats and dogs"],
  },
  {
    id: "once-blue-moon",
    sceneKey: "once_blue_moon",
    answer: "Once in a blue moon",
    aliases: ["once in a blue moon"],
  },
  {
    id: "cost-arm-leg",
    sceneKey: "cost_arm_leg",
    answer: "Cost an arm and a leg",
    aliases: ["cost an arm and a leg", "costs an arm and a leg"],
  },
  {
    id: "let-cat-out",
    sceneKey: "let_cat_out",
    answer: "Let the cat out of the bag",
    aliases: ["let the cat out of the bag"],
  },
  {
    id: "hit-nail",
    sceneKey: "hit_nail",
    answer: "Hit the nail on the head",
    aliases: ["hit the nail on the head"],
  },
  {
    id: "cold-feet",
    sceneKey: "cold_feet",
    answer: "Cold feet",
    aliases: ["cold feet", "got cold feet", "get cold feet"],
  },
  {
    id: "burn-midnight-oil",
    sceneKey: "burn_midnight_oil",
    answer: "Burning the midnight oil",
    aliases: ["burning the midnight oil", "burn the midnight oil"],
  },
  {
    id: "elephant-room",
    sceneKey: "elephant_room",
    answer: "Elephant in the room",
    aliases: ["elephant in the room", "the elephant in the room"],
  },
  {
    id: "when-pigs-fly",
    sceneKey: "when_pigs_fly",
    answer: "When pigs fly",
    aliases: ["when pigs fly", "pigs might fly"],
  },
  {
    id: "barking-wrong-tree",
    sceneKey: "barking_wrong_tree",
    answer: "Barking up the wrong tree",
    aliases: ["barking up the wrong tree"],
  },
  {
    id: "kick-bucket",
    sceneKey: "kick_bucket",
    answer: "Kick the bucket",
    aliases: ["kick the bucket", "kicked the bucket"],
  },
];

const BY_ID = new Map(CATCHPHRASE_PUZZLES.map((p) => [p.id, p]));

export function getCatchphrasePuzzle(id: string): CatchphrasePuzzle {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`Unknown catchphrase puzzle ${id}`);
  return p;
}

export function normalizeCatchphraseGuess(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function guessMatchesPuzzle(puzzle: CatchphrasePuzzle, rawGuess: string): boolean {
  const g = normalizeCatchphraseGuess(rawGuess);
  if (!g) return false;
  const candidates = [puzzle.answer, ...puzzle.aliases].map(normalizeCatchphraseGuess);
  return candidates.some((c) => c === g || g.includes(c) || c.includes(g));
}
