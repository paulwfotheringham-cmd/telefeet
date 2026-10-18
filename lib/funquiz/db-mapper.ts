import type { QuizPhase, QuizPlayer, QuizRoom } from "./types";

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
};

export type FunquizPlayerRow = {
  room_code: string;
  player_id: string;
  name: string;
  score: number;
  answer: number | null;
};

export function roomToDbRows(room: QuizRoom): {
  room: Omit<FunquizRoomRow, "created_at"> & { created_at?: string };
  players: FunquizPlayerRow[];
} {
  const expiresAt = new Date(room.createdAt + 4 * 60 * 60 * 1000).toISOString();
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
    },
    players: room.players.map((p) => ({
      room_code: room.code.toUpperCase(),
      player_id: p.id,
      name: p.name,
      score: p.score,
      answer: p.answer,
    })),
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
    phase: roomRow.phase,
    questionIndex: roomRow.question_index,
    questionOrder: roomRow.question_order,
    players,
    revealStartedAt: roomRow.reveal_started_at,
    createdAt: new Date(roomRow.created_at).getTime(),
    updatedAt: new Date(roomRow.updated_at).getTime(),
  };
}
