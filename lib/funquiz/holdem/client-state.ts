import { categoryTitle } from "../categories";
import { difficultyTitle } from "../difficulties";
import { formatCard } from "./cards";
import { handLabel, bestHandScore } from "./eval";
import {
  HOLDEM_MAX_RAISE,
  HOLDEM_STARTING_STACK,
  HOLDEM_TURN_MS,
  isHoldemAiId,
  type HoldemState,
} from "./types";
import type { ClientRoomState, HoldemClientView, HoldemSeatView, QuizRoom } from "../types";

function dealerName(room: QuizRoom, h: HoldemState): string {
  const seat = h.dealerSeat % Math.max(1, room.players.length);
  return room.players[seat]?.name ?? "Dealer";
}

function seatRoleIds(room: QuizRoom, h: HoldemState): { sbId: string | null; bbId: string | null } {
  const ids = room.players.map((p) => p.id);
  if (ids.length < 2) return { sbId: null, bbId: null };
  const n = ids.length;
  const dealer = ((h.dealerSeat % n) + n) % n;
  if (n === 2) {
    return { sbId: ids[dealer]!, bbId: ids[(dealer + 1) % 2]! };
  }
  return { sbId: ids[(dealer + 1) % n]!, bbId: ids[(dealer + 2) % n]! };
}

export function toHoldemClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  const you = room.players.find((p) => p.id === viewerId)!;
  const h = room.holdem!;
  const opponents = room.players.filter((p) => p.id !== viewerId);
  const opponent = opponents[0];

  const showOppHole = h.street === "showdown" || h.street === "hand_over";

  const yourHole = h.holeCards[viewerId];
  const oppHole = opponent ? h.holeCards[opponent.id] : undefined;

  const board = h.board.map(formatCard);
  const toCall = Math.max(0, h.currentBet - (h.streetBets[viewerId] ?? 0));
  const minRaise = h.currentBet + h.lastRaiseSize;
  const maxRaise = Math.max(minRaise, h.currentBet + HOLDEM_MAX_RAISE);
  const deadline = h.actionDeadlineAt ?? null;
  const turnSecondsLeft =
    deadline != null && h.actionOn && h.street !== "hand_over"
      ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      : null;

  let showdownLabel: string | null = null;
  if (h.street === "showdown" || h.street === "hand_over") {
    if (yourHole && h.board.length >= 3) {
      showdownLabel = handLabel(bestHandScore([...yourHole, ...h.board]));
    }
  }

  const { sbId, bbId } = seatRoleIds(room, h);
  const winnerId = h.lastWinnerId ?? null;

  const seats: HoldemSeatView[] = room.players.map((player, index) => {
    const hole = h.holeCards[player.id];
    const reveal = player.id === viewerId || showOppHole;
    return {
      playerId: player.id,
      name: player.name,
      stack: h.stacks[player.id] ?? 0,
      isAi: isHoldemAiId(player.id),
      folded: Boolean(h.folded[player.id]),
      allIn: Boolean(h.allIn[player.id]),
      streetBet: h.streetBets[player.id] ?? 0,
      isDealer: index === h.dealerSeat % Math.max(1, room.players.length),
      isSmallBlind: player.id === sbId,
      isBigBlind: player.id === bbId,
      isActing: h.actionOn === player.id,
      isWinner: winnerId === player.id && h.street === "hand_over",
      cards:
        reveal && hole
          ? [formatCard(hole[0]), formatCard(hole[1])]
          : player.id === viewerId
            ? []
            : null,
    };
  });

  const winnerSeat = seats.find((s) => s.isWinner) ?? null;

  const holdemView: HoldemClientView = {
    street: h.street,
    handNumber: h.handNumber,
    dealerSeat: h.dealerSeat,
    dealerName: dealerName(room, h),
    pot: h.pot,
    board,
    yourCards: yourHole ? [formatCard(yourHole[0]), formatCard(yourHole[1])] : [],
    opponentCards:
      showOppHole && oppHole
        ? [formatCard(oppHole[0]), formatCard(oppHole[1])]
        : null,
    yourStack: h.stacks[viewerId] ?? 0,
    opponentStack: opponent ? h.stacks[opponent.id] ?? 0 : 0,
    seats,
    toCall,
    minRaise,
    maxRaise,
    currentBet: h.currentBet,
    actionOn: h.actionOn,
    actionDeadlineAt: deadline,
    turnSecondsLeft,
    isYourAction: h.actionOn === viewerId,
    canFold: h.actionOn === viewerId && h.street !== "hand_over",
    canCheck: h.actionOn === viewerId && toCall === 0,
    canCall: h.actionOn === viewerId && toCall > 0,
    canRaise:
      h.actionOn === viewerId &&
      (h.stacks[viewerId] ?? 0) > toCall &&
      minRaise <= maxRaise,
    canAllIn: h.actionOn === viewerId && (h.stacks[viewerId] ?? 0) > 0,
    canDealNextHand: room.hostId === viewerId && h.street === "hand_over",
    lastHandSummary: h.lastHandSummary,
    lastWinnerId: winnerId,
    lastWinnerName: winnerSeat?.name ?? null,
    lastPotWon: h.lastPotWon ?? 0,
    showdownLabel,
    smallBlind: h.smallBlind,
    bigBlind: h.bigBlind,
    startingStack: HOLDEM_STARTING_STACK,
    maxRaiseSize: HOLDEM_MAX_RAISE,
    turnLimitSeconds: Math.round(HOLDEM_TURN_MS / 1000),
  };

  return {
    code: room.code,
    hostId: room.hostId,
    gameMode: room.gameMode,
    quizCategoryId: room.quizCategoryId,
    quizCategoryTitle: categoryTitle(room.quizCategoryId),
    quizDifficulty: room.quizDifficulty,
    quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
    phase: room.phase,
    questionIndex: 0,
    totalQuestions: 0,
    turnIndex: 0,
    activePlayerId: h.actionOn,
    isYourTurn: h.actionOn === viewerId,
    canSubmitAnswer: false,
    statusMessage: h.statusMessage ?? holdemView.lastHandSummary,
    scoresHidden: false,
    jointScore: null,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: h.stacks[p.id] ?? 0,
      hasAnswered: false,
      answerIndex: null,
      wasCorrect: null,
    })),
    question: null,
    correctIndex: null,
    answerFeedback: null,
    revealEndsAt: null,
    winnerIds: winnerId ? [winnerId] : [],
    you: { id: you.id, name: you.name, score: h.stacks[viewerId] ?? 0, answer: null },
    results: null,
    scorecard: null,
    millionaireView: null,
    holdemView,
    catchphraseView: null,
    blockbustersView: null,
  };
}
