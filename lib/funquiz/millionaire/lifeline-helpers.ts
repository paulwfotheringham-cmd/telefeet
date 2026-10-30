const FRIEND_NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Riley",
  "Casey",
  "Morgan",
  "Taylor",
  "Jamie",
] as const;

/** ~85% confident correct answer (classic Phone-a-Friend feel). */
export function pickPhoneFriendSuggestion(
  correctIndex: number,
  optionCount: number,
  random = Math.random,
): { choiceIndex: number; friendName: string; message: string } {
  const friendName = FRIEND_NAMES[Math.floor(random() * FRIEND_NAMES.length)]!;
  const confident = random() < 0.85;
  let choiceIndex = correctIndex;
  if (!confident) {
    const wrong: number[] = [];
    for (let i = 0; i < optionCount; i++) {
      if (i !== correctIndex) wrong.push(i);
    }
    choiceIndex = wrong[Math.floor(random() * wrong.length)]!;
  }
  const letter = String.fromCharCode(65 + choiceIndex);
  const message = confident
    ? `${friendName} says: "I'm pretty sure it's ${letter}."`
    : `${friendName} says: "I'm not certain… maybe ${letter}?"`;
  return { choiceIndex, friendName, message };
}

/** Percentages per option index; sums to 100. Correct answer usually leads. */
export function buildAudiencePoll(
  correctIndex: number,
  optionCount: number,
  random = Math.random,
): number[] {
  const percents = new Array<number>(optionCount).fill(0);
  const correctShare = 42 + Math.floor(random() * 28);
  percents[correctIndex] = correctShare;
  let remaining = 100 - correctShare;
  const others: number[] = [];
  for (let i = 0; i < optionCount; i++) {
    if (i !== correctIndex) others.push(i);
  }
  for (let i = 0; i < others.length; i++) {
    const idx = others[i]!;
    if (i === others.length - 1) {
      percents[idx] = remaining;
    } else {
      const slice = Math.floor(remaining / (others.length - i));
      const jitter = Math.floor(random() * Math.min(12, slice));
      const value = Math.max(1, slice - jitter);
      percents[idx] = value;
      remaining -= value;
    }
  }
  return percents;
}
