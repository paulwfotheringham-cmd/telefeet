"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clubAuthHeaders } from "@/lib/funquiz/club-browser";

type Challenge = { id: string; fromName: string; game: string; path: string; roomCode: string };
type BoardRow = { id: string; email: string; points: number; wins: number; games: number; best: number };

export function FriendsClub({ onLogout, meEmail }: { onLogout: () => void; meEmail: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [board, setBoard] = useState<BoardRow[] | null>(null);
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
    const data = (await res.json()) as { challenges?: Challenge[]; board?: BoardRow[] };
    setChallenges(data.challenges ?? []);
    setBoard(data.board ?? []);
    setError("");
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 8000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="mt-8 space-y-4">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <div className="flex items-end justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Scoreboard</p>
            <p className="mt-1 text-sm text-slate-300">Every login and the scores saved from finished games.</p>
          </div>
          {board ? <p className="text-xs text-slate-400">{board.length} {board.length === 1 ? "login" : "logins"}</p> : null}
        </div>
        {error ? <p className="px-4 pb-3 text-sm text-red-300">{error}</p> : null}
        {!board && !error ? <p className="px-4 pb-4 text-sm text-slate-400">Loading scoreboard…</p> : null}
        {board ? (
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
                {board.map((row, index) => {
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
