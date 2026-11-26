export type HoldemFaceGender = "male" | "female";

const GENDER_KEY = "funquiz-holdem-face-gender";

/** Stable hash so the same player always gets the same face. */
export function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function readFaceGender(): HoldemFaceGender {
  if (typeof window === "undefined") return "male";
  const raw = localStorage.getItem(GENDER_KEY);
  return raw === "female" ? "female" : "male";
}

export function writeFaceGender(gender: HoldemFaceGender) {
  localStorage.setItem(GENDER_KEY, gender);
}

/** AI seats get a fixed gender from their id so River/Bluff look consistent. */
export function faceGenderForSeat(playerId: string, isYou: boolean, yourGender: HoldemFaceGender): HoldemFaceGender {
  if (isYou) return yourGender;
  if (playerId.includes("1") || playerId.endsWith("-1")) return "female";
  if (playerId.includes("2") || playerId.endsWith("-2")) return "male";
  return hashSeed(playerId) % 2 === 0 ? "male" : "female";
}

/**
 * Random-looking portrait from Dicebear (SVG). Seeded by player id + gender
 * so faces stay stable across hands and refreshes.
 */
export function holdemFaceUrl(playerId: string, gender: HoldemFaceGender): string {
  const seed = encodeURIComponent(`${playerId}-${gender}`);
  const params = new URLSearchParams({
    seed,
    backgroundColor: gender === "female" ? "b6e3f4,ffd5dc,c0aede" : "b6e3f4,d1d4f9,c0aede",
  });
  // Personas gives varied faces; gender hint via facialHair / earrings style range.
  if (gender === "male") {
    params.set("facialHairProbability", "60");
    params.set("earringsProbability", "0");
  } else {
    params.set("facialHairProbability", "0");
    params.set("earringsProbability", "55");
  }
  return `https://api.dicebear.com/9.x/personas/svg?${params.toString()}`;
}
