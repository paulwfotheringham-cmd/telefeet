import { GAME_MODE_BLOCKBUSTERS, MAX_PLAYERS } from "../constants";
import { gradeAnswer, normalizeChoiceIndex } from "../answer-validation";
import { selectQuestionIdsForCategory } from "../question-selection";
import { getQuestionByBankId } from "../questions";
import type { QuizRoom } from "../types";
import {
  horizontalPlayerWins,
  verticalPlayerWins,
  BOARD_CELL_DEFS,
} from "./board";
import {
  BLOCKBUSTERS_HEX_COUNT,
  BLOCKBUSTERS_REVEAL_MS,
  createInitialBlockbustersState,
  type BlockbustersState,
} from "./types";

export type BlockbustersAction = "pick" | "answer";

const HEX_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isBlockbustersRoom(room: QuizRoom): boolean {
  return room.gameMode === GAME_MODE_BLOCKBUSTERS;
}

function playerIds(room: QuizRoom): [string, string] {
  if (room.players.length < 2) throw new Error("Need two players");
  return [room.players[0]!.id, room.players[1]!.id];
}

function hexCounts(state: BlockbustersState): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of state.cells) {
    if (!c.ownerId) continue;
    m.set(c.ownerId, (m.get(c.ownerId) ?? 0) + 1);
  }
  return m;
}

function syncScores(room: QuizRoom, bb: BlockbustersState): QuizRoom {
  const counts = hexCounts(bb);
  return {
    ...room,
    players: room.players.map((p) => ({ ...p, score: counts.get(p.id) ?? 0 })),
  };
}

function checkWinner(bb: BlockbustersState): string | null {
  const byOwner = new Map<string, number[]>();
  for (const c of bb.cells) {
    if (!c.ownerId) continue;
    const list = byOwner.get(c.ownerId) ?? [];
    list.push(c.id);
    byOwner.set(c.ownerId, list);
  }
  const hIds = byOwner.get(bb.horizontalPlayerId) ?? [];
  const vIds = byOwner.get(bb.verticalPlayerId) ?? [];
  if (horizontalPlayerWins(hIds)) return bb.horizontalPlayerId;
  if (verticalPlayerWins(vIds)) return bb.verticalPlayerId;
  return null;
}

function buildBoard(questionIds: number[]): BlockbustersState["cells"] {
  const letters = shuffleInPlace([...HEX_LETTERS]).slice(0, BLOCKBUSTERS_HEX_COUNT);
  return BOARD_CELL_DEFS.map((def, i) => ({
    id: def.id,
    letter: letters[i] ?? "?",
    bankId: questionIds[i]!,
    ownerId: null,
  }));
}

export function initBlockbustersOnCreate(room: QuizRoom): QuizRoom {
  return { ...room, blockbusters: createInitialBlockbustersState() };
}

export function startBlockbustersGame(room: QuizRoom): QuizRoom {
  if (room.players.length < MAX_PLAYERS) {
    throw new Error("Waiting for a second player");
  }
  const [horizontalId, verticalId] = playerIds(room);
  const played = room.playedBankIdsByTopic;
  const exclude = Object.values(played).flat();
  const pool = selectQuestionIdsForCategory(
    room.quizCategoryId,
    room.quizDifficulty,
    exclude,
  ).slice(0, BLOCKBUSTERS_HEX_COUNT);
  if (pool.length < BLOCKBUSTERS_HEX_COUNT) {
    throw new Error("Not enough questions in this quiz for Blockbusters");
  }

  const bb: BlockbustersState = {
    ...createInitialBlockbustersState(),
    cells: buildBoard(pool),
    pickPlayerId: horizontalId,
    horizontalPlayerId: horizontalId,
    verticalPlayerId: verticalId,
    step: "pick",
    statusMessage:
      "Gold connects left → right. Blue connects top ↓ bottom. Pick a hex to play for it!",
  };

  const started: QuizRoom = {
    ...room,
    phase: "question",
    questionIndex: 0,
    questionOrder: pool,
    activePlayerId: horizontalId,
    blockbusters: bb,
    players: room.players.map((p) => ({ ...p, score: 0, answer: null })),
    updatedAt: Date.now(),
  };
  return syncScores(started, bb);
}

function opponentOf(room: QuizRoom, playerId: string): string {
  const other = room.players.find((p) => p.id !== playerId);
  if (!other) throw new Error("Missing opponent");
  return other.id;
}

function nextPicker(bb: BlockbustersState, lastPicker: string): string {
  return lastPicker === bb.horizontalPlayerId
    ? bb.verticalPlayerId
    : bb.horizontalPlayerId;
}

function afterReveal(room: QuizRoom): QuizRoom {
  const bb = room.blockbusters!;
  if (bb.winnerId) {
    return {
      ...room,
      phase: "finished",
      revealStartedAt: null,
      blockbusters: {
        ...bb,
        statusMessage: "Blockbusters! We have a winner!",
      },
      updatedAt: Date.now(),
    };
  }
  const nextPick = nextPicker(bb, bb.pickPlayerId);
  const cleared: BlockbustersState = {
    ...bb,
    step: "pick",
    selectedCellId: null,
    answerPlayerId: null,
    pickPlayerId: nextPick,
    statusMessage: "Choose your next hex.",
  };
  return syncScores(
    {
      ...room,
      phase: "question",
      revealStartedAt: null,
      activePlayerId: nextPick,
      players: room.players.map((p) => ({ ...p, answer: null })),
      blockbusters: cleared,
      updatedAt: Date.now(),
    },
    cleared,
  );
}

export function blockbustersTickRoom(room: QuizRoom, now = Date.now()): QuizRoom {
  if (!isBlockbustersRoom(room) || !room.blockbusters) return room;
  if (room.phase === "reveal" && room.revealStartedAt !== null) {
    if (now - room.revealStartedAt >= BLOCKBUSTERS_REVEAL_MS) {
      return afterReveal(room);
    }
  }
  return room;
}

function claimCell(
  room: QuizRoom,
  cellId: number,
  ownerId: string,
  message: string,
): QuizRoom {
  const bb = room.blockbusters!;
  const cells = bb.cells.map((c) =>
    c.id === cellId ? { ...c, ownerId } : c,
  );
  let next: BlockbustersState = { ...bb, cells, statusMessage: message };
  const winnerId = checkWinner(next);
  if (winnerId) {
    next = { ...next, winnerId };
  }
  return syncScores(
    {
      ...room,
      phase: "reveal",
      revealStartedAt: Date.now(),
      blockbusters: next,
      updatedAt: Date.now(),
    },
    next,
  );
}

export function blockbustersApplyAction(
  room: QuizRoom,
  playerId: string,
  action: BlockbustersAction,
  cellId?: number,
  choiceIndex?: number,
): QuizRoom {
  if (!isBlockbustersRoom(room) || !room.blockbusters) {
    throw new Error("Not a Blockbusters room");
  }
  if (room.phase === "finished") {
    throw new Error("Game over");
  }
  if (!room.players.some((p) => p.id === playerId)) {
    throw new Error("You are not in this room");
  }

  const bb = room.blockbusters;
  const name = room.players.find((p) => p.id === playerId)?.name ?? "Player";

  if (action === "pick") {
    if (room.phase !== "question" || bb.step !== "pick") {
      throw new Error("Not picking phase");
    }
    if (playerId !== bb.pickPlayerId) {
      throw new Error("Wait for your turn to pick a hex");
    }
    if (cellId === undefined || cellId === null) {
      throw new Error("cellId required");
    }
    const cell = bb.cells.find((c) => c.id === cellId);
    if (!cell) throw new Error("Invalid hex");
    if (cell.ownerId) throw new Error("That hex is already taken");

    const next: BlockbustersState = {
      ...bb,
      step: "answer",
      selectedCellId: cellId,
      answerPlayerId: bb.pickPlayerId,
      statusMessage: `${name} picked ${cell.letter} — answer to claim it!`,
    };
    return {
      ...room,
      phase: "question",
      activePlayerId: bb.pickPlayerId,
      questionIndex: bb.cells.findIndex((c) => c.id === cellId),
      blockbusters: next,
      players: room.players.map((p) => ({ ...p, answer: null })),
      updatedAt: Date.now(),
    };
  }

  if (action === "answer") {
    if (bb.step !== "answer" && bb.step !== "steal") {
      throw new Error("No question active");
    }
    if (playerId !== bb.answerPlayerId) {
      throw new Error("Not your turn to answer");
    }
    const cellIdActive = bb.selectedCellId;
    if (cellIdActive === null) throw new Error("No hex selected");

    const cell = bb.cells.find((c) => c.id === cellIdActive)!;
    const q = getQuestionByBankId(cell.bankId);
    const choice = normalizeChoiceIndex(choiceIndex);
    const graded = gradeAnswer(cell.bankId, choice);
    const correct = graded.correct;
    const logged = {
      ...room,
      answerLog: [
        ...room.answerLog,
        {
          sessionId: room.sessionId,
          turnIndex: room.questionIndex,
          bankId: cell.bankId,
          playerId,
          choiceIndex: choice,
          correct,
        },
      ],
      players: room.players.map((p) =>
        p.id === playerId ? { ...p, answer: choice } : p,
      ),
    };
    const oppId = opponentOf(room, playerId);
    const oppName = room.players.find((p) => p.id === oppId)?.name ?? "Opponent";

    if (correct) {
      return claimCell(
        logged,
        cellIdActive,
        playerId,
        bb.step === "steal"
          ? `${name} steals ${cell.letter}!`
          : `Correct! ${name} claims ${cell.letter}.`,
      );
    }

    if (bb.step === "answer") {
      const steal: BlockbustersState = {
        ...bb,
        step: "steal",
        answerPlayerId: oppId,
        statusMessage: `Wrong! ${oppName} — steal with the right answer.`,
      };
      return {
        ...logged,
        phase: "question",
        activePlayerId: oppId,
        blockbusters: steal,
        players: logged.players.map((p) => ({ ...p, answer: null })),
        updatedAt: Date.now(),
      };
    }

    const qLabel = q.options[q.correctIndex];
    const noClaim: BlockbustersState = {
      ...bb,
      statusMessage: `Both missed — it was "${qLabel}". Hex stays open.`,
    };
    return syncScores(
      {
        ...logged,
        phase: "reveal",
        revealStartedAt: Date.now(),
        blockbusters: noClaim,
        updatedAt: Date.now(),
      },
      noClaim,
    );
  }

  throw new Error("Unknown action");
}

/** Used when persisting topic history after a Blockbusters game ends. */
export function blockbustersQuestionIds(room: QuizRoom): number[] {
  return room.blockbusters?.cells.map((c) => c.bankId) ?? room.questionOrder;
}
