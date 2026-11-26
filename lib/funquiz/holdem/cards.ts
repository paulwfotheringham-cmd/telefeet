export type Suit = 0 | 1 | 2 | 3;
export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const RANK_LABELS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"] as const;
const SUIT_LABELS = ["♣", "♦", "♥", "♠"] as const;

export function cardRank(id: number): Rank {
  return Math.floor(id / 4) as Rank;
}

export function cardSuit(id: number): Suit {
  return (id % 4) as Suit;
}

export function formatCard(id: number): string {
  return `${RANK_LABELS[cardRank(id)]}${SUIT_LABELS[cardSuit(id)]}`;
}

export function freshDeck(): number[] {
  return Array.from({ length: 52 }, (_, i) => i);
}

function secureRandomUnit(): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0]! / (0xffffffff + 1);
  }
  return Math.random();
}

export function shuffleDeck(deck: number[], random: () => number = secureRandomUnit): number[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [d[i], d[j]] = [d[j]!, d[i]!];
  }
  return d;
}

/** Two cards per seat, one card per player per round (live-game order). */
export function dealHoleCards(
  deck: number[],
  playerIds: string[],
): { deck: number[]; holeCards: Record<string, [number, number]> } {
  const d = [...deck];
  const holeCards: Record<string, [number, number]> = {};
  const first: number[] = [];
  const second: number[] = [];
  for (let round = 0; round < 2; round++) {
    for (let s = 0; s < playerIds.length; s++) {
      const card = d.pop();
      if (card === undefined) throw new Error("Deck exhausted while dealing hole cards");
      if (round === 0) first[s] = card;
      else second[s] = card;
    }
  }
  const used = new Set<number>();
  for (let s = 0; s < playerIds.length; s++) {
    const id = playerIds[s]!;
    const pair: [number, number] = [first[s]!, second[s]!];
    holeCards[id] = pair;
    if (pair[0] === pair[1]) throw new Error("Duplicate card dealt to same seat");
    used.add(pair[0]);
    used.add(pair[1]);
  }
  if (used.size !== playerIds.length * 2) {
    throw new Error("Duplicate hole cards dealt across the table");
  }
  return { deck: d, holeCards };
}
