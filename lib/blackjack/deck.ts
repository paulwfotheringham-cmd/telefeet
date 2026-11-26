import type { PlayingCard, Rank, Suit } from "./types";

const SUITS: Suit[] = ["s", "h", "d", "c"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

export function freshDeck(random = Math.random): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return shuffleDeck(deck, random);
}

export function shuffleDeck(deck: PlayingCard[], random = Math.random): PlayingCard[] {
  const d = deck.map((c) => ({ ...c }));
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [d[i], d[j]] = [d[j]!, d[i]!];
  }
  return d;
}

export function drawCard(deck: PlayingCard[]): { card: PlayingCard; deck: PlayingCard[] } {
  const next = [...deck];
  const card = next.pop();
  if (!card) {
    const reshuffled = freshDeck();
    const c = reshuffled.pop()!;
    return { card: c, deck: reshuffled };
  }
  return { card, deck: next };
}

export function cardLabel(card: PlayingCard): string {
  const suitMap: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
  return `${card.rank}${suitMap[card.suit]}`;
}

export function isRedSuit(suit: Suit): boolean {
  return suit === "h" || suit === "d";
}

export function rankValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") return 10;
  return Number(rank);
}

export function sameSplitRank(a: Rank, b: Rank): boolean {
  return rankValue(a) === rankValue(b);
}