import {
  AI_NAMES,
  DEALER_HITS_SOFT_17,
  MAX_BET,
  MIN_BET,
  aiSeatsForHumanCount,
  STARTING_BALANCE,
  TABLE_SEAT_COUNT,
} from "./constants";
import { drawCard, freshDeck, sameSplitRank } from "./deck";
import { dealerShouldHit, handTotals } from "./hand";
import { aiDecisionForHand } from "./ai";
import type {
  BlackjackAction,
  BlackjackGameState,
  HandState,
  PlayingCard,
  SeatState,
  SessionStats,
  TableMode,
} from "./types";

let dealCounter = 0;

function newHandId(): string {
  dealCounter += 1;
  return `hand-${dealCounter}`;
}

function makeSeat(id: string, name: string, isHuman: boolean, balance: number): SeatState {
  return {
    id,
    name,
    isHuman,
    balance,
    pendingBet: 0,
    hands: [],
    betPlaced: false,
  };
}

export function createInitialState(
  humanId: string,
  humanName: string,
  stats: SessionStats,
  mode: TableMode = "solo",
  aiCount = 0,
  phaseOverride?: BlackjackGameState["phase"],
): BlackjackGameState {
  const seats: SeatState[] = [
    makeSeat(humanId, humanName || "You", true, stats.balance),
  ];
  const humanCount = seats.filter((s) => s.isHuman).length;
  const finalAi = aiSeatsForHumanCount(humanCount);
  for (let i = 0; i < finalAi; i++) {
    seats.push(
      makeSeat(
        `ai-${i}`,
        AI_NAMES[i] ?? `Guest ${i + 1}`,
        false,
        STARTING_BALANCE,
      ),
    );
  }
  return {
    phase: phaseOverride ?? "setup",
    mode,
    aiSeatCount: finalAi,
    seats,
    dealer: { cards: [] },
    deck: [],
    activeSeatIndex: 0,
    activeHandIndex: 0,
    dealerRevealed: false,
    banner: "Place your bet",
    humanSeatId: humanId,
  };
}

function humanSeat(state: BlackjackGameState): SeatState {
  return state.seats.find((s) => s.id === state.humanSeatId) ?? state.seats[0]!;
}

function clampBet(amount: number, balance: number): number {
  return Math.min(MAX_BET, balance, Math.max(0, amount));
}

let selectedChip = 25;

export function getSelectedChip(): number {
  return selectedChip;
}

export function setSelectedChipGlobal(amount: number): void {
  selectedChip = amount;
}

function applyAiBets(state: BlackjackGameState): BlackjackGameState {
  const seats = state.seats.map((seat) => {
    if (seat.isHuman) return seat;
    const bet = Math.min(MAX_BET, Math.max(MIN_BET, 25));
  const placed = Math.min(seat.balance, bet);
    return {
      ...seat,
      pendingBet: placed,
      betPlaced: placed >= MIN_BET,
      balance: seat.balance - placed,
    };
  });
  return { ...state, seats };
}

function dealInitial(state: BlackjackGameState): BlackjackGameState {
  let deck = freshDeck();
  const playerCards: PlayingCard[][] = state.seats.map(() => []);
  const dealerCards: PlayingCard[] = [];

  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < state.seats.length; i++) {
      const drawn = drawCard(deck);
      deck = drawn.deck;
      playerCards[i] = [...(playerCards[i] ?? []), { ...drawn.card, dealKey: `seat-${i}-${round}` }];
    }
    const drawn = drawCard(deck);
    deck = drawn.deck;
    dealerCards.push(
      round === 1
        ? { ...drawn.card, faceDown: true, dealKey: "dealer-hole" }
        : { ...drawn.card, dealKey: "dealer-up" },
    );
  }

  const seats = state.seats.map((s, i) => {
    const cards = playerCards[i] ?? [];
    const { isBlackjack } = handTotals(cards);
    return {
      ...s,
      pendingBet: 0,
      hands: [
        {
          id: newHandId(),
          cards,
          bet: s.pendingBet,
          doubled: false,
          stood: isBlackjack,
          busted: false,
          outcome: null,
          outcomeLabel: "",
          payout: 0,
        },
      ],
    };
  });
  const dealer: BlackjackGameState["dealer"] = { cards: dealerCards };

  let phase: BlackjackGameState["phase"] = "playerTurn";
  let banner = "Your move";

  const dealerUp = dealer.cards.find((c) => !c.faceDown);
  if (dealerUp && handTotals(dealer.cards, true).isBlackjack) {
    phase = "dealerTurn";
    banner = "Dealer has blackjack";
  }

  return {
    ...state,
    phase,
    seats,
    dealer,
    deck,
    dealerRevealed: false,
    activeSeatIndex: 0,
    activeHandIndex: 0,
    banner,
  };
}

function revealDealer(state: BlackjackGameState): BlackjackGameState {
  return {
    ...state,
    dealerRevealed: true,
    dealer: {
      cards: state.dealer.cards.map((c) => ({ ...c, faceDown: false })),
    },
  };
}

function advanceToNextHand(state: BlackjackGameState): BlackjackGameState | null {
  let { activeSeatIndex, activeHandIndex } = state;
  const seats = state.seats;

  while (activeSeatIndex < seats.length) {
    const seat = seats[activeSeatIndex]!;
    while (activeHandIndex < seat.hands.length) {
      const hand = seat.hands[activeHandIndex]!;
      const { isBlackjack, isBust } = handTotals(hand.cards);
      if (!hand.stood && !hand.busted && !hand.doubled && !isBlackjack && !isBust) {
        return {
          ...state,
          activeSeatIndex,
          activeHandIndex,
          banner: seat.isHuman ? "Your move" : `${seat.name} is thinking…`,
        };
      }
      activeHandIndex++;
    }
    activeSeatIndex++;
    activeHandIndex = 0;
  }
  return null;
}

function runAiTurn(state: BlackjackGameState): BlackjackGameState {
  const seat = state.seats[state.activeSeatIndex];
  if (!seat || seat.isHuman) return state;
  const hand = seat.hands[state.activeHandIndex];
  if (!hand) return state;

  const dealerUp = state.dealer.cards.find((c) => !c.faceDown);
  const upRank = dealerUp?.rank ?? "T";
  const canDouble = hand.cards.length === 2 && !hand.doubled && seat.balance >= hand.bet;
  const canSplit =
    hand.cards.length === 2 &&
    hand.cards[0] &&
    hand.cards[1] &&
    sameSplitRank(hand.cards[0].rank, hand.cards[1].rank) &&
    seat.balance >= hand.bet;

  const decision = aiDecisionForHand(hand, upRank, canDouble, canSplit, seat.balance);

  if (decision === "split") {
    return blackjackReducer(state, { type: "SPLIT" });
  }
  if (decision === "double") {
    return blackjackReducer(state, { type: "DOUBLE" });
  }
  if (decision === "stand") {
    return blackjackReducer(state, { type: "STAND" });
  }
  return blackjackReducer(state, { type: "HIT" });
}

function settleRound(state: BlackjackGameState): { state: BlackjackGameState; statsDelta: Partial<SessionStats> } {
  const dealerCards = state.dealer.cards.map((c) => ({ ...c, faceDown: false }));
  const dealer = handTotals(dealerCards);
  const dealerBj = dealer.isBlackjack;
  const dealerBust = dealer.isBust;

  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let pl = 0;

  const seats = state.seats.map((seat) => {
    let balance = seat.balance;
    const hands = seat.hands.map((hand) => {
      const player = handTotals(hand.cards);
      let outcome = hand.outcome;
      let outcomeLabel = hand.outcomeLabel;
      let payout = 0;

      if (hand.busted) {
        outcome = "bust";
        outcomeLabel = "BUST";
        losses++;
        pl -= hand.bet;
      } else if (player.isBlackjack && dealerBj) {
        outcome = "push";
        outcomeLabel = "PUSH";
        payout = hand.bet;
        pushes++;
      } else if (player.isBlackjack) {
        outcome = "blackjack";
        outcomeLabel = "BLACKJACK";
        payout = hand.bet + Math.floor((hand.bet * 3) / 2);
        wins++;
        pl += payout - hand.bet;
      } else if (dealerBj) {
        outcome = "lose";
        outcomeLabel = "DEALER WINS";
        losses++;
        pl -= hand.bet;
      } else if (dealerBust) {
        outcome = "dealer_bust";
        outcomeLabel = "YOU WIN";
        payout = hand.bet * 2;
        wins++;
        pl += hand.bet;
      } else if (player.total > dealer.total) {
        outcome = "win";
        outcomeLabel = seat.isHuman ? "YOU WIN" : `${seat.name} WINS`;
        payout = hand.bet * 2;
        if (seat.isHuman) {
          wins++;
          pl += hand.bet;
        }
      } else if (player.total < dealer.total) {
        outcome = "lose";
        outcomeLabel = seat.isHuman ? "DEALER WINS" : `${seat.name} LOSES`;
        if (seat.isHuman) {
          losses++;
          pl -= hand.bet;
        }
      } else {
        outcome = "push";
        outcomeLabel = "PUSH";
        payout = hand.bet;
        if (seat.isHuman) {
          pushes++;
        }
      }

      balance += payout;
      return { ...hand, outcome, outcomeLabel, payout };
    });
    return { ...seat, hands, balance };
  });

  const humanPlayed = humanSeat(state).betPlaced || state.phase !== "betting";
  return {
    state: {
      ...state,
      phase: "roundComplete",
      seats,
      dealer: { cards: dealerCards },
      dealerRevealed: true,
      banner: seats.find((s) => s.isHuman)?.hands[0]?.outcomeLabel ?? "Round complete",
    },
    statsDelta: humanPlayed
      ? {
          gamesPlayed: 1,
          wins,
          losses,
          pushes,
          sessionPl: pl,
        }
      : {},
  };
}

export function blackjackReducer(
  state: BlackjackGameState,
  action: BlackjackAction,
): BlackjackGameState {
  switch (action.type) {
    case "SET_MODE": {
      const stats = defaultStatsFromState(state);
      return createInitialState(
        state.humanSeatId,
        humanSeat(state).name,
        stats,
        action.mode,
        0,
        "betting",
      );
    }
    case "SET_AI_COUNT": {
      // Table always holds TABLE_SEAT_COUNT players; AI fill is derived from human count.
      return state;
    }
    case "SELECT_CHIP":
      setSelectedChipGlobal(action.amount);
      return state;
    case "ADD_BET": {
      if (state.phase !== "betting") return state;
      const chip = getSelectedChip();
      const seats = state.seats.map((seat) => {
        if (!seat.isHuman) return seat;
        const next = Math.min(MAX_BET, Math.min(seat.balance, seat.pendingBet + chip));
        return { ...seat, pendingBet: next, betPlaced: false };
      });
      const human = seats.find((s) => s.isHuman)!;
      return {
        ...state,
        seats,
        banner: human.pendingBet > 0 ? `Bet: $${human.pendingBet}` : "Place your bet",
      };
    }
    case "REMOVE_BET": {
      if (state.phase !== "betting") return state;
      const chip = getSelectedChip();
      const seats = state.seats.map((seat) => {
        if (!seat.isHuman) return seat;
        return { ...seat, pendingBet: Math.max(0, seat.pendingBet - chip), betPlaced: false };
      });
      const human = seats.find((s) => s.isHuman)!;
      return { ...state, seats, banner: human.pendingBet > 0 ? `Bet: $${human.pendingBet}` : "Place your bet" };
    }
    case "CLEAR_BET": {
      if (state.phase !== "betting") return state;
      const seats = state.seats.map((seat) =>
        seat.isHuman ? { ...seat, pendingBet: 0, betPlaced: false } : seat,
      );
      return { ...state, seats, banner: "Place your bet" };
    }
    case "PLACE_BET": {
      if (state.phase !== "betting") return state;
      const human = humanSeat(state);
      if (human.pendingBet < MIN_BET || human.pendingBet > MAX_BET) return state;
      if (human.pendingBet > human.balance) return state;
      const afterAi = applyAiBets(state);
      const seats = afterAi.seats.map((seat) => {
        if (!seat.isHuman) return seat;
        return {
          ...seat,
          balance: seat.balance - seat.pendingBet,
          betPlaced: true,
        };
      });
      return { ...afterAi, seats, banner: "Tap Deal" };
    }
    case "DEAL": {
      if (state.phase !== "betting") return state;
      const human = humanSeat(state);
      if (!human.betPlaced || human.pendingBet < MIN_BET) return state;
      const dealt = dealInitial(state);
      const allBj = dealt.seats.every((s) => {
        const h = s.hands[0];
        return !h || h.stood;
      });
      if (allBj || dealt.phase === "dealerTurn") {
        return blackjackReducer(revealDealer(dealt), { type: "FINISH_ROUND" });
      }
      const next = advanceToNextHand(dealt);
      if (next) {
        const seat = next.seats[next.activeSeatIndex]!;
        if (!seat.isHuman) {
          return runAiTurn(next);
        }
        return next;
      }
      return blackjackReducer(revealDealer(dealt), { type: "DEALER_STEP" });
    }
    case "HIT": {
      if (state.phase !== "playerTurn") return state;
      const seat = state.seats[state.activeSeatIndex];
      const hand = seat?.hands[state.activeHandIndex];
      if (!seat || !hand || hand.stood || hand.busted) return state;

      let deck = state.deck;
      const drawn = drawCard(deck);
      deck = drawn.deck;
      const cards = [...hand.cards, { ...drawn.card, dealKey: `hit-${dealCounter}` }];
      const { isBust } = handTotals(cards);
      const hands = [...seat.hands];
      hands[state.activeHandIndex] = {
        ...hand,
        cards,
        busted: isBust,
        stood: isBust,
      };

      let nextState: BlackjackGameState = {
        ...state,
        deck,
        seats: state.seats.map((s, i) =>
          i === state.activeSeatIndex ? { ...seat, hands } : s,
        ),
        banner: isBust ? "BUST" : seat.isHuman ? "Your move" : `${seat.name} hits`,
      };

      if (isBust) {
        const advanced = advanceToNextHand(nextState);
        if (!advanced) {
          return blackjackReducer(revealDealer(nextState), { type: "DEALER_STEP" });
        }
        nextState = advanced;
        const s = nextState.seats[nextState.activeSeatIndex];
        if (s && !s.isHuman) return runAiTurn(nextState);
        return nextState;
      }
      return nextState;
    }
    case "STAND": {
      if (state.phase !== "playerTurn") return state;
      const seat = state.seats[state.activeSeatIndex];
      const hand = seat?.hands[state.activeHandIndex];
      if (!seat || !hand) return state;
      const hands = [...seat.hands];
      hands[state.activeHandIndex] = { ...hand, stood: true };
      let nextState: BlackjackGameState = {
        ...state,
        seats: state.seats.map((s, i) =>
          i === state.activeSeatIndex ? { ...seat, hands } : s,
        ),
      };
      const advanced = advanceToNextHand(nextState);
      if (!advanced) {
        return blackjackReducer(revealDealer(nextState), { type: "DEALER_STEP" });
      }
      nextState = advanced;
      const s = nextState.seats[nextState.activeSeatIndex];
      if (s && !s.isHuman) return runAiTurn(nextState);
      return nextState;
    }
    case "DOUBLE": {
      if (state.phase !== "playerTurn") return state;
      const seat = state.seats[state.activeSeatIndex];
      const hand = seat?.hands[state.activeHandIndex];
      if (!seat || !hand || hand.cards.length !== 2 || seat.balance < hand.bet) return state;
      const extra = hand.bet;
      let deck = state.deck;
      const drawn = drawCard(deck);
      deck = drawn.deck;
      const cards = [...hand.cards, { ...drawn.card, dealKey: `dbl-${dealCounter}` }];
      const { isBust } = handTotals(cards);
      const hands = [...seat.hands];
      hands[state.activeHandIndex] = {
        ...hand,
        cards,
        bet: hand.bet + extra,
        doubled: true,
        stood: true,
        busted: isBust,
      };
      let nextState: BlackjackGameState = {
        ...state,
        deck,
        seats: state.seats.map((s, i) =>
          i === state.activeSeatIndex
            ? { ...seat, balance: seat.balance - extra, hands }
            : s,
        ),
        banner: isBust ? "BUST" : "Doubled down",
      };
      const advanced = advanceToNextHand(nextState);
      if (!advanced) {
        return blackjackReducer(revealDealer(nextState), { type: "DEALER_STEP" });
      }
      nextState = advanced;
      const s = nextState.seats[nextState.activeSeatIndex];
      if (s && !s.isHuman) return runAiTurn(nextState);
      return nextState;
    }
    case "SPLIT": {
      if (state.phase !== "playerTurn") return state;
      const seat = state.seats[state.activeSeatIndex];
      const hand = seat?.hands[state.activeHandIndex];
      if (!seat || !hand || hand.cards.length !== 2) return state;
      const [c0, c1] = hand.cards;
      if (!c0 || !c1 || !sameSplitRank(c0.rank, c1.rank) || seat.balance < hand.bet) return state;

      let deck = state.deck;
      const d0 = drawCard(deck);
      deck = d0.deck;
      const d1 = drawCard(deck);
      deck = d1.deck;

      const handA: HandState = {
        ...hand,
        id: newHandId(),
        cards: [c0, { ...d0.card, dealKey: `split-a` }],
      };
      const handB: HandState = {
        ...hand,
        id: newHandId(),
        cards: [c1, { ...d1.card, dealKey: `split-b` }],
        bet: hand.bet,
        doubled: false,
        stood: false,
        busted: false,
        outcome: null,
        outcomeLabel: "",
        payout: 0,
      };

      const hands = [...seat.hands];
      hands[state.activeHandIndex] = handA;
      hands.splice(state.activeHandIndex + 1, 0, handB);

      return {
        ...state,
        deck,
        seats: state.seats.map((s, i) =>
          i === state.activeSeatIndex
            ? { ...seat, balance: seat.balance - hand.bet, hands }
            : s,
        ),
        banner: "Split",
      };
    }
    case "AI_TICK":
      return runAiTurn(state);
    case "DEALER_STEP": {
      const allPlayerBust = state.seats.every((s) => s.hands.every((h) => h.busted));
      if (allPlayerBust) {
        return blackjackReducer(revealDealer({ ...state, phase: "dealerTurn" }), { type: "FINISH_ROUND" });
      }
      let next = revealDealer({ ...state, phase: "dealerTurn" });
      let cards = next.dealer.cards;
      while (dealerShouldHit(cards, DEALER_HITS_SOFT_17)) {
        dealCounter += 1;
        const drawn = drawCard(next.deck);
        cards = [...cards, { ...drawn.card, faceDown: false, dealKey: `dealer-${dealCounter}` }];
        next = { ...next, deck: drawn.deck, dealer: { cards } };
      }
      return blackjackReducer({ ...next, dealer: { cards } }, { type: "FINISH_ROUND" });
    }
    case "FINISH_ROUND": {
      const { state: settled } = settleRound(revealDealer(state));
      return settled;
    }
    case "NEW_ROUND": {
      const human = humanSeat(state);
      const balance = human.balance;
      const seats = state.seats.map((seat) => ({
        ...makeSeat(seat.id, seat.name, seat.isHuman, seat.isHuman ? balance : seat.balance),
      }));
      return {
        ...state,
        phase: "betting",
        seats,
        dealer: { cards: [] },
        deck: [],
        activeSeatIndex: 0,
        activeHandIndex: 0,
        dealerRevealed: false,
        banner: balance < MIN_BET ? "Insufficient balance — reset session" : "Place your bet",
      };
    }
    case "RESET_SESSION": {
      return createInitialState(
        state.humanSeatId,
        humanSeat(state).name,
        defaultStats(),
        state.mode,
        state.aiSeatCount,
      );
    }
    default:
      return state;
  }
}

function defaultStats(): SessionStats {
  return {
    balance: STARTING_BALANCE,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    sessionPl: 0,
    startedAt: Date.now(),
  };
}

function defaultStatsFromState(state: BlackjackGameState): SessionStats {
  const human = humanSeat(state);
  return { ...defaultStats(), balance: human.balance };
}

export function applyStatsDelta(stats: SessionStats, delta: Partial<SessionStats>): SessionStats {
  const humanBalance = stateBalanceSync(stats, delta);
  return {
    ...stats,
    balance: humanBalance,
    gamesPlayed: stats.gamesPlayed + (delta.gamesPlayed ?? 0),
    wins: stats.wins + (delta.wins ?? 0),
    losses: stats.losses + (delta.losses ?? 0),
    pushes: stats.pushes + (delta.pushes ?? 0),
    sessionPl: stats.sessionPl + (delta.sessionPl ?? 0),
  };
}

function stateBalanceSync(stats: SessionStats, delta: Partial<SessionStats>): number {
  void delta;
  return Math.max(0, stats.balance);
}

export function syncHumanBalance(state: BlackjackGameState, stats: SessionStats): SessionStats {
  const human = humanSeat(state);
  return { ...stats, balance: Math.max(0, human.balance) };
}

export function canHit(state: BlackjackGameState): boolean {
  const seat = state.seats[state.activeSeatIndex];
  const hand = seat?.hands[state.activeHandIndex];
  return (
    state.phase === "playerTurn" &&
    !!seat?.isHuman &&
    !!hand &&
    !hand.stood &&
    !hand.busted &&
    !hand.doubled
  );
}

export function canStand(state: BlackjackGameState): boolean {
  return canHit(state);
}

export function canDouble(state: BlackjackGameState): boolean {
  const seat = state.seats[state.activeSeatIndex];
  const hand = seat?.hands[state.activeHandIndex];
  return (
    canHit(state) &&
    !!hand &&
    hand.cards.length === 2 &&
    (seat?.balance ?? 0) >= hand.bet
  );
}

export function canSplit(state: BlackjackGameState): boolean {
  const seat = state.seats[state.activeSeatIndex];
  const hand = seat?.hands[state.activeHandIndex];
  if (!canHit(state) || !hand || hand.cards.length !== 2) return false;
  const [a, b] = hand.cards;
  if (!a || !b) return false;
  return sameSplitRank(a.rank, b.rank) && (seat?.balance ?? 0) >= hand.bet;
}

export function canDeal(state: BlackjackGameState): boolean {
  const human = humanSeat(state);
  return state.phase === "betting" && human.betPlaced && human.pendingBet >= MIN_BET;
}

export function roundStatsDelta(state: BlackjackGameState): Partial<SessionStats> {
  if (state.phase !== "roundComplete") return {};
  const human = humanSeat(state);
  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let pl = 0;
  for (const hand of human.hands) {
    if (hand.outcome === "blackjack" || hand.outcome === "win" || hand.outcome === "dealer_bust") {
      wins++;
      pl += hand.payout - hand.bet;
    } else if (hand.outcome === "lose" || hand.outcome === "bust") {
      losses++;
      pl -= hand.bet;
    } else if (hand.outcome === "push") {
      pushes++;
    }
  }
  return { gamesPlayed: 1, wins: wins > 0 ? 1 : 0, losses: losses > 0 ? 1 : 0, pushes: pushes > 0 ? 1 : 0, sessionPl: pl };
}