"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clubAuthHeaders } from "@/lib/funquiz/club-browser";

type Challenge = { id: string; fromName: string; game: string; path: string; roomCode: string };

export function FriendsClub({ onLogout }: { onLogout: () => void }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const logoutRef = useRef(onLogout);
  logoutRef.current = onLogout;

  const load = useCallback(async () => {
    const res = await fetch("/api/club/home", { headers: clubAuthHeaders(), cache: "no-store" });
    if (res.status === 401) {
      logoutRef.current();
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as { challenges?: Challenge[] };
    setChallenges(data.challenges ?? []);
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 8000);
    return () => clearInterval(id);
  }, [load]);

  if (challenges.length === 0) return null;

  return (
    <div className="mt-6">
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
    </div>
  );
}
