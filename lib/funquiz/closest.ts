/** A lone guess, or a shared team guess, scores when it is this close. */
export const CLOSEST_SOLO_FRACTION = 0.1;
export const CLOSEST_GUESS_MAX = 1_000_000_000_000_000;

export function closestWindow(actual: number): number {
  return Math.max(1, Math.round(Math.abs(actual) * CLOSEST_SOLO_FRACTION));
}

export function formatClosest(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** Keep digits and insert thousands separators while the player types. */
export function formatClosestInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 15);
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export function parseClosestGuess(raw: unknown): number {
  let digits = "";
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (!Number.isInteger(raw) || raw < 0) {
      throw new Error("Enter a whole number, like 206");
    }
    digits = String(raw);
  } else if (typeof raw === "string") {
    const cleaned = raw.trim().replace(/,/g, "").replace(/\s/g, "");
    if (!/^\d+$/.test(cleaned)) {
      throw new Error("Enter a whole number, like 206");
    }
    digits = cleaned;
  } else {
    throw new Error("Enter a whole number, like 206");
  }
  if (digits.length > 15) {
    throw new Error("That number is too large");
  }
  const value = Number(digits);
  if (!Number.isInteger(value) || value > CLOSEST_GUESS_MAX) {
    throw new Error("That number is too large");
  }
  return value;
}

export function withinClosestWindow(guess: number, actual: number, tolerance?: number): boolean {
  const window = tolerance ?? closestWindow(actual);
  return Math.abs(guess - actual) <= window;
}
