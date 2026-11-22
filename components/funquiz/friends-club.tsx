"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clearClubSession, clubAuthHeaders, type ClubSession } from "@/lib/funquiz/club-browser";

type Home = {
  online: { id: string; name: string; game: string; path: string; roomCode: string }[];
  board: { name: string; points: number; wins: number; games: number }[];
  recent: { name: string; game: string; score: number; playedAt: string }[];
  weekly: { title: string; path: string; ends: string; leaders: { name: string; score: number }[] };
  challenges: { id: string; fromName: string; game: string; path: string; roomCode: string }[];
};

const CHALLENGE_GAMES = [
  { title: "Fun Quiz", path: "/funquiz", api: "/api/funquiz/room", body: { gameMode: "take_turns" } },
  { title: "Name That Movie", path: "/name-that-movie", api: "/api/name-that-movie/room", body: { difficulty: "medium", mode: "take_turns" } },
  { title: "Name That Tune", path: "/name-that-tune", api: "/api/name-that-tune/room", body: { era: "both", mode: "take_turns" } },
  { title: "Name That Show", path: "/name-that-show", api: "/api/name-that-show/room", body: { era: "both", mode: "take_turns" } },
  { title: "Name That Game", path: "/name-that-game", api: "/api/name-that-game/room", body: { era: "both", mode: "take_turns", level: "medium" } },
  { title: "Draw the Organ", path: "/draw-the-organ", api: "/api/draw-the-organ/room", body: {} },
  { title: "Draw the Animal", path: "/draw-the-animal", api: "/api/draw-the-animal/room", body: {} },
  { title: "Draw the Country", path: "/draw-the-country", api: "/api/draw-the-country/room", body: {} },
  { title: "Draw the Continent", path: "/draw-the-continent", api: "/api/draw-the-continent/room", body: {} },
  { title: "Draw the Appliance", path: "/draw-the-appliance", api: "/api/draw-the-appliance/room", body: {} },
  { title: "Draw the Landmark", path: "/draw-the-landmark", api: "/api/draw-the-landmark/room", body: {} },
  { title: "Draw the Flower", path: "/draw-the-flower", api: "/api/draw-the-flower/room", body: {} },
  { title: "Draw the Weapon", path: "/draw-the-weapon", api: "/api/draw-the-weapon/room", body: {} },
  { title: "Draw the Geography", path: "/draw-the-geography", api: "/api/draw-the-geography/room", body: {} },
  { title: "Draw the Myth", path: "/draw-the-myth", api: "/api/draw-the-myth/room", body: {} },
  { title: "Draw the Fast Food", path: "/draw-the-fast-food", api: "/api/draw-the-fast-food/room", body: {} },
];

export function FriendsClub({ account, onLogout }: { account: ClubSession; onLogout: () => void }) {
  const [home, setHome] = useState<Home | null>(null);
  const [friendId, setFriendId] = useState("");
  const [gameTitle, setGameTitle] = useState(CHALLENGE_GAMES[0]?.title ?? "");
  const [notice, setNotice] = useState("");

  const logoutRef = useRef(onLogout);
  logoutRef.current = onLogout;
  const load = useCallback(async () => {
    const res = await fetch("/api/club/home", { headers: clubAuthHeaders(), cache: "no-store" });
    if (res.status === 401) {
      logoutRef.current();
      return;
    }
    if (!res.ok) return;
    setHome((await res.json()) as Home);
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 8000);
    return () => clearInterval(id);
  }, [load]);

  async function challenge() {
    const game = CHALLENGE_GAMES.find((item) => item.title === gameTitle);
    if (!game || !friendId) return;
    setNotice("");
    const created = await fetch(game.api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: account.id, playerName: account.name, ...game.body }),
    });
    const data = (await created.json()) as { state?: { code?: string }; error?: string };
    const roomCode = data.state?.code ?? "";
    if (!created.ok || roomCode.length !== 6) {
      setNotice(data.error ?? "Could not open a room.");
      return;
    }
    const sent = await fetch("/api/club/challenge", {
      method: "POST",
      headers: clubAuthHeaders(),
      body: JSON.stringify({ toId: friendId, game: game.title, path: game.path, roomCode }),
    });
    if (!sent.ok) {
      setNotice("Could not send the challenge.");
      return;
    }
    window.location.assign(`${game.path}?room=${roomCode}`);
  }

  const ends = home ? new Date(`${home.weekly.ends}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" }) : "";

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-300">Signed in as <span className="font-semibold text-white">{account.name}</span></p>
        <button
          type="button"
          onClick={() => {
            clearClubSession();
            onLogout();
          }}
          className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300"
        >
          Log out
        </button>
      </div>

      {home?.challenges.length ? (
        <div className="rounded-2xl border border-violet-400/40 bg-violet-950/40 p-4">
          <p className="text-sm font-semibold text-violet-100">Challenges</p>
          <ul className="mt-2 space-y-2">
            {home.challenges.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-200">
                <span>{item.fromName} invited you to {item.game}</span>
                <a href={`${item.path}?join=${item.roomCode}`} className="rounded-lg bg-violet-500 px-3 py-1 text-xs font-semibold text-white">Join</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-semibold text-emerald-200">Who is online</p>
        {home && home.online.length === 0 ? <p className="mt-2 text-xs text-slate-400">Nobody else is online.</p> : null}
        <ul className="mt-2 space-y-2">
          {home?.online.map((friend) => (
            <li key={friend.id} className="flex items-center justify-between gap-3 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {friend.name}
                <span className="text-xs text-slate-400">{friend.game}</span>
              </span>
              {friend.roomCode ? (
                <a href={`${friend.path}?join=${friend.roomCode}`} className="text-xs font-semibold text-emerald-200">Join</a>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select value={friendId} onChange={(event) => setFriendId(event.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
            <option value="">Challenge a friend</option>
            {home?.online.map((friend) => (
              <option key={friend.id} value={friend.id}>{friend.name}</option>
            ))}
          </select>
          <select value={gameTitle} onChange={(event) => setGameTitle(event.target.value)} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
            {CHALLENGE_GAMES.map((game) => (
              <option key={game.path}>{game.title}</option>
            ))}
          </select>
          <button type="button" onClick={() => void challenge()} className="rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-white">Send</button>
        </div>
        {notice ? <p className="mt-2 text-xs text-red-300">{notice}</p> : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-semibold text-yellow-200">This week: {home?.weekly.title ?? "…"}</p>
        <p className="mt-1 text-xs text-slate-400">Same 20 prompts for everyone. Highest score by Sunday {ends} wins.</p>
        {home ? (
          <a href={`${home.weekly.path}?weekly=1`} className="mt-3 inline-block rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-slate-950">
            Play this week
          </a>
        ) : null}
        <ul className="mt-3 space-y-1 text-sm text-slate-200">
          {home?.weekly.leaders.slice(0, 5).map((row, index) => (
            <li key={row.name}>{index + 1}. {row.name} · {row.score}</li>
          ))}
          {home && home.weekly.leaders.length === 0 ? <li className="text-xs text-slate-400">No scores yet this week.</li> : null}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-semibold text-violet-200">All-time board</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-200">
          {home?.board.slice(0, 8).map((row, index) => (
            <li key={row.name}>{index + 1}. {row.name} · {row.points} points · {row.wins} wins · {row.games} games</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm font-semibold text-slate-200">Recent games</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {home?.recent.map((row, index) => (
            <li key={`${row.playedAt}-${index}`}>{row.name} · {row.game} · {row.score}</li>
          ))}
          {home && home.recent.length === 0 ? <li className="text-xs text-slate-400">No games saved yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}
