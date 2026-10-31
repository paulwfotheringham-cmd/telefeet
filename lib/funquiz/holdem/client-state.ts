import { categoryTitle } from "../categories";
import { difficultyTitle } from "../difficulties";
import { formatCard } from "./cards";
import { handLabel, bestHandScore } from "./eval";
import type { HoldemState } from "./types";
import type { ClientRoomState, HoldemClientView, QuizRoom } from "../types";

function dealerName(room: QuizRoom, h: HoldemState): string {
  const seat = h.dealerSeat;
  return room.players[seat]?.name ?? "Dealer";
}

export function toHoldemClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  const you = room.players.find((p) => p.id === viewerId)!;
  const h = room.holdem!;
  const opponent = room.players.find((p) => p.id !== viewerId);

  const showOppHole =
    h.street === "showdown" || h.street === "hand_over";

  const yourHole = h.holeCards[viewerId];
  const oppHole = opponent ? h.holeCards[opponent.id] : undefined;

  const board = h.board.map(formatCard);
  const toCall = Math.max(0, h.currentBet - (h.streetBets[viewerId] ?? 0));
  const minRaise = h.currentBet + h.lastRaiseSize;

  let showdownLabel: string | null = null;
  if (h.street === "showdown" || h.street === "hand_over") {
    if (yourHole && h.board.length >= 3) {
      showdownLabel = handLabel(bestHandScore([...yourHole, ...h.board]));
    }
  }

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
    toCall,
    minRaise,
    currentBet: h.currentBet,
    actionOn: h.actionOn,
    isYourAction: h.actionOn === viewerId,
    canFold: h.actionOn === viewerId && h.street !== "hand_over",
    canCheck: h.actionOn === viewerId && toCall === 0,
    canCall: h.actionOn === viewerId && toCall > 0,
    canRaise: h.actionOn === viewerId && (h.stacks[viewerId] ?? 0) > toCall,
    canAllIn: h.actionOn === viewerId && (h.stacks[viewerId] ?? 0) > 0,
    canDealNextHand:
      room.hostId === viewerId && h.street === "hand_over",
    lastHandSummary: h.lastHandSummary,
    showdownLabel,
    smallBlind: h.smallBlind,
    bigBlind: h.bigBlind,
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
    winnerIds: [],
    you: { id: you.id, name: you.name, score: h.stacks[viewerId] ?? 0, answer: null },
    results: null,
    scorecard: null,
    millionaireView: null,
    holdemView,
    catchphraseView: null,
    blockbustersView: null,
  };
}
