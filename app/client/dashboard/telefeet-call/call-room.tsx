"use client";

import { useMemo, useState } from "react";

function defaultRoomName() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `telefeet-${y}${m}${d}`;
}

export function TelefeetCallRoom() {
  const [roomName, setRoomName] = useState(defaultRoomName);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Care Home Nurse");

  const roomUrl = useMemo(() => {
    if (!activeRoom) return null;
    const safeRoom = encodeURIComponent(activeRoom.trim());
    const safeDisplayName = encodeURIComponent(displayName.trim() || "TeleFeet User");
    return `https://meet.jit.si/${safeRoom}#userInfo.displayName=\"${safeDisplayName}\"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
  }, [activeRoom, displayName]);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 ring-1 ring-[#d4af37]/10 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
          Room name
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="telefeet-carehome-a"
            className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70 sm:col-span-2">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Care Home Nurse"
            className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setActiveRoom(roomName.trim())}
          disabled={!roomName.trim()}
          className="rounded-xl border border-[#d4af37]/60 bg-gradient-to-b from-[#e8c766] to-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_14px_28px_-10px_rgba(212,175,55,0.45)] transition hover:from-[#d4af37] hover:to-[#e8c766] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start / Join call
        </button>
        <p className="text-xs text-white/55">
          Everyone joins the same room name to connect.
        </p>
      </div>

      {roomUrl ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <iframe
            title="TeleFeet video call"
            src={roomUrl}
            className="h-[72vh] min-h-[520px] w-full"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-5 text-sm text-white/65">
          Enter a room name and press <span className="text-[#d4af37]">Start / Join call</span>{" "}
          to launch video conferencing.
        </div>
      )}
    </section>
  );
}
