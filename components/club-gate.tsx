"use client";

import { useEffect, useState, type ReactNode } from "react";
import { clubAuthHeaders, clubToken } from "@/lib/funquiz/club-browser";

export function ClubGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !clubToken()) return;
    const beat = () => {
      const params = new URLSearchParams(window.location.search);
      void fetch("/api/club/presence", {
        method: "POST",
        headers: clubAuthHeaders(),
        body: JSON.stringify({
          path: window.location.pathname,
          roomCode: params.get("room") || params.get("join") || "",
        }),
      });
    };
    beat();
    const id = window.setInterval(beat, 15000);
    return () => window.clearInterval(id);
  }, [ready]);

  return children;
}
