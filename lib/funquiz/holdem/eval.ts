import { cardRank, cardSuit } from "./cards";

/** Higher is better. Tuple: [category, ...kickers] */
export type HandScore = readonly number[];

const HIGH_CARD = 0;
const PAIR = 1;
const TWO_PAIR = 2;
const TRIPS = 3;
const STRAIGHT = 4;
const FLUSH = 5;
const FULL_HOUSE = 6;
const QUADS = 7;
const STRAIGHT_FLUSH = 8;

function scoreFive(cards: number[]): HandScore {
  const ranks = cards.map(cardRank).sort((a, b) => b - a);
  const suits = cards.map(cardSuit);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) ?? 0) + 1);
  const byCount = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const isFlush = suits.every((s) => s === suits[0]);

  const uniq = [...new Set(ranks)].sort((a, b) => b - a);
  let straightHigh = -1;
  for (let i = 0; i <= uniq.length - 5; i++) {
    if (uniq[i]! - uniq[i + 4]! === 4) straightHigh = uniq[i]!;
  }
  if (uniq.includes(12) && uniq.includes(3) && uniq.includes(2) && uniq.includes(1) && uniq.includes(0)) {
    straightHigh = Math.max(straightHigh, 3);
  }

  if (isFlush && straightHigh >= 0) {
    return [STRAIGHT_FLUSH, straightHigh];
  }
  if (byCount[0]![1] === 4) {
    return [QUADS, byCount[0]![0], byCount[1]![0]];
  }
  if (byCount[0]![1] === 3 && byCount[1]![1] === 2) {
    return [FULL_HOUSE, byCount[0]![0], byCount[1]![0]];
  }
  if (isFlush) {
    return [FLUSH, ...ranks];
  }
  if (straightHigh >= 0) {
    return [STRAIGHT, straightHigh];
  }
  if (byCount[0]![1] === 3) {
    const kickers = ranks.filter((r) => r !== byCount[0]![0]).sort((a, b) => b - a);
    return [TRIPS, byCount[0]![0], ...kickers];
  }
  if (byCount[0]![1] === 2 && byCount[1]![1] === 2) {
    const highPair = Math.max(byCount[0]![0], byCount[1]![0]);
    const lowPair = Math.min(byCount[0]![0], byCount[1]![0]);
    const kicker = ranks.find((r) => r !== byCount[0]![0] && r !== byCount[1]![0])!;
    return [TWO_PAIR, highPair, lowPair, kicker];
  }
  if (byCount[0]![1] === 2) {
    const kickers = ranks.filter((r) => r !== byCount[0]![0]).sort((a, b) => b - a);
    return [PAIR, byCount[0]![0], ...kickers];
  }
  return [HIGH_CARD, ...ranks];
}

export function bestHandScore(cards: number[]): HandScore {
  if (cards.length < 5) return [HIGH_CARD];
  if (cards.length === 5) return scoreFive(cards);
  let best: HandScore = [HIGH_CARD];
  const n = cards.length;
  for (let a = 0; a < n - 4; a++) {
    for (let b = a + 1; b < n - 3; b++) {
      for (let c = b + 1; c < n - 2; c++) {
        for (let d = c + 1; d < n - 1; d++) {
          for (let e = d + 1; e < n; e++) {
            const s = scoreFive([cards[a]!, cards[b]!, cards[c]!, cards[d]!, cards[e]!]);
            if (compareScores(s, best) > 0) best = s;
          }
        }
      }
    }
  }
  return best;
}

export function compareScores(a: HandScore, b: HandScore): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function handLabel(score: HandScore): string {
  const cat = score[0] ?? 0;
  const names = [
    "High card",
    "Pair",
    "Two pair",
    "Three of a kind",
    "Straight",
    "Flush",
    "Full house",
    "Four of a kind",
    "Straight flush",
  ];
  return names[cat] ?? "Hand";
}
