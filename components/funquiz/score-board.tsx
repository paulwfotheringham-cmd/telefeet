"use client";

import { useEffect, useState } from "react";
import { clubAuthHeaders, clubToken } from "@/lib/funquiz/club-browser";

type Row = { id: string; name: string; points: number; wins: number; games: number; best: number };
type Board = {
  meId: string;
  players: Row[];
  games: { title: string; players: Row[] }[];
  matches: { accountId: string; game: string; score: number; won: boolean; playedAt: string }[];
};

function count(value: number, singular: string) {
  return `${value} ${singular}${value === 1 ? "" : "s"}`;
}

function line(row: Row) {
  const best = row.games > 0 ? ` · best ${row.best}` : "";
  return `${row.points} points${best} · ${count(row.wins, "win")} · ${count(row.games, "game")}`;
}

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function ScoreBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!clubToken()) {
      window.location.replace("/funquiz?next=%2Ffunquiz%2Fboard");
      return;
    }
    void fetch("/api/club/board", { headers: clubAuthHeaders(), cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          window.location.replace("/funquiz?next=%2Ffunquiz%2Fboard");
          return;
        }
        if (!res.ok) {
          setError("Could not load the board.");
          return;
        }
        setBoard((await res.json()) as Board);
      })
      .catch(() => setError("Could not load the board."));
  }, []);

  const player = board?.players.find((row) => row.id === selected) ?? null;
  const playerGames = board?.games
    .map((game) => ({ title: game.title, row: game.players.find((row) => row.id === selected) }))
    .filter((game): game is { title: string; row: Row } => Boolean(game.row)) ?? [];
  const playerMatches = board?.matches.filter((row) => row.accountId === selected) ?? [];

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 py-10">
      <a href="/funquiz" className="text-sm font-semibold text-violet-200">Back to Fun Quiz</a>
      <div className="mt-4 rounded-3xl border border-violet-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-6 shadow-2xl shadow-violet-900/40 sm:p-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Two-player quiz</p>
        <h1 className="mt-3 text-center text-4xl font-bold tracking-tight text-white">All-time board</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
          Every registered player, then a leaderboard for each game.
        </p>
        {error ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
        {!board && !error ? <p className="mt-6 text-center text-sm text-slate-400">Loading…</p> : null}

        {board ? (
          <div className="mt-6 space-y-4">
            <section className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-semibold text-violet-200">Registered players · {board.players.length}</p>
              <ul className="mt-2 space-y-2">
                {board.players.map((row, index) => {
                  const open = selected === row.id;
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(open ? "" : row.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${open ? "border-violet-400/60 bg-violet-950/40" : "border-white/10 bg-black/20"}`}
                      >
                        <span className="font-semibold text-white">{index + 1}. {row.name}</span>
                        {row.id === board.meId ? <span className="ml-2 text-xs text-violet-200">you</span> : null}
                        <span className="mt-1 block text-xs text-slate-300">{line(row)}</span>
                      </button>
                    </li>
                  );
                })}
                {board.players.length === 0 ? <li className="text-xs text-slate-400">No accounts yet.</li> : null}
              </ul>
            </section>

            {player ? (
              <section className="rounded-2xl border border-violet-400/40 bg-violet-950/30 p-4">
                <p className="text-sm font-semibold text-white">{player.name}</p>
                <p className="mt-1 text-xs text-slate-300">{line(player)}</p>
                {playerGames.length === 0 ? <p className="mt-3 text-xs text-slate-400">No saved games yet.</p> : null}
                <ul className="mt-3 space-y-2">
                  {playerGames.map((game) => (
                    <li key={game.title} className="text-sm text-slate-200">
                      <span className="font-semibold text-violet-100">{game.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-300">{line(game.row)}</span>
                    </li>
                  ))}
                </ul>
                {playerMatches.length > 0 ? (
                  <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-slate-400">
                    {playerMatches.map((match, index) => (
                      <li key={`${match.playedAt}-${index}`}>
                        {when(match.playedAt)} · {match.game} · {match.score}{match.won ? " · win" : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            <section className="space-y-3">
              <p className="text-sm font-semibold text-violet-200">Scores by game</p>
              {board.games.length === 0 ? <p className="text-xs text-slate-400">No scores saved yet. Finish a game and it will show up here.</p> : null}
              {board.games.map((game) => (
                <div key={game.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-semibold text-white">{game.title}</p>
                  <ul className="mt-2 space-y-2">
                    {game.players.map((row, index) => (
                      <li key={row.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(row.id)}
                          className="w-full text-left text-sm text-slate-200"
                        >
                          <span className="font-semibold text-white">{index + 1}. {row.name}</span>
                          <span className="mt-0.5 block text-xs text-slate-400">{line(row)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
