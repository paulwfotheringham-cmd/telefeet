"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clubAuthHeaders } from "@/lib/funquiz/club-browser";

type Challenge = { id: string; fromName: string; game: string; path: string; roomCode: string };
type Stat = { points: number; wins: number; games: number; best: number };
type Player = { id: string; email: string } & Stat;
type GameColumn = { title: string; short: string; players: ({ id: string } & Stat)[] };
type Match = { email: string; game: string; score: number; won: boolean; playedAt: string };
type Scoreboard = { players: Player[]; games: GameColumn[]; matches: Match[] };

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function ScoreCell({ stat }: { stat: Stat }) {
  if (stat.games === 0) return <span className="text-slate-500">0</span>;
  return (
    <span>
      <span className="font-semibold text-white">{stat.points}</span>
      <span className="mt-0.5 block text-[10px] leading-tight text-slate-400">
        {stat.games} played · {stat.wins} {stat.wins === 1 ? "win" : "wins"} · best {stat.best}
      </span>
    </span>
  );
}

export function FriendsClub({ onLogout, meEmail }: { onLogout: () => void; meEmail: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [scoreboard, setScoreboard] = useState<Scoreboard | null>(null);
  const [error, setError] = useState("");
  const logoutRef = useRef(onLogout);
  logoutRef.current = onLogout;

  const load = useCallback(async () => {
    const res = await fetch("/api/club/home", { headers: clubAuthHeaders(), cache: "no-store" });
    if (res.status === 401) {
      logoutRef.current();
      return;
    }
    if (!res.ok) {
      setError("Could not load the scoreboard.");
      return;
    }
    const data = (await res.json()) as { challenges?: Challenge[]; scoreboard?: Scoreboard };
    setChallenges(data.challenges ?? []);
    setScoreboard(data.scoreboard ?? { players: [], games: [], matches: [] });
    setError("");
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 8000);
    return () => clearInterval(id);
  }, [load]);

  const players = scoreboard?.players ?? [];
  const games = scoreboard?.games ?? [];
  const matches = scoreboard?.matches ?? [];

  return (
    <div className="mt-8 space-y-4">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <div className="flex items-end justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Scoreboard</p>
            <p className="mt-1 text-sm text-slate-300">Every login, every game, and each saved result.</p>
          </div>
          {scoreboard ? <p className="text-xs text-slate-400">{players.length} {players.length === 1 ? "login" : "logins"}</p> : null}
        </div>
        {error ? <p className="px-4 pb-3 text-sm text-red-300">{error}</p> : null}
        {!scoreboard && !error ? <p className="px-4 pb-4 text-sm text-slate-400">Loading scoreboard…</p> : null}

        {scoreboard ? (
          <div className="space-y-6 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-y border-white/10 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Points</th>
                    <th className="px-4 py-2 font-medium">Wins</th>
                    <th className="px-4 py-2 font-medium">Games</th>
                    <th className="px-4 py-2 font-medium">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((row, index) => {
                    const mine = row.email.toLowerCase() === meEmail.toLowerCase();
                    return (
                      <tr key={row.id} className={mine ? "bg-amber-200/10 text-white" : "text-slate-200"}>
                        <td className="px-4 py-2.5">{index + 1}</td>
                        <td className="px-4 py-2.5 font-medium">
                          {row.email}
                          {mine ? <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-amber-200">you</span> : null}
                        </td>
                        <td className="px-4 py-2.5">{row.points}</td>
                        <td className="px-4 py-2.5">{row.wins}</td>
                        <td className="px-4 py-2.5">{row.games}</td>
                        <td className="px-4 py-2.5">{row.best}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div>
              <p className="px-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/90">Every game</p>
              <p className="mt-1 px-4 text-xs text-slate-400">Points on top. Under a score: games played, wins, and best score. Scroll sideways for the full list.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-y border-white/10 text-left text-xs">
                  <thead className="text-[10px] uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="sticky left-0 z-10 bg-slate-950 px-4 py-2 font-medium">Email</th>
                      {games.map((game) => (
                        <th key={game.title} title={game.title} className="min-w-[7.5rem] px-3 py-2 font-medium">
                          {game.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => {
                      const mine = player.email.toLowerCase() === meEmail.toLowerCase();
                      return (
                        <tr key={player.id} className={mine ? "bg-amber-200/10 text-white" : "text-slate-200"}>
                          <td className={`sticky left-0 z-10 px-4 py-2 font-medium ${mine ? "bg-amber-950" : "bg-slate-950"}`}>
                            {player.email}
                          </td>
                          {games.map((game) => {
                            const stat = game.players.find((row) => row.id === player.id) ?? { points: 0, wins: 0, games: 0, best: 0 };
                            return (
                              <td key={game.title} className="px-3 py-2 align-top">
                                <ScoreCell stat={stat} />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="px-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/90">Saved results</p>
              {matches.length === 0 ? <p className="mt-2 px-4 text-xs text-slate-400">No finished games saved yet.</p> : null}
              {matches.length > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead className="border-y border-white/10 text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-4 py-2 font-medium">When</th>
                        <th className="px-4 py-2 font-medium">Email</th>
                        <th className="px-4 py-2 font-medium">Game</th>
                        <th className="px-4 py-2 font-medium">Score</th>
                        <th className="px-4 py-2 font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match, index) => (
                        <tr key={`${match.playedAt}-${match.email}-${index}`} className="text-slate-200">
                          <td className="px-4 py-2 text-slate-400">{when(match.playedAt)}</td>
                          <td className="px-4 py-2">{match.email}</td>
                          <td className="px-4 py-2">{match.game}</td>
                          <td className="px-4 py-2">{match.score}</td>
                          <td className="px-4 py-2">{match.won ? "Win" : "Loss"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {challenges.length > 0 ? (
        <div className="rounded-2xl border border-violet-400/40 bg-violet-950/40 p-4">
          <p className="text-sm font-semibold text-violet-100">Challenges</p>
          <ul className="mt-2 space-y-2">
            {challenges.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-200">
                <span>{item.fromName} invited you to {item.game}</span>
                <a href={`${item.path}?join=${item.roomCode}`} className="rounded-lg bg-violet-500 px-3 py-1 text-xs font-semibold text-white">Join</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
