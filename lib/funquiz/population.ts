/** A guess this close to the city population wins. */
export const POPULATION_TOLERANCE = 2_000_000;
export const POPULATION_GUESS_MAX = 100_000_000;

export function formatPopulation(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** Keep digits and insert thousands separators while the player types. */
export function formatPopulationInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export function parsePopulationGuess(raw: unknown): number {
  let digits = "";
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new Error("Enter a whole number, like 1,000,000");
    }
    digits = String(raw);
  } else if (typeof raw === "string") {
    const cleaned = raw.trim().replace(/,/g, "").replace(/\s/g, "");
    if (!/^\d+$/.test(cleaned)) {
      throw new Error("Enter a whole number, like 1,000,000");
    }
    digits = cleaned;
  } else {
    throw new Error("Enter a whole number, like 1,000,000");
  }
  if (digits.length > 9) {
    throw new Error("Enter a population up to 100,000,000");
  }
  const value = Number(digits);
  if (!Number.isInteger(value) || value > POPULATION_GUESS_MAX) {
    throw new Error("Enter a population up to 100,000,000");
  }
  return value;
}

export function populationWithinTolerance(guess: number, actual: number, tolerance = POPULATION_TOLERANCE): boolean {
  return Math.abs(guess - actual) <= tolerance;
}
