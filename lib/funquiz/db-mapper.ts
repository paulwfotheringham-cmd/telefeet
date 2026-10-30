import { isQuizCategoryId } from "./categories";
import { QUIZ_CATEGORY_GENERAL_KNOWLEDGE } from "./categories";
import { isQuizDifficulty } from "./difficulties";
import { QUIZ_DIFFICULTY_INTERMEDIATE } from "./difficulties";
import type { PlayedBankIdsByTopic } from "./question-history";
import { emptyPlayedBankIdsByTopic } from "./question-history";
import type { AnswerLogEntry, GameMode, QuizPhase, QuizPlayer, QuizRoom } from "./types";
import { parseHoldemState } from "./db-mapper-holdem";
import { createInitialHoldemState } from "./holdem/types";
import type { MillionairePlayerRun, MillionaireState } from "./millionaire/types";
import {
  createInitialMillionaireState,
  createInitialParallelMillionaireState,
} from "./millionaire/types";
import {
  GAME_MODE_PARALLEL_MILLIONAIRE,
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_TAKE_TURNS,
  GAME_MODE_TEXAS_HOLDEM,
  QUESTIONS_PER_GAME,
} from "./constants";
import { MILLIONAIRE_QUESTION_COUNT } from "./millionaire/config";

export type FunquizRoomRow = {
  code: string;
  host_id: string;
  phase: QuizPhase;
  question_index: number;
  question_order: number[];
  reveal_started_at: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  players_snapshot?: unknown;
  game_mode?: GameMode;
  quiz_category?: string;
  quiz_difficulty?: string;
  session_id?: string;
  turn_index?: number;
  active_player_id?: string | null;
  host_question_order?: number[] | null;
  guest_question_order?: number[] | null;
  joint_score?: number;
  answer_log?: unknown;
  millionaire_state?: unknown;
  holdem_state?: unknown;
  played_bank_ids_by_topic?: unknown;
};

export type FunquizPlayerRow = {
  room_code: string;
  player_id: string;
  name: string;
  score: number;
  answer: number | null;
};

export function playersToSnapshot(players: QuizPlayer[], roomCode: string): FunquizPlayerRow[] {
  const code = roomCode.toUpperCase();
  return players.map((p) => ({
    room_code: code,
    player_id: p.id,
    name: p.name,
    score: p.score,
    answer: p.answer,
  }));
}

export function playerRowsFromSnapshot(roomCode: string, snapshot: unknown): FunquizPlayerRow[] {
  let parsed: unknown = snapshot;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  const code = roomCode.toUpperCase();
  const rows: FunquizPlayerRow[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const playerId = r.player_id;
    const name = r.name;
    if (typeof playerId !== "string" || typeof name !== "string") continue;
    rows.push({
      room_code: code,
      player_id: playerId,
      name,
      score: typeof r.score === "number" ? r.score : 0,
      answer: typeof r.answer === "number" ? r.answer : r.answer === null ? null : null,
    });
  }
  return rows;
}

function parsePlayerRun(raw: unknown): MillionairePlayerRun | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const lifelines = r.lifelinesUsed as Record<string, boolean> | undefined;
  if (!lifelines || !Array.isArray(r.questionOrder)) return null;
  return {
    questionOrder: r.questionOrder as number[],
    questionIndex: typeof r.questionIndex === "number" ? r.questionIndex : 0,
    phase:
      r.phase === "question" ||
      r.phase === "reveal" ||
      r.phase === "won" ||
      r.phase === "lost" ||
      r.phase === "walkaway"
        ? r.phase
        : "question",
    securedPrize: typeof r.securedPrize === "number" ? r.securedPrize : 0,
    finalAwardedPrize:
      typeof r.finalAwardedPrize === "number" ? r.finalAwardedPrize : null,
    outcome:
      r.outcome === "won" ||
      r.outcome === "lost" ||
      r.outcome === "walkaway" ||
      r.outcome === "playing"
        ? r.outcome
        : "playing",
    lifelinesUsed: {
      fifty_fifty: Boolean(lifelines.fifty_fifty),
      phone_a_friend: Boolean(lifelines.phone_a_friend),
      ask_audience: Boolean(lifelines.ask_audience),
    },
    eliminatedOptionIndices: Array.isArray(r.eliminatedOptionIndices)
      ? (r.eliminatedOptionIndices as number[])
      : [],
    audiencePercents: Array.isArray(r.audiencePercents)
      ? (r.audiencePercents as number[])
      : null,
    phoneFriendHint:
      r.phoneFriendHint && typeof r.phoneFriendHint === "object"
        ? (r.phoneFriendHint as MillionairePlayerRun["phoneFriendHint"])
        : null,
    revealStartedAt:
      typeof r.revealStartedAt === "number" ? r.revealStartedAt : null,
    answerLocked: Boolean(r.answerLocked),
    usedBankIds: Array.isArray(r.usedBankIds) ? (r.usedBankIds as number[]) : [],
  };
}

function parseMillionaireState(raw: unknown): MillionaireState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const lifelines = r.lifelinesUsed as Record<string, boolean> | undefined;
  if (!lifelines) return undefined;
  const variant = r.variant === "parallel" ? "parallel" : "shared";
  let parallelRuns: Record<string, MillionairePlayerRun> | undefined;
  if (r.parallelRuns && typeof r.parallelRuns === "object") {
    parallelRuns = {};
    for (const [id, runRaw] of Object.entries(r.parallelRuns as Record<string, unknown>)) {
      const run = parsePlayerRun(runRaw);
      if (run) parallelRuns[id] = run;
    }
  }
  return {
    variant,
    parallelRuns,
    securedPrize: typeof r.securedPrize === "number" ? r.securedPrize : 0,
    finalAwardedPrize:
      typeof r.finalAwardedPrize === "number" ? r.finalAwardedPrize : null,
    outcome:
      r.outcome === "won" ||
      r.outcome === "lost" ||
      r.outcome === "walkaway" ||
      r.outcome === "playing"
        ? r.outcome
        : "playing",
    lifelinesUsed: {
      fifty_fifty: Boolean(lifelines.fifty_fifty),
      phone_a_friend: Boolean(lifelines.phone_a_friend || lifelines.change_question),
      ask_audience: Boolean(lifelines.ask_audience || lifelines.ask_team),
    },
    eliminatedOptionIndices: Array.isArray(r.eliminatedOptionIndices)
      ? (r.eliminatedOptionIndices as number[])
      : [],
    audiencePercents: Array.isArray(r.audiencePercents)
      ? (r.audiencePercents as number[])
      : null,
    phoneFriendHint:
      r.phoneFriendHint && typeof r.phoneFriendHint === "object"
        ? (r.phoneFriendHint as MillionaireState["phoneFriendHint"])
        : null,
    locks:
      r.locks && typeof r.locks === "object"
        ? (r.locks as MillionaireState["locks"])
        : {},
    usedBankIds: Array.isArray(r.usedBankIds) ? (r.usedBankIds as number[]) : [],
    teamChoiceIndex:
      typeof r.teamChoiceIndex === "number" ? r.teamChoiceIndex : null,
    askTeamActiveUntil:
      typeof r.askTeamActiveUntil === "number" ? r.askTeamActiveUntil : null,
  };
}

function parsePlayedBankIdsByTopic(raw: unknown): PlayedBankIdsByTopic {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyPlayedBankIdsByTopic();
  }
  const out: PlayedBankIdsByTopic = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    const ids: number[] = [];
    for (const item of value) {
      if (typeof item === "number" && Number.isInteger(item)) ids.push(item);
    }
    if (ids.length > 0) out[key] = ids;
  }
  return out;
}

function parseAnswerLog(raw: unknown): AnswerLogEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: AnswerLogEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (
      typeof r.sessionId !== "string" ||
      typeof r.turnIndex !== "number" ||
      typeof r.bankId !== "number" ||
      typeof r.playerId !== "string" ||
      typeof r.choiceIndex !== "number" ||
      typeof r.correct !== "boolean"
    ) {
      continue;
    }
    out.push({
      sessionId: r.sessionId,
      turnIndex: r.turnIndex,
      bankId: r.bankId,
      playerId: r.playerId,
      choiceIndex: r.choiceIndex,
      correct: r.correct,
    });
  }
  return out;
}

export function roomToDbRows(room: QuizRoom): {
  room: Omit<FunquizRoomRow, "created_at"> & { created_at?: string };
  players: FunquizPlayerRow[];
} {
  const expiresAt = new Date(room.createdAt + 4 * 60 * 60 * 1000).toISOString();
  const playerRows = room.players.map((p) => ({
    room_code: room.code.toUpperCase(),
    player_id: p.id,
    name: p.name,
    score: p.score,
    answer: p.answer,
  }));
  return {
    room: {
      code: room.code.toUpperCase(),
      host_id: room.hostId,
      phase: room.phase,
      question_index: room.questionIndex,
      question_order: room.questionOrder,
      reveal_started_at: room.revealStartedAt,
      updated_at: new Date(room.updatedAt).toISOString(),
      expires_at: expiresAt,
      players_snapshot: playerRows,
      game_mode: room.gameMode,
      quiz_category: room.quizCategoryId,
      quiz_difficulty: room.quizDifficulty,
      session_id: room.sessionId,
      turn_index: room.turnIndex,
      active_player_id: room.activePlayerId,
      host_question_order: room.hostQuestionOrder,
      guest_question_order: room.guestQuestionOrder,
      joint_score: room.jointScore,
      answer_log: room.answerLog,
      millionaire_state: room.millionaire ?? null,
      holdem_state: room.holdem ?? null,
      played_bank_ids_by_topic: room.playedBankIdsByTopic,
    },
    players: playerRows,
  };
}

export function dbRowsToRoom(roomRow: FunquizRoomRow, playerRows: FunquizPlayerRow[]): QuizRoom {
  const players: QuizPlayer[] = playerRows.map((p) => ({
    id: p.player_id,
    name: p.name,
    score: p.score,
    answer: p.answer,
  }));
  return {
    code: roomRow.code,
    hostId: roomRow.host_id,
    gameMode:
      roomRow.game_mode === GAME_MODE_SHARED_MILLIONAIRE ||
      roomRow.game_mode === GAME_MODE_PARALLEL_MILLIONAIRE ||
      roomRow.game_mode === GAME_MODE_TAKE_TURNS ||
      roomRow.game_mode === GAME_MODE_PLAY_TOGETHER ||
      roomRow.game_mode === GAME_MODE_TEXAS_HOLDEM
        ? roomRow.game_mode
        : GAME_MODE_PLAY_TOGETHER,
    quizCategoryId:
      roomRow.quiz_category && isQuizCategoryId(roomRow.quiz_category)
        ? roomRow.quiz_category
        : QUIZ_CATEGORY_GENERAL_KNOWLEDGE,
    quizDifficulty:
      roomRow.quiz_difficulty && isQuizDifficulty(roomRow.quiz_difficulty)
        ? roomRow.quiz_difficulty
        : QUIZ_DIFFICULTY_INTERMEDIATE,
    sessionId: roomRow.session_id ?? "legacy",
    phase: roomRow.phase,
    questionIndex: roomRow.question_index,
    questionOrder: roomRow.question_order ?? [],
    hostQuestionOrder: roomRow.host_question_order ?? [],
    guestQuestionOrder: roomRow.guest_question_order ?? [],
    turnIndex: roomRow.turn_index ?? 0,
    activePlayerId: roomRow.active_player_id ?? null,
    jointScore: roomRow.joint_score ?? 0,
    answerLog: parseAnswerLog(roomRow.answer_log),
    players,
    revealStartedAt: roomRow.reveal_started_at,
    millionaire:
      parseMillionaireState(roomRow.millionaire_state) ??
      (roomRow.game_mode === GAME_MODE_SHARED_MILLIONAIRE
        ? createInitialMillionaireState()
        : roomRow.game_mode === GAME_MODE_PARALLEL_MILLIONAIRE
          ? createInitialParallelMillionaireState()
          : undefined),
    holdem:
      parseHoldemState(roomRow.holdem_state) ??
      (roomRow.game_mode === GAME_MODE_TEXAS_HOLDEM ? createInitialHoldemState() : undefined),
    playedBankIdsByTopic: parsePlayedBankIdsByTopic(roomRow.played_bank_ids_by_topic),
    createdAt: new Date(roomRow.created_at).getTime(),
    updatedAt: new Date(roomRow.updated_at).getTime(),
    dbUpdatedAtIso: roomRow.updated_at,
  };
}

export function assertQuestionOrderLength(order: number[], gameMode?: GameMode): void {
  if (order.length === 0) return;
  if (gameMode === GAME_MODE_SHARED_MILLIONAIRE) {
    if (order.length !== MILLIONAIRE_QUESTION_COUNT) {
      throw new Error(
        `question_order must have ${MILLIONAIRE_QUESTION_COUNT} ids for millionaire`,
      );
    }
    return;
  }
  if (order.length !== QUESTIONS_PER_GAME) {
    throw new Error(`question_order must have ${QUESTIONS_PER_GAME} ids when set`);
  }
}
