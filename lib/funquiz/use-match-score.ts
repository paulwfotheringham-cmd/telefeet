"use client";

import { useEffect, useRef } from "react";
import { clubAuthHeaders, clubToken } from "./club-browser";

export function useMatchScore(input: {
  game: string;
  roomCode?: string;
  phase?: string;
  score?: number;
  won?: boolean;
}) {
  const sent = useRef("");
  useEffect(() => {
    if (input.phase !== "finished" || !input.roomCode || input.score == null || !clubToken()) return;
    const key = `${input.game}:${input.roomCode}:${input.score}:${input.won ? 1 : 0}`;
    if (sent.current === key) return;
    sent.current = key;
    void fetch("/api/club/score", {
      method: "POST",
      headers: clubAuthHeaders(),
      body: JSON.stringify({
        game: input.game,
        roomCode: input.roomCode,
        score: input.score,
        won: Boolean(input.won),
      }),
    });
  }, [input.game, input.roomCode, input.phase, input.score, input.won]);
}
