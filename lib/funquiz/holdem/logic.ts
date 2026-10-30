import { GAME_MODE_TEXAS_HOLDEM, MAX_PLAYERS } from "../constants";
import type { QuizPlayer, QuizRoom } from "../types";
import { freshDeck, shuffleDeck } from "./cards";
import { bestHandScore, compareScores, handLabel } from "./eval";
import {
  createInitialHoldemState,
  HOLDEM_BIG_BLIND,
  HOLDEM_SMALL_BLIND,
  HOLDEM_STARTING_STACK,
  type HoldemState,
  type HoldemStreet,
} from "./types";

export type HoldemAction = "fold" | "check" | "call" | "raise" | "all_in";

export function isHoldemRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_TEXAS_HOLDEM;
}

function seatIds(room: QuizRoom): [string, string] {
  if (room.players.length < 2) throw new Error("Need two players");
  return [room.players[0]!.id, room.players[1]!.id];
}

function sbId(state: HoldemState, room: QuizRoom): string {
  const [s0, s1] = seatIds(room);
  return state.dealerSeat === 0 ? s0 : s1;
}

function bbId(state: HoldemState, room: QuizRoom): string {
  const [s0, s1] = seatIds(room);
  return state.dealerSeat === 0 ? s1 : s0;
}

function postBlind(
  state: HoldemState,
  playerId: string,
  amount: number,
): HoldemState {
  const pay = Math.min(amount, state.stacks[playerId] ?? 0);
  const stacks = { ...state.stacks, [playerId]: (state.stacks[playerId] ?? 0) - pay };
  const streetBets = { ...state.streetBets, [playerId]: (state.streetBets[playerId] ?? 0) + pay };
  const allIn = { ...state.allIn, [playerId]: stacks[playerId] === 0 };
  return {
    ...state,
    stacks,
    streetBets,
    pot: state.pot + pay,
    allIn,
    currentBet: Math.max(state.currentBet, streetBets[playerId] ?? 0),
  };
}

function playerNeedsAction(state: HoldemState, id: string): boolean {
  if (state.folded[id]) return false;
  const stack = state.stacks[id] ?? 0;
  if (stack <= 0) return false;
  const bet = state.streetBets[id] ?? 0;
  if (bet < state.currentBet) return true;
  return !state.actedThisStreet[id];
}

function bettingClosed(state: HoldemState, room: QuizRoom): boolean {
  const alive = room.players.map((p) => p.id).filter((id) => !state.folded[id]);
  if (alive.length <= 1) return true;
  return alive.every((id) => !playerNeedsAction(state, id));
}

function firstToActPostflop(state: HoldemState, room: QuizRoom): string {
  return bbId(state, room);
}

function firstToActPreflop(state: HoldemState, room: QuizRoom): string {
  return sbId(state, room);
}

function dealBoard(state: HoldemState, count: number): HoldemState {
  const deck = [...state.deck];
  const burn = deck.pop();
  if (burn === undefined) throw new Error("Deck empty");
  const board = [...state.board];
  for (let i = 0; i < count; i++) {
    const c = deck.pop();
    if (c === undefined) throw new Error("Deck empty");
    board.push(c);
  }
  return { ...state, deck, board };
}

function resetStreetBets(state: HoldemState): HoldemState {
  const streetBets: Record<string, number> = {};
  for (const id of Object.keys(state.stacks)) streetBets[id] = 0;
  return {
    ...state,
    streetBets,
    currentBet: 0,
    lastRaiseSize: state.bigBlind,
    actedThisStreet: {},
  };
}

function advanceStreet(state: HoldemState, room: QuizRoom): HoldemState {
  let s = resetStreetBets(state);
  const order: HoldemStreet[] = ["preflop", "flop", "turn", "river", "showdown"];
  const idx = order.indexOf(s.street);
  if (idx < 0 || idx >= order.length - 1) return s;
  const next = order[idx + 1]!;
  if (next === "flop") s = dealBoard(s, 3);
  else if (next === "turn" || next === "river") s = dealBoard(s, 1);
  s = { ...s, street: next };
  if (next === "showdown") {
    return resolveShowdown(s, room);
  }
  const alive = room.players.map((p) => p.id).filter((id) => !s.folded[id] && (s.stacks[id] ?? 0) > 0);
  s.actionOn = next === "preflop" ? firstToActPreflop(s, room) : firstToActPostflop(s, room);
  if (alive.length === 1) {
    return awardPotTo(s, room, alive[0]!, "Opponent folded");
  }
  s.statusMessage = `${next.toUpperCase()} — your action`;
  return s;
}

function awardPotTo(state: HoldemState, room: QuizRoom, winnerId: string, reason: string): HoldemState {
  const stacks = { ...state.stacks, [winnerId]: (state.stacks[winnerId] ?? 0) + state.pot };
  const name = room.players.find((p) => p.id === winnerId)?.name ?? "Player";
  return {
    ...state,
    stacks,
    pot: 0,
    street: "hand_over",
    actionOn: null,
    lastHandSummary: `${name} wins ${reason}.`,
    statusMessage: "Hand complete — host can deal next hand.",
  };
}

function resolveShowdown(state: HoldemState, room: QuizRoom): HoldemState {
  const contenders = room.players.map((p) => p.id).filter((id) => !state.folded[id]);
  if (contenders.length === 1) {
    return awardPotTo(state, room, contenders[0]!, "everyone else folded");
  }
  let bestId = contenders[0]!;
  let bestScore = bestHandScore([...state.holeCards[bestId]!, ...state.board]);
  for (let i = 1; i < contenders.length; i++) {
    const id = contenders[i]!;
    const score = bestHandScore([...state.holeCards[id]!, ...state.board]);
    if (compareScores(score, bestScore) > 0) {
      bestId = id;
      bestScore = score;
    }
  }
  const name = room.players.find((p) => p.id === bestId)?.name ?? "Player";
  const awarded = awardPotTo(state, room, bestId, `showdown (${handLabel(bestScore)})`);
  return { ...awarded, lastHandSummary: `${name} wins — ${handLabel(bestScore)}.` };
}

function runoutIfAllIn(state: HoldemState, room: QuizRoom): HoldemState {
  let s = state;
  while (s.street !== "showdown" && s.street !== "hand_over") {
    if (s.street === "preflop") s = { ...dealBoard(s, 3), street: "flop" };
    else if (s.street === "flop") s = { ...dealBoard(s, 1), street: "turn" };
    else if (s.street === "turn") s = { ...dealBoard(s, 1), street: "river" };
    else if (s.street === "river") {
      s = { ...s, street: "showdown" };
      return resolveShowdown(s, room);
    }
    s = resetStreetBets(s);
  }
  return s.street === "showdown" ? resolveShowdown(s, room) : s;
}

export function startHoldemGame(room: QuizRoom): QuizRoom {
  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  let holdem = createInitialHoldemState();
  for (const p of room.players) {
    holdem.stacks[p.id] = HOLDEM_STARTING_STACK;
  }
  return dealNewHand({ ...room, holdem, phase: "question" });
}

export function dealNewHand(room: QuizRoom): QuizRoom {
  if (!isHoldemRoom(room) || !room.holdem) throw new Error("Not a holdem room");
  const [p0, p1] = seatIds(room);
  let holdem = { ...room.holdem };
  if (holdem.handNumber > 0) {
    holdem = { ...holdem, dealerSeat: (holdem.dealerSeat === 0 ? 1 : 0) as 0 | 1 };
  }
  holdem.handNumber += 1;
  const deck = shuffleDeck(freshDeck());
  const holeCards: Record<string, [number, number]> = {
    [p0]: [deck.pop()!, deck.pop()!],
    [p1]: [deck.pop()!, deck.pop()!],
  };
  holdem = {
    ...holdem,
    street: "preflop",
    deck,
    board: [],
    holeCards,
    pot: 0,
    currentBet: 0,
    streetBets: { [p0]: 0, [p1]: 0 },
    folded: { [p0]: false, [p1]: false },
    allIn: { [p0]: false, [p1]: false },
    actedThisStreet: {},
    lastHandSummary: null,
    statusMessage: "Blinds posted — action on small blind (dealer).",
  };
  holdem = postBlind(holdem, sbId(holdem, room), HOLDEM_SMALL_BLIND);
  holdem = postBlind(holdem, bbId(holdem, room), HOLDEM_BIG_BLIND);
  holdem.actionOn = sbId(holdem, room);
  holdem.actedThisStreet[bbId(holdem, room)] = true;

  const players: QuizPlayer[] = room.players.map((p) => ({
    ...p,
    score: holdem.stacks[p.id] ?? 0,
    answer: null,
  }));

  return {
    ...room,
    holdem,
    players,
    phase: "question",
    updatedAt: Date.now(),
  };
}

function afterAction(state: HoldemState, room: QuizRoom): HoldemState {
  let s = state;
  const alive = room.players.map((p) => p.id).filter((id) => !s.folded[id]);
  if (alive.length === 1) {
    return awardPotTo(s, room, alive[0]!, "fold");
  }
  if (bettingClosed(s, room)) {
    const bothAllIn = alive.every((id) => s.allIn[id] || (s.stacks[id] ?? 0) === 0);
    if (bothAllIn && s.street !== "river") {
      return runoutIfAllIn(s, room);
    }
    return advanceStreet(s, room);
  }
  const ids = seatIds(room);
  const start = ids.indexOf(s.actionOn ?? ids[0]!);
  for (let i = 1; i <= 2; i++) {
    const next = ids[(start + i) % 2]!;
    if (playerNeedsAction(s, next)) {
      return { ...s, actionOn: next };
    }
  }
  return s;
}

export function holdemApplyAction(
  room: QuizRoom,
  playerId: string,
  action: HoldemAction,
  raiseTo?: number,
): QuizRoom {
  if (!isHoldemRoom(room) || !room.holdem) throw new Error("Not in a poker hand");
  const h = room.holdem;
  if (h.street === "hand_over") throw new Error("Hand is over — deal a new hand");
  if (h.actionOn !== playerId) throw new Error("Not your action");

  let s: HoldemState = { ...h, actedThisStreet: { ...h.actedThisStreet, [playerId]: true } };
  const stack = s.stacks[playerId] ?? 0;
  const myBet = s.streetBets[playerId] ?? 0;
  const toCall = s.currentBet - myBet;

  if (action === "fold") {
    s = { ...s, folded: { ...s.folded, [playerId]: true } };
    s.actionOn = null;
    s = afterAction(s, room);
    return syncRoom(room, s);
  }

  if (action === "check") {
    if (toCall > 0) throw new Error("Cannot check — must call or fold");
    s = afterAction(s, room);
    return syncRoom(room, s);
  }

  if (action === "call") {
    const pay = Math.min(toCall, stack);
    s = postBlind(s, playerId, pay);
    s = afterAction(s, room);
    return syncRoom(room, s);
  }

  if (action === "all_in") {
    s = postBlind(s, playerId, stack);
    s = afterAction(s, room);
    return syncRoom(room, s);
  }

  if (action === "raise") {
    const minRaise = s.currentBet + s.lastRaiseSize;
    const target = raiseTo ?? minRaise;
    if (target < minRaise && stack > toCall) {
      throw new Error(`Minimum raise to ${minRaise}`);
    }
    const total = Math.min(myBet + stack, target);
    const add = total - myBet;
    const prevBet = s.currentBet;
    s = postBlind(s, playerId, add);
    if (s.currentBet > prevBet) {
      s.lastRaiseSize = s.currentBet - prevBet;
      s.actedThisStreet = { ...s.actedThisStreet, [playerId]: true };
      const other = seatIds(room).find((id) => id !== playerId)!;
      s.actedThisStreet[other] = false;
    }
    s = afterAction(s, room);
    return syncRoom(room, s);
  }

  throw new Error("Unknown action");
}

function syncRoom(room: QuizRoom, holdem: HoldemState): QuizRoom {
  const players = room.players.map((p) => ({
    ...p,
    score: holdem.stacks[p.id] ?? p.score,
  }));
  return {
    ...room,
    holdem,
    players,
    phase: holdem.street === "hand_over" ? "finished" : "question",
    updatedAt: Date.now(),
  };
}

export function initHoldemOnCreate(room: QuizRoom): QuizRoom {
  if (!isHoldemRoom(room)) return room;
  return { ...room, holdem: createInitialHoldemState() };
}

export function holdemTickRoom(room: QuizRoom): QuizRoom {
  return room;
}
