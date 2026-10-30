import {
  GAME_MODE_PARALLEL_MILLIONAIRE,
  GAME_MODE_PLAY_TOGETHER,
  GAME_MODE_SHARED_MILLIONAIRE,
  GAME_MODE_TAKE_TURNS,
} from "./constants";
import { MILLIONAIRE_LADDER, MILLIONAIRE_QUESTION_COUNT } from "./millionaire/config";
import type { QuizRoom, ScorecardData } from "./types";

export function buildScorecard(room: QuizRoom): ScorecardData | null {
  const terminal =
    room.phase === "finished" ||
    room.phase === "won" ||
    room.phase === "lost" ||
    room.phase === "walkaway";
  if (!terminal) return null;

  if (room.gameMode === GAME_MODE_TAKE_TURNS) {
    const total = 25;
    return {
      kind: "take_turns",
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        correct: p.score,
        total,
      })),
    };
  }

  if (room.gameMode === GAME_MODE_PLAY_TOGETHER) {
    const rows = room.answerLog
      .filter((e) => e.sessionId === room.sessionId)
      .sort((a, b) => a.turnIndex - b.turnIndex);
    let cumulative = 0;
    const cumulativeSeries = rows.map((r, i) => {
      if (r.correct) cumulative += 1;
      return { label: `${i + 1}`, value: cumulative };
    });
    return {
      kind: "play_together",
      correct: room.jointScore,
      total: rows.length,
      cumulativeSeries,
    };
  }

  if (room.gameMode === GAME_MODE_PARALLEL_MILLIONAIRE && room.millionaire?.parallelRuns) {
    const runs = room.millionaire.parallelRuns;
    return {
      kind: "take_turns",
      players: room.players.map((p) => {
        const run = runs[p.id];
        const correct = room.answerLog.filter(
          (e) => e.sessionId === room.sessionId && e.playerId === p.id && e.correct,
        ).length;
        return {
          id: p.id,
          name: p.name,
          correct,
          total: run?.questionIndex ?? 0,
        };
      }),
    };
  }

  if (room.gameMode === GAME_MODE_SHARED_MILLIONAIRE && room.millionaire) {
    const m = room.millionaire;
    const entries = room.answerLog
      .filter((e) => e.sessionId === room.sessionId)
      .sort((a, b) => a.turnIndex - b.turnIndex);
    const ladder = [...MILLIONAIRE_LADDER];
    let runningCorrect = 0;
    const stepSeries = entries.map((e, i) => {
      if (e.correct) runningCorrect += 1;
      const prize = e.correct ? ladder[i] ?? 0 : m.securedPrize;
      return { label: `Q${i + 1}`, value: prize };
    });
    return {
      kind: "millionaire",
      questionsAnswered: entries.length,
      totalQuestions: MILLIONAIRE_QUESTION_COUNT,
      correctCount: runningCorrect,
      finalPrize: m.finalAwardedPrize ?? m.securedPrize,
      maxPrize: ladder[ladder.length - 1] ?? 1_000_000,
      stepSeries,
    };
  }

  return null;
}
