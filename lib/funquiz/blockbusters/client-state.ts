import { categoryTitle } from "../categories";
import { difficultyTitle } from "../difficulties";
import { getQuestionByBankId, toPublicQuestion } from "../questions";
import type { ClientRoomState, QuizRoom } from "../types";
import { BOARD_CELL_DEFS } from "./board";
import { isBlockbustersRoom } from "./logic";
import { BLOCKBUSTERS_HEX_COUNT, BLOCKBUSTERS_REVEAL_MS } from "./types";

export type BlockbustersClientCell = {
  id: number;
  letter: string;
  row: number;
  col: number;
  wide: boolean;
  ownerId: string | null;
  selectable: boolean;
};

export type BlockbustersClientView = {
  step: "pick" | "answer" | "steal";
  cells: BlockbustersClientCell[];
  horizontalPlayerId: string;
  verticalPlayerId: string;
  pickPlayerId: string;
  answerPlayerId: string | null;
  selectedCellId: number | null;
  canPick: boolean;
  canAnswer: boolean;
  yourRole: "horizontal" | "vertical";
  statusMessage: string | null;
  revealEndsAt: number | null;
  soundToken: string;
};

export function toBlockbustersClientState(room: QuizRoom, viewerId: string): ClientRoomState {
  const you = room.players.find((p) => p.id === viewerId)!;
  const bb = room.blockbusters!;
  const defById = new Map(BOARD_CELL_DEFS.map((d) => [d.id, d]));

  const cells: BlockbustersClientCell[] = bb.cells.map((c) => {
    const def = defById.get(c.id)!;
    const selectable =
      room.phase === "question" &&
      bb.step === "pick" &&
      bb.pickPlayerId === viewerId &&
      !c.ownerId;
    return {
      id: c.id,
      letter: c.letter,
      row: def.row,
      col: def.col,
      wide: def.wide,
      ownerId: c.ownerId,
      selectable,
    };
  });

  const canPick = bb.step === "pick" && bb.pickPlayerId === viewerId && room.phase === "question";
  const canAnswer =
    (bb.step === "answer" || bb.step === "steal") &&
    bb.answerPlayerId === viewerId &&
    room.phase === "question";

  let question = null;
  let correctIndex: number | null = null;
  let answerFeedback = null;

  if (bb.selectedCellId !== null && (bb.step === "answer" || bb.step === "steal" || room.phase === "reveal")) {
    const cell = bb.cells.find((c) => c.id === bb.selectedCellId);
    if (cell) {
      const q = getQuestionByBankId(cell.bankId);
      question = toPublicQuestion(q);
      if (room.phase === "reveal") {
        correctIndex = q.correctIndex;
        const entry = room.answerLog.filter((e) => e.sessionId === room.sessionId).at(-1);
        if (entry && entry.bankId === cell.bankId) {
          answerFeedback = {
            correct: entry.correct,
            choiceIndex: entry.choiceIndex,
            correctIndex: q.correctIndex,
            chosenLabel: q.options[entry.choiceIndex] ?? "",
            correctLabel: q.options[q.correctIndex],
          };
        }
      }
    }
  }

  const revealEndsAt =
    room.phase === "reveal" && room.revealStartedAt
      ? room.revealStartedAt + BLOCKBUSTERS_REVEAL_MS
      : null;

  const soundToken = `${room.phase}-${bb.step}-${bb.selectedCellId ?? "x"}-${room.revealStartedAt ?? 0}-${bb.cells.map((c) => c.ownerId ?? "-").join("")}`;

  const blockbustersView: BlockbustersClientView = {
    step: bb.step,
    cells,
    horizontalPlayerId: bb.horizontalPlayerId,
    verticalPlayerId: bb.verticalPlayerId,
    pickPlayerId: bb.pickPlayerId,
    answerPlayerId: bb.answerPlayerId,
    selectedCellId: bb.selectedCellId,
    canPick,
    canAnswer,
    yourRole: viewerId === bb.horizontalPlayerId ? "horizontal" : "vertical",
    statusMessage: bb.statusMessage,
    revealEndsAt,
    soundToken,
  };

  const winnerIds = bb.winnerId ? [bb.winnerId] : [];

  return {
    code: room.code,
    hostId: room.hostId,
    gameMode: room.gameMode,
    quizCategoryId: room.quizCategoryId,
    quizCategoryTitle: categoryTitle(room.quizCategoryId),
    quizDifficulty: room.quizDifficulty,
    quizDifficultyTitle: difficultyTitle(room.quizDifficulty),
    phase: room.phase,
    questionIndex: room.questionIndex,
    totalQuestions: BLOCKBUSTERS_HEX_COUNT,
    turnIndex: room.questionIndex,
    activePlayerId: bb.answerPlayerId ?? bb.pickPlayerId,
    isYourTurn: canPick || canAnswer,
    canSubmitAnswer: canAnswer,
    statusMessage: bb.statusMessage,
    scoresHidden: false,
    jointScore: null,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      hasAnswered: p.answer !== null,
      answerIndex: p.answer,
      wasCorrect: null,
    })),
    question,
    correctIndex,
    answerFeedback,
    revealEndsAt,
    winnerIds: bb.winnerId ? [bb.winnerId] : winnerIds,
    you: { id: you.id, name: you.name, score: you.score, answer: you.answer },
    results: null,
    scorecard: null,
    millionaireView: null,
    holdemView: null,
    catchphraseView: null,
    blockbustersView,
  };
}

export function blockbustersClientStateOrNull(
  room: QuizRoom,
  viewerId: string,
): ClientRoomState | null {
  if (!isBlockbustersRoom(room) || !room.blockbusters) return null;
  if (!room.players.some((p) => p.id === viewerId)) return null;
  return toBlockbustersClientState(room, viewerId);
}
