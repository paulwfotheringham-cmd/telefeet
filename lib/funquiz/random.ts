/** Uniform random in [0, 1). Prefer crypto when available. */
export function randomUnit(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! / (0xffffffff + 1);
  }
  return Math.random();
}

export function shuffleInPlace<T>(arr: T[], random: () => number = randomUnit): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}
