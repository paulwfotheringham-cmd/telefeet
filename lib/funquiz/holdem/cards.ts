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

export function shuffleDeck(deck: number[], random = Math.random): number[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [d[i], d[j]] = [d[j]!, d[i]!];
  }
  return d;
}
