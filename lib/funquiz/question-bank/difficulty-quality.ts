import {
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_WORLD_FLAGS,
  type QuizCategoryId,
} from "../categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE, type QuizDifficulty } from "../difficulties";
import type { QuizQuestionBankItem } from "./types";

const MIN_PER_POOL = 50;

/** Countries that should not appear in hard flag / outline / capital pools. */
export const WELL_KNOWN_COUNTRIES = new Set(
  [
    "Japan",
    "Brazil",
    "Canada",
    "United States",
    "United Kingdom",
    "France",
    "Germany",
    "Italy",
    "Spain",
    "Mexico",
    "Argentina",
    "Australia",
    "New Zealand",
    "India",
    "China",
    "South Korea",
    "Russia",
    "Ukraine",
    "Poland",
    "Sweden",
    "Norway",
    "Finland",
    "Denmark",
    "Ireland",
    "Portugal",
    "Greece",
    "Turkey",
    "Egypt",
    "South Africa",
    "Nigeria",
    "Kenya",
    "Morocco",
    "Saudi Arabia",
    "United Arab Emirates",
    "Israel",
    "Iran",
    "Pakistan",
    "Bangladesh",
    "Thailand",
    "Vietnam",
    "Indonesia",
    "Malaysia",
    "Philippines",
    "Singapore",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Czech Republic",
    "Hungary",
    "Romania",
    "Colombia",
    "Chile",
    "Peru",
    "Cuba",
    "Jamaica",
  ].map((c) => c.toLowerCase()),
);

/** Capitals in the main bank tagged hard only when the country is in this set. */
export const OBSCURE_CAPITAL_COUNTRIES = new Set(
  [
    "Myanmar",
    "Bolivia",
    "Ivory Coast",
    "Sri Lanka",
    "Tanzania",
    "Ethiopia",
    "North Korea",
    "Mongolia",
    "Kazakhstan",
    "Uzbekistan",
    "Afghanistan",
    "Nepal",
    "Bangladesh",
    "Iraq",
  ].map((c) => c.toLowerCase()),
);

export function capitalDifficultyForCountry(country: string): QuizDifficulty {
  return OBSCURE_CAPITAL_COUNTRIES.has(country.toLowerCase())
    ? QUIZ_DIFFICULTY_HARD
    : QUIZ_DIFFICULTY_INTERMEDIATE;
}

export function outlineDifficultyForCountry(country: string): QuizDifficulty {
  return WELL_KNOWN_COUNTRIES.has(country.toLowerCase())
    ? QUIZ_DIFFICULTY_INTERMEDIATE
    : QUIZ_DIFFICULTY_HARD;
}

const EASY_PROMPT_PATTERNS: RegExp[] = [
  /\bRed Planet\b/i,
  /\blargest planet\b/i,
  /\bclosest to the Sun\b/i,
  /\bNASA stand for\b/i,
  /\bnatural satellite\b/i,
  /\bInternational Space Station\b/i,
  /\bWhat is Earth's natural satellite\b/i,
  /\bWhich planet is famous for its rings\b/i,
  /\bGeorge Washington\b/i,
  /\bfirst man to walk on the Moon\b/i,
  /\bBerlin Wall fall\b/i,
  /\bWorld War II end/i,
  /\bDeclaration of Independence\b/i,
  /\bStar Wars\b/i,
  /\bHarry Potter\b/i,
  /\bIron Man\b/i,
  /\bSpider-Man\b/i,
  /\bweb-slinger\b/i,
  /\bLet It Go\b/i,
  /\bMay the Force\b/i,
  /\bNile\b.*\bCairo\b/i,
  /\bMount Everest\b/i,
  /\bMediterranean Sea\b/i,
  /\bMachu Picchu\b/i,
  /\bD-Day\b/i,
  /\bNormandy\b/i,
  /\bPearl Harbor\b/i,
  /\bJurassic Park\b/i,
  /\bShawshank\b/i,
  /\bStranger Things\b/i,
  /\bKing of Pop\b/i,
  /\bIndiana Jones\b/i,
  /\bApollo 11\b/i,
  /\bfirst humans on the Moon\b/i,
  /\bNorth Star\b/i,
  /\bPolaris\b/i,
  /\btotal solar eclipse\b/i,
  /\bHubble\b/i,
  /\btype of galaxy is the Milky Way\b/i,
  /\bnearest the Milky Way\b/i,
  /\bAndromeda\b/i,
  /\bWhat is a supernova\b/i,
  /\bGanymede\b/i,
  /\bBattle of Hastings\b/i,
  /\bBattle of Waterloo\b/i,
  /\bNapoleon Bonaparte\b/i,
  /\bTreaty of Versailles\b/i,
  /\bBattle of Stalingrad\b/i,
  /\bMargaret Thatcher\b/i,
  /\bCleopatra\b/i,
  /\bBlack Death\b/i,
  /\bMagna Carta\b/i,
  /\bMichael Jackson\b/i,
  /\bLeonardo DiCaprio\b/i,
  /\bTitanic \(1997\)\b/i,
  /\bOscars are awarded\b/i,
  /\bFriends\b.*\bNew York\b/i,
  /\bFrozen\b/i,
  /\bGuardians of the Galaxy\b/i,
  /\bMCU\b/i,
  /\bAvengers\b/i,
  /\bWizard of Oz\b/i,
];

function countryFromCapitalPrompt(prompt: string): string | null {
  const m = prompt.match(/capital of (.+)\?/i);
  return m?.[1]?.trim() ?? null;
}

function countryFromQuestion(q: Omit<QuizQuestionBankItem, "id">): string | null {
  const label = q.options[q.correctIndex];
  return typeof label === "string" ? label : null;
}

export function isTooEasyForHardQuestion(q: Omit<QuizQuestionBankItem, "id">): boolean {
  if (q.categoryId === QUIZ_CATEGORY_CAPITAL_CITIES) {
    const country = countryFromCapitalPrompt(q.prompt);
    if (country && WELL_KNOWN_COUNTRIES.has(country.toLowerCase())) {
      return true;
    }
  }
  if (q.categoryId === QUIZ_CATEGORY_WORLD_FLAGS || q.categoryId === QUIZ_CATEGORY_COUNTRY_OUTLINES) {
    const country = countryFromQuestion(q);
    if (country && WELL_KNOWN_COUNTRIES.has(country.toLowerCase())) {
      return true;
    }
  }
  if (EASY_PROMPT_PATTERNS.some((re) => re.test(q.prompt))) {
    return true;
  }
  return false;
}

function rebalanceSingleCategory(
  items: Omit<QuizQuestionBankItem, "id">[],
  categoryId: QuizCategoryId,
): Omit<QuizQuestionBankItem, "id">[] {
  const catItems = items.filter((q) => q.categoryId === categoryId);
  const other = items.filter((q) => q.categoryId !== categoryId);
  if (catItems.length === 0) return items;

  const intermediate: Omit<QuizQuestionBankItem, "id">[] = [];
  const hard: Omit<QuizQuestionBankItem, "id">[] = [];

  for (const q of catItems) {
    if (q.difficulty === QUIZ_DIFFICULTY_HARD) {
      if (isTooEasyForHardQuestion(q)) {
        intermediate.push({ ...q, difficulty: QUIZ_DIFFICULTY_INTERMEDIATE });
      } else {
        hard.push(q);
      }
    } else {
      intermediate.push(q);
    }
  }

  // Never promote intermediate questions into hard — hard pools must stay curated.

  while (intermediate.length < MIN_PER_POOL && hard.length > MIN_PER_POOL) {
    const demote = hard.find((q) => isTooEasyForHardQuestion(q)) ?? hard[hard.length - 1];
    if (!demote) break;
    hard.splice(hard.indexOf(demote), 1);
    intermediate.push({ ...demote, difficulty: QUIZ_DIFFICULTY_INTERMEDIATE });
  }

  return [...other, ...intermediate, ...hard];
}

/** Demote trivia-easy items from hard pools; do not backfill hard with easier questions. */
export function rebalanceExplicitDifficulties(
  items: Omit<QuizQuestionBankItem, "id">[],
): Omit<QuizQuestionBankItem, "id">[] {
  let out = items;
  const categories = new Set(items.map((q) => q.categoryId));
  for (const categoryId of categories) {
    out = rebalanceSingleCategory(out, categoryId);
  }
  return out;
}

export function assertNoEasyHardQuestions(items: QuizQuestionBankItem[]): string[] {
  const errors: string[] = [];
  for (const q of items) {
    if (q.difficulty === QUIZ_DIFFICULTY_HARD && isTooEasyForHardQuestion(q)) {
      errors.push(`Hard question too easy (${q.categoryId} #${q.id}): ${q.prompt.slice(0, 80)}`);
    }
  }
  return errors;
}
