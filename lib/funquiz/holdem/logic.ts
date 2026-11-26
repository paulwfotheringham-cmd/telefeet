import { GAME_MODE_TEXAS_HOLDEM } from "../constants";
import type { QuizPlayer, QuizRoom } from "../types";
import { freshDeck, shuffleDeck } from "./cards";
import { bestHandScore, compareScores, handLabel } from "./eval";
import {
  createInitialHoldemState,
  HOLDEM_AI_COUNT,
  HOLDEM_AI_NAMES,
  HOLDEM_BIG_BLIND,
  HOLDEM_MAX_RAISE,
  HOLDEM_SMALL_BLIND,
  HOLDEM_STARTING_STACK,
  HOLDEM_TURN_MS,
  isHoldemAiId,
  type HoldemState,
  type HoldemStreet,
} from "./types";

function raiseBounds(state: HoldemState): { minRaise: number; maxRaise: number } {
  const minRaise = state.currentBet + state.lastRaiseSize;
  const maxRaise = state.currentBet + HOLDEM_MAX_RAISE;
  return { minRaise, maxRaise: Math.max(minRaise, maxRaise) };
}

/** Refresh the 60s clock when the acting seat (or street) changes. */
function withActionClock(prev: HoldemState | null, next: HoldemState, now: number): HoldemState {
  if (!next.actionOn || next.street === "hand_over") {
    return { ...next, actionDeadlineAt: null };
  }
  const seatChanged = !prev || prev.actionOn !== next.actionOn;
  const streetChanged = !prev || prev.street !== next.street || prev.handNumber !== next.handNumber;
  if (seatChanged || streetChanged || next.actionDeadlineAt == null) {
    return { ...next, actionDeadlineAt: now + HOLDEM_TURN_MS };
  }
  return next;
}

export type HoldemAction = "fold" | "check" | "call" | "raise" | "all_in";

export { isHoldemAiId };

export function isHoldemRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_TEXAS_HOLDEM;
}

/** Seat two AI opponents when a lone human opens the table. */
export function ensureHoldemAiOpponents(room: QuizRoom): QuizRoom {
  if (!isHoldemRoom(room)) return room;
  const humans = room.players.filter((player) => !isHoldemAiId(player.id));
  if (humans.length !== 1) return room;
  const existingAi = room.players.filter((player) => isHoldemAiId(player.id));
  if (existingAi.length >= HOLDEM_AI_COUNT) return room;
  const bots: QuizPlayer[] = [];
  for (let index = existingAi.length; index < HOLDEM_AI_COUNT; index++) {
    bots.push({
      id: `ai-holdem-${index + 1}`,
      name: HOLDEM_AI_NAMES[index] ?? `AI ${index + 1}`,
      score: 0,
      answer: null,
    });
  }
  return {
    ...room,
    players: [...room.players, ...bots],
    updatedAt: Date.now(),
  };
}

function seatIds(room: QuizRoom): string[] {
  if (room.players.length < 2) throw new Error("Need at least two players");
  return room.players.map((player) => player.id);
}

function seatCount(room: QuizRoom): number {
  return seatIds(room).length;
}

function normalizeDealerSeat(state: HoldemState, room: QuizRoom): number {
  const n = seatCount(room);
  return ((state.dealerSeat % n) + n) % n;
}

/** Heads-up: button is SB. Multiway: SB is left of button. */
function sbId(state: HoldemState, room: QuizRoom): string {
  const ids = seatIds(room);
  const dealer = normalizeDealerSeat(state, room);
  if (ids.length === 2) return ids[dealer]!;
  return ids[(dealer + 1) % ids.length]!;
}

function bbId(state: HoldemState, room: QuizRoom): string {
  const ids = seatIds(room);
  const dealer = normalizeDealerSeat(state, room);
  if (ids.length === 2) return ids[(dealer + 1) % 2]!;
  return ids[(dealer + 2) % ids.length]!;
}

function firstToActPreflop(state: HoldemState, room: QuizRoom): string {
  const ids = seatIds(room);
  if (ids.length === 2) return sbId(state, room);
  const dealer = normalizeDealerSeat(state, room);
  return ids[(dealer + 3) % ids.length]!;
}

function firstToActPostflop(state: HoldemState, room: QuizRoom): string {
  const ids = seatIds(room);
  const dealer = normalizeDealerSeat(state, room);
  if (ids.length === 2) return bbId(state, room);
  for (let step = 1; step <= ids.length; step++) {
    const id = ids[(dealer + step) % ids.length]!;
    if (!state.folded[id] && (state.stacks[id] ?? 0) > 0) return id;
  }
  return sbId(state, room);
}

function postBlind(state: HoldemState, playerId: string, amount: number): HoldemState {
  const pay = Math.min(amount, state.stacks[playerId] ?? 0);
  const stacks = { ...state.stacks, [playerId]: (state.stacks[playerId] ?? 0) - pay };
  const streetBets = {
    ...state.streetBets,
    [playerId]: (state.streetBets[playerId] ?? 0) + pay,
  };
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
  const alive = seatIds(room).filter((id) => !state.folded[id]);
  if (alive.length <= 1) return true;
  return alive.every((id) => !playerNeedsAction(state, id));
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
  const alive = seatIds(room).filter((id) => !s.folded[id] && (s.stacks[id] ?? 0) > 0);
  s.actionOn = next === "preflop" ? firstToActPreflop(s, room) : firstToActPostflop(s, room);
  if (alive.length === 1) {
    return awardPotTo(s, room, alive[0]!, "Opponent folded");
  }
  s.statusMessage = `${next.toUpperCase()} — action continues`;
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
  const contenders = seatIds(room).filter((id) => !state.folded[id]);
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
  const seated = ensureHoldemAiOpponents(room);
  if (seated.players.length < 2) {
    throw new Error("Waiting for a second player");
  }
  let holdem = createInitialHoldemState();
  for (const p of seated.players) {
    holdem.stacks[p.id] = HOLDEM_STARTING_STACK;
  }
  return dealNewHand({ ...seated, holdem, phase: "question" });
}

export function dealNewHand(room: QuizRoom): QuizRoom {
  if (!isHoldemRoom(room) || !room.holdem) throw new Error("Not a holdem room");
  const ids = seatIds(room);
  let holdem = { ...room.holdem };
  if (holdem.handNumber > 0) {
    holdem = {
      ...holdem,
      dealerSeat: (normalizeDealerSeat(holdem, room) + 1) % ids.length,
    };
  }
  holdem.handNumber += 1;
  const deck = shuffleDeck(freshDeck());
  const holeCards: Record<string, [number, number]> = {};
  const streetBets: Record<string, number> = {};
  const folded: Record<string, boolean> = {};
  const allIn: Record<string, boolean> = {};
  for (const id of ids) {
    holeCards[id] = [deck.pop()!, deck.pop()!];
    streetBets[id] = 0;
    folded[id] = false;
    allIn[id] = false;
  }
  holdem = {
    ...holdem,
    street: "preflop",
    deck,
    board: [],
    holeCards,
    pot: 0,
    currentBet: 0,
    streetBets,
    folded,
    allIn,
    actedThisStreet: {},
    lastHandSummary: null,
    statusMessage: "Blinds posted.",
    smallBlind: HOLDEM_SMALL_BLIND,
    bigBlind: HOLDEM_BIG_BLIND,
    lastRaiseSize: HOLDEM_BIG_BLIND,
  };
  holdem = postBlind(holdem, sbId(holdem, room), HOLDEM_SMALL_BLIND);
  holdem = postBlind(holdem, bbId(holdem, room), HOLDEM_BIG_BLIND);
  holdem.actionOn = firstToActPreflop(holdem, room);
  holdem.actedThisStreet[bbId(holdem, room)] = true;
  holdem = withActionClock(room.holdem, holdem, Date.now());

  const players: QuizPlayer[] = room.players.map((p) => ({
    ...p,
    score: holdem.stacks[p.id] ?? 0,
    answer: null,
  }));

  return finishWithAi({
    ...room,
    holdem,
    players,
    phase: "question",
    updatedAt: Date.now(),
  });
}

function afterAction(state: HoldemState, room: QuizRoom): HoldemState {
  let s = state;
  const alive = seatIds(room).filter((id) => !s.folded[id]);
  if (alive.length === 1) {
    return awardPotTo(s, room, alive[0]!, "fold");
  }
  if (bettingClosed(s, room)) {
    const everyoneAllIn = alive.every((id) => s.allIn[id] || (s.stacks[id] ?? 0) === 0);
    if (everyoneAllIn && s.street !== "river") {
      return runoutIfAllIn(s, room);
    }
    return advanceStreet(s, room);
  }
  const ids = seatIds(room);
  const start = ids.indexOf(s.actionOn ?? ids[0]!);
  for (let i = 1; i <= ids.length; i++) {
    const next = ids[(start + i) % ids.length]!;
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
    return finishWithAi(syncRoom(room, s));
  }

  if (action === "check") {
    if (toCall > 0) throw new Error("Cannot check — must call or fold");
    s = afterAction(s, room);
    return finishWithAi(syncRoom(room, s));
  }

  if (action === "call") {
    const pay = Math.min(toCall, stack);
    s = postBlind(s, playerId, pay);
    s = afterAction(s, room);
    return finishWithAi(syncRoom(room, s));
  }

  if (action === "all_in") {
    s = postBlind(s, playerId, stack);
    s = afterAction(s, room);
    return finishWithAi(syncRoom(room, s));
  }

  if (action === "raise") {
    const { minRaise, maxRaise } = raiseBounds(s);
    let target = raiseTo ?? minRaise;
    if (target < minRaise && stack > toCall) {
      throw new Error(`Minimum raise to ${minRaise}`);
    }
    if (target > maxRaise && myBet + stack > maxRaise) {
      throw new Error(`Maximum raise to ${maxRaise}`);
    }
    target = Math.min(target, maxRaise);
    const total = Math.min(myBet + stack, target);
    const add = total - myBet;
    const prevBet = s.currentBet;
    s = postBlind(s, playerId, add);
    if (s.currentBet > prevBet) {
      s.lastRaiseSize = Math.min(HOLDEM_MAX_RAISE, s.currentBet - prevBet);
      s.actedThisStreet = { ...s.actedThisStreet, [playerId]: true };
      for (const id of seatIds(room)) {
        if (id === playerId || s.folded[id] || s.allIn[id]) continue;
        s.actedThisStreet[id] = false;
      }
    }
    s = afterAction(s, room);
    return finishWithAi(syncRoom(room, s));
  }

  throw new Error("Unknown action");
}

function syncRoom(room: QuizRoom, holdem: HoldemState, now = Date.now()): QuizRoom {
  const stamped = withActionClock(room.holdem ?? null, holdem, now);
  const players = room.players.map((p) => ({
    ...p,
    score: stamped.stacks[p.id] ?? p.score,
  }));
  return {
    ...room,
    holdem: stamped,
    players,
    phase: stamped.street === "hand_over" ? "finished" : "question",
    updatedAt: now,
  };
}

function chooseBotAction(
  state: HoldemState,
  playerId: string,
): { action: HoldemAction; raiseTo?: number } {
  const stack = state.stacks[playerId] ?? 0;
  const myBet = state.streetBets[playerId] ?? 0;
  const toCall = Math.max(0, state.currentBet - myBet);
  const seed = (state.handNumber * 17 + playerId.length * 3 + state.board.length * 5) % 100;

  const { minRaise, maxRaise } = raiseBounds(state);
  if (toCall <= 0) {
    if (seed < 18 && stack > state.bigBlind * 3) {
      return { action: "raise", raiseTo: Math.min(minRaise, maxRaise) };
    }
    return { action: "check" };
  }
  if (toCall >= stack) {
    return seed < 45 ? { action: "all_in" } : { action: "fold" };
  }
  if (toCall > state.bigBlind * 5) {
    return seed < 35 ? { action: "call" } : { action: "fold" };
  }
  if (seed < 12 && stack > toCall + state.bigBlind * 2) {
    return { action: "raise", raiseTo: Math.min(minRaise, maxRaise) };
  }
  return { action: "call" };
}

/** Keep acting for AI seats until a human must act or the hand ends. */
export function runHoldemAiTurns(room: QuizRoom): QuizRoom {
  let current = room;
  for (let step = 0; step < 48; step++) {
    const h = current.holdem;
    if (!h || h.street === "hand_over" || !h.actionOn) break;
    if (!isHoldemAiId(h.actionOn)) break;
    const choice = chooseBotAction(h, h.actionOn);
    current = holdemApplyActionRaw(current, h.actionOn, choice.action, choice.raiseTo);
  }
  return current;
}

/** Apply without re-entering AI loop (used by the AI runner). */
function holdemApplyActionRaw(
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
    return syncRoom(room, afterAction(s, room));
  }
  if (action === "check") {
    if (toCall > 0) throw new Error("Cannot check — must call or fold");
    return syncRoom(room, afterAction(s, room));
  }
  if (action === "call") {
    return syncRoom(room, afterAction(postBlind(s, playerId, Math.min(toCall, stack)), room));
  }
  if (action === "all_in") {
    return syncRoom(room, afterAction(postBlind(s, playerId, stack), room));
  }
  if (action === "raise") {
    const { minRaise, maxRaise } = raiseBounds(s);
    let target = raiseTo ?? minRaise;
    if (target < minRaise && stack > toCall) {
      throw new Error(`Minimum raise to ${minRaise}`);
    }
    if (target > maxRaise && myBet + stack > maxRaise) {
      throw new Error(`Maximum raise to ${maxRaise}`);
    }
    target = Math.min(target, maxRaise);
    const total = Math.min(myBet + stack, target);
    const add = total - myBet;
    const prevBet = s.currentBet;
    s = postBlind(s, playerId, add);
    if (s.currentBet > prevBet) {
      s.lastRaiseSize = Math.min(HOLDEM_MAX_RAISE, s.currentBet - prevBet);
      s.actedThisStreet = { ...s.actedThisStreet, [playerId]: true };
      for (const id of seatIds(room)) {
        if (id === playerId || s.folded[id] || s.allIn[id]) continue;
        s.actedThisStreet[id] = false;
      }
    }
    return syncRoom(room, afterAction(s, room));
  }
  throw new Error("Unknown action");
}

function finishWithAi(room: QuizRoom): QuizRoom {
  return runHoldemAiTurns(room);
}

export function initHoldemOnCreate(room: QuizRoom): QuizRoom {
  if (!isHoldemRoom(room)) return room;
  return { ...room, holdem: createInitialHoldemState() };
}

export function holdemTickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (!isHoldemRoom(room) || !room.holdem) return room;
  let current = room;
  const acting = current.holdem?.actionOn;
  if (acting && isHoldemAiId(acting)) {
    current = runHoldemAiTurns(current);
  }
  const h = current.holdem;
  if (!h?.actionOn || h.street === "hand_over") return current;
  if (isHoldemAiId(h.actionOn)) return current;
  const deadline = h.actionDeadlineAt;
  if (deadline == null || now < deadline) return current;
  const seat = h.actionOn;
  const myBet = h.streetBets[seat] ?? 0;
  const toCall = Math.max(0, h.currentBet - myBet);
  try {
    return holdemApplyAction(current, seat, toCall > 0 ? "fold" : "check");
  } catch {
    return current;
  }
}
