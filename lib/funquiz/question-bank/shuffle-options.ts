/** Stable 32-bit FNV-1a hash for deterministic MCQ option shuffles. */
export function mcqOptionSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher–Yates shuffle of option indices; returns shuffled labels and new correct index. */
export function shuffleMcqOptions<O extends readonly string[]>(
  options: O,
  correctIndex: number,
  seed: number,
): { options: O; correctIndex: number } {
  const n = options.length;
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed >>> 0;
  for (let i = n - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const shuffled = order.map((i) => options[i]!) as unknown as O;
  const newCorrect = order.indexOf(correctIndex);
  return { options: shuffled, correctIndex: newCorrect };
}
