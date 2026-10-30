import {
  QUIZ_CATEGORY_CAPITAL_CITIES,
  QUIZ_CATEGORY_COUNTRY_OUTLINES,
  QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
  QUIZ_CATEGORY_WORLD_FLAGS,
  type QuizCategoryId,
} from "../categories";
import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE, type QuizDifficulty } from "../difficulties";
import type { QuizQuestionBankItem } from "./types";

const MIN_PER_POOL = 50;

/** Countries that should not appear in hard flag / outline / capital pools. */
const WELL_KNOWN_COUNTRIES = new Set(
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
  /\bLet It Go\b/i,
  /\bMay the Force\b/i,
  /\bNile\b.*\bCairo\b/i,
  /\bMount Everest\b/i,
  /\bMediterranean Sea\b/i,
];

function countryFromQuestion(q: Omit<QuizQuestionBankItem, "id">): string | null {
  const label = q.options[q.correctIndex];
  return typeof label === "string" ? label : null;
}

export function isTooEasyForHardQuestion(q: Omit<QuizQuestionBankItem, "id">): boolean {
  // Capital difficulty is assigned by curated tier in assemble.ts, not blocklist rebalance.
  if (q.categoryId === QUIZ_CATEGORY_CAPITAL_CITIES) {
    return false;
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

  const promoteCandidate = (): Omit<QuizQuestionBankItem, "id"> | null => {
    for (let i = intermediate.length - 1; i >= 0; i--) {
      const q = intermediate[i]!;
      if (!isTooEasyForHardQuestion(q)) {
        intermediate.splice(i, 1);
        return { ...q, difficulty: QUIZ_DIFFICULTY_HARD };
      }
    }
    return null;
  };

  while (hard.length < MIN_PER_POOL) {
    const next = promoteCandidate();
    if (!next) break;
    hard.push(next);
  }

  while (intermediate.length < MIN_PER_POOL && hard.length > MIN_PER_POOL) {
    const demote =
      hard.find((q) => isTooEasyForHardQuestion(q)) ??
      hard[hard.length - 1];
    if (!demote) break;
    hard.splice(hard.indexOf(demote), 1);
    intermediate.push({ ...demote, difficulty: QUIZ_DIFFICULTY_INTERMEDIATE });
  }

  return [...other, ...intermediate, ...hard];
}

/** Ensure hard pools exclude trivia-easy items; keep at least 50 hard when possible. */
export function rebalanceExplicitDifficulties(
  items: Omit<QuizQuestionBankItem, "id">[],
): Omit<QuizQuestionBankItem, "id">[] {
  let out = items;
  const categories = new Set(items.map((q) => q.categoryId));
  for (const categoryId of categories) {
    if (categoryId === QUIZ_CATEGORY_GENERAL_KNOWLEDGE) continue;
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

export function difficultyFromIndex(
  index: number,
  skew: 0 | 1,
  prompt: string,
  categoryId: QuizCategoryId,
): QuizDifficulty {
  const fromIndex = (index + skew) % 2 === 0 ? QUIZ_DIFFICULTY_INTERMEDIATE : QUIZ_DIFFICULTY_HARD;
  if (fromIndex === QUIZ_DIFFICULTY_HARD) {
    const probe: Omit<QuizQuestionBankItem, "id"> = {
      categoryId,
      category: "",
      prompt,
      options: ["", "", "", ""] as [string, string, string, string],
      correctIndex: 0,
      difficulty: QUIZ_DIFFICULTY_HARD,
    };
    if (isTooEasyForHardQuestion(probe)) {
      return QUIZ_DIFFICULTY_INTERMEDIATE;
    }
  }
  return fromIndex;
}
