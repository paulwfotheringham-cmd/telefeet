"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { useMatchScore } from "@/lib/funquiz/use-match-score";
import { formatRoomCodeSpaced, isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";
import type { Stroke } from "@/lib/draw-the-weapon/drawing";
import type { DrawClientState } from "@/lib/draw-the-weapon/room";
import { openRoomByCode } from "@/lib/room-directory";
import { WeaponPicture } from "./weapon-picture";

const PLAYER_ID_KEY = "draw-the-weapon-player-id";
const PLAYER_NAME_KEY = "draw-the-weapon-player-name";
const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a", "#7c3aed"];
const SIZES = [4, 8, 14, 22];

function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

async function parseState(res: Response): Promise<DrawClientState | null> {
  const body = (await res.json()) as { state?: DrawClientState; error?: string };
  if (!res.ok || !body.state) throw new Error(body.error || "Something went wrong");
  if (body.state.error) throw new Error(body.state.error);
  return body.state;
}

function keepNewerState(prev: DrawClientState | null, next: DrawClientState): DrawClientState {
  if (prev && prev.code === next.code && next.revision < prev.revision) return prev;
  return next;
}

function paint(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = Math.max(2, (stroke.size / 1000) * width);
    ctx.beginPath();
    for (let index = 0; index < stroke.points.length; index += 2) {
      const x = (stroke.points[index]! / 1000) * width;
      const y = (stroke.points[index + 1]! / 1000) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function boardPoint(canvas: HTMLCanvasElement, event: PointerEvent<HTMLCanvasElement>): [number, number] {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 1000);
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 1000);
  return [Math.max(0, Math.min(1000, x)), Math.max(0, Math.min(1000, y))];
}

function DrawingBoard({
  strokes,
  interactive,
  color,
  size,
  onChange,
}: {
  strokes: Stroke[];
  interactive: boolean;
  color: string;
  size: number;
  onChange?: (strokes: Stroke[]) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(800 * ratio);
    canvas.height = Math.round(520 * ratio);
    paint(canvas, strokes);
  }, [strokes]);

  function pointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!interactive || !onChange) return;
    const canvas = ref.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drawing.current = true;
    const [x, y] = boardPoint(canvas, event);
    onChange([...strokesRef.current, { color, size, points: [x, y, x + 1, y + 1] }]);
  }

  function pointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !interactive || !onChange) return;
    const canvas = ref.current;
    if (!canvas) return;
    const current = strokesRef.current;
    const last = current[current.length - 1];
    if (!last) return;
    const [x, y] = boardPoint(canvas, event);
    const previousX = last.points[last.points.length - 2] ?? x;
    const previousY = last.points[last.points.length - 1] ?? y;
    if (Math.hypot(x - previousX, y - previousY) < 6) return;
    onChange([...current.slice(0, -1), { ...last, points: [...last.points, x, y] }]);
  }

  function pointerUp() {
    drawing.current = false;
  }

  return (
    <canvas
      ref={ref}
      className={`aspect-[20/13] w-full rounded-2xl bg-slate-50 touch-none ${interactive ? "cursor-crosshair" : ""}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    />
  );
}

export function DrawTheWeaponClient() {
  const [screen, setScreen] = useState<"home" | "game">("home");
  const [playerId, setPlayerId] = useState("");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomState, setRoomState] = useState<DrawClientState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorScope, setErrorScope] = useState<"create" | "join" | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(COLORS[0] ?? "#0f172a");
  const [size, setSize] = useState(SIZES[1] ?? 8);
  const [copied, setCopied] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
    const saved = localStorage.getItem(PLAYER_NAME_KEY)?.trim() ?? "";
    if (saved) setName(saved);
    const params = new URLSearchParams(window.location.search);
    const incoming = normalizeRoomCode(params.get("join") || params.get("room") || "");
    if (!isValidRoomCode(incoming)) return;
    setJoinCode(incoming);
    async function joinFromLink(code: string) {
      if (!saved) {
        setErrorScope("join");
        setError("Enter your name, then press Join room.");
        return;
      }
      try {
        const res = await fetch("/api/draw-the-weapon/room/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, playerId: id, playerName: saved }),
        });
        const state = await parseState(res);
        if (!state) return;
        setRoomState(state);
        const url = new URL(window.location.href);
        url.searchParams.set("room", state.code);
        url.searchParams.delete("join");
        window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
        setScreen("game");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not join room";
        if (await openRoomByCode(code, saved, "/draw-the-weapon")) return;
        setErrorScope("join");
        setError(message);
      }
    }
    const room = params.get("room");
    if (!room) {
      void joinFromLink(incoming);
      return;
    }
    void fetch(`/api/draw-the-weapon/room/${incoming}?playerId=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(parseState)
      .then((state) => {
        if (!state) return;
        setRoomState(state);
        setScreen("game");
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "You are not in this room") void joinFromLink(incoming);
      });
  }, []);

  useEffect(() => {
    setStrokes([]);
  }, [roomState?.code, roomState?.turnIndex]);

  useEffect(() => {
    if (screen === "home" && isValidRoomCode(normalizeRoomCode(joinCode)) && !name.trim()) {
      nameRef.current?.focus();
    }
  }, [screen, joinCode, name]);

  const code = roomState?.code ?? "";
  const poll = useCallback(async () => {
    if (!code || !playerId || screen !== "game") return;
    try {
      const res = await fetch(`/api/draw-the-weapon/room/${encodeURIComponent(code)}?playerId=${encodeURIComponent(playerId)}`, {
        cache: "no-store",
      });
      const state = await parseState(res);
      if (state) setRoomState((prev) => keepNewerState(prev, state));
    } catch {
      /* ignore a missed poll */
    }
  }, [code, playerId, screen]);

  useEffect(() => {
    if (screen !== "game" || !code) return;
    void poll();
    const id = setInterval(() => void poll(), 1000);
    return () => clearInterval(id);
  }, [screen, code, poll]);

  function rememberRoom(nextCode: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("room", nextCode);
    url.searchParams.delete("join");
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  async function createRoom() {
    setError(null);
    if (!name.trim()) {
      setErrorScope("create");
      setError("Enter your name first.");
      return;
    }
    const activePlayerId = playerId || getOrCreatePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    setBusy(true);
    try {
      const res = await fetch("/api/draw-the-weapon/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: activePlayerId, playerName: name.trim() }),
      });
      const state = await parseState(res);
      if (!state) return;
      setRoomState(state);
      rememberRoom(state.code);
      setScreen("game");
    } catch (err) {
      setErrorScope("create");
      setError(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    setError(null);
    if (!name.trim()) {
      setErrorScope("join");
      setError("Enter your name, then press Join room.");
      return;
    }
    const normalized = normalizeRoomCode(joinCode);
    if (!isValidRoomCode(normalized)) {
      setErrorScope("join");
      setError("Room code must be 6 letters or numbers.");
      return;
    }
    const activePlayerId = playerId || getOrCreatePlayerId();
    if (!playerId) setPlayerId(activePlayerId);
    localStorage.setItem(PLAYER_NAME_KEY, name.trim());
    setBusy(true);
    try {
      const res = await fetch("/api/draw-the-weapon/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized, playerId: activePlayerId, playerName: name.trim() }),
      });
      const state = await parseState(res);
      if (!state) return;
      setRoomState(state);
      rememberRoom(state.code);
      setScreen("game");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not join room";
      if (await openRoomByCode(normalized, name, "/draw-the-weapon")) return;
      setErrorScope("join");
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function post(path: string, body: unknown) {
    if (!roomState) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const state = await parseState(res);
      if (state) setRoomState((prev) => keepNewerState(prev, state));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const clubPlayers = roomState?.players ?? [];
  const clubMe = clubPlayers.find((player) => player.id === playerId);
  const clubBest = clubPlayers.reduce((best, player) => Math.max(best, player.score), 0);
  useMatchScore({
    game: "Draw the Weapon",
    roomCode: roomState?.code,
    phase: roomState?.phase,
    score: clubMe?.score,
    won: !!clubMe && clubMe.score === clubBest && clubBest > 0,
  });

  if (screen === "home") {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-lime-400/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/90 p-6 shadow-2xl shadow-lime-900/40 sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">TeleFeet</p>
          <h1 className="mt-3 text-center text-4xl font-bold tracking-tight text-white">Draw the Weapon!</h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
            Twenty military weapons. You each draw, then the game picks the closer picture.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (normalizeRoomCode(joinCode)) void joinRoom();
              else void createRoom();
            }}
          >
            <label className="mt-6 block text-sm font-medium text-slate-200">
              Your name
              <input
                ref={nameRef}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-lime-400/60"
                value={name}
                maxLength={24}
                placeholder="Alex"
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void createRoom()}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-lime-500 to-green-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-lime-700/30 disabled:opacity-60"
            >
              Create room
            </button>
            {error && errorScope !== "join" ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
            <div id="weapon-join" className={`mt-6 rounded-2xl p-1 ${errorScope === "join" ? "ring-2 ring-red-400" : ""}`}>
              <label className="block text-sm font-medium text-slate-200">
                Room code
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono tracking-[0.3em] text-white outline-none focus:ring-2 focus:ring-lime-400/60"
                  value={joinCode}
                  placeholder="ABC123"
                  maxLength={18}
                  onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="mt-3 w-full rounded-xl border border-white/15 py-3 text-sm font-semibold text-slate-100"
              >
                Join room
              </button>
              {errorScope === "join" && error ? <p className="mt-3 text-center text-sm text-red-300">{error}</p> : null}
            </div>
          </form>
          <Link href="/funquiz" className="mt-6 block text-center text-sm text-lime-200">
            Back to Fun Quiz
          </Link>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return <div className="flex min-h-[100dvh] items-center justify-center text-slate-300">Loading room…</div>;
  }

  const opponent = roomState.players.find((player) => player.id !== playerId);
  const isHost = roomState.hostId === playerId;
  const drawingLocked = roomState.phase !== "draw" || roomState.youSubmitted;
  const roundLabel = Math.min(roomState.turnIndex + 1, roomState.totalRounds);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 py-6 pb-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-lime-300">
            Room {roomState.code} · Draw the Weapon
          </p>
          <h1 className="text-2xl font-bold text-white">Draw the Weapon!</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            window.history.replaceState(null, "", window.location.pathname);
            setScreen("home");
            setRoomState(null);
          }}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300"
        >
          Leave
        </button>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {roomState.players.map((player) => (
          <div key={player.id} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
            <p className="text-sm text-slate-300">{player.name}</p>
            <p className="text-2xl font-bold text-white">{player.score}</p>
          </div>
        ))}
      </div>

      {roomState.phase === "lobby" ? (
        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Waiting room</h2>
          <p className="mt-2 text-sm text-slate-300">
            Share code{" "}
            <span className="font-mono tracking-[0.2em] text-lime-200">{formatRoomCodeSpaced(roomState.code)}</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Your friend enters that code on Fun Quiz or this page, then presses Join room.
          </p>
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/draw-the-weapon?join=${roomState.code}`;
              void navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              });
            }}
            className="mt-3 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200"
          >
            {copied ? "Link copied" : "Copy invite link"}
          </button>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {roomState.players.map((player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
          {isHost ? (
            <button
              type="button"
              disabled={busy || roomState.players.length < 2}
              onClick={() => void post(`/api/draw-the-weapon/room/${roomState.code}/start`, { playerId, weekly: new URLSearchParams(window.location.search).get("weekly") === "1" })}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-lime-500 to-green-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {roomState.players.length < 2 ? "Waiting for player 2" : "Start game"}
            </button>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-400">Waiting for the host to start.</p>
          )}
        </section>
      ) : null}

      {roomState.phase !== "lobby" && roomState.phase !== "finished" && roomState.organ ? (
        <section className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Round {roundLabel} / {roomState.totalRounds}</span>
            <span>{roomState.phase === "draw" ? "Draw" : roomState.phase === "vote" ? "Judge" : "Winner"}</span>
          </div>
          <h2 className="mt-3 text-center text-3xl font-bold text-white">Draw the {roomState.organ}</h2>
          {roomState.statusMessage ? <p className="mt-2 text-center text-sm text-slate-300">{roomState.statusMessage}</p> : null}

          {roomState.phase === "draw" ? (
            <div className="mt-4">
              <DrawingBoard
                strokes={roomState.youSubmitted ? roomState.yourDrawing : strokes}
                interactive={!drawingLocked}
                color={color}
                size={size}
                onChange={setStrokes}
              />
              {!roomState.youSubmitted ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {COLORS.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      aria-label={`Ink ${swatch}`}
                      onClick={() => setColor(swatch)}
                      className={`h-8 w-8 rounded-full border-2 ${color === swatch ? "border-white" : "border-transparent"}`}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setColor("#f8fafc")}
                    className={`rounded-full border px-3 py-1 text-xs text-slate-200 ${color === "#f8fafc" ? "border-white" : "border-white/20"}`}
                  >
                    Eraser
                  </button>
                  {SIZES.map((pen) => (
                    <button
                      key={pen}
                      type="button"
                      onClick={() => setSize(pen)}
                      className={`rounded-full border px-2 py-1 text-xs text-slate-200 ${size === pen ? "border-lime-300" : "border-white/20"}`}
                    >
                      {pen}
                    </button>
                  ))}
                  <button type="button" onClick={() => setStrokes((current) => current.slice(0, -1))} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
                    Undo
                  </button>
                  <button type="button" onClick={() => setStrokes([])} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
                    Clear
                  </button>
                </div>
              ) : null}
              {!roomState.youSubmitted ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void post(`/api/draw-the-weapon/room/${roomState.code}/drawing`, { playerId, strokes })}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-lime-500 to-green-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Done
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-2 text-center text-sm font-semibold text-lime-200">Answer</p>
              <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/10">
                <WeaponPicture name={roomState.organ} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {roomState.boards.map((board) => (
                  <div key={board.playerId}>
                  <p className="mb-2 text-sm font-medium text-slate-200">
                    {board.name}
                    {roomState.roundWinnerIds.includes(board.playerId) ? " · closer" : ""}
                    {roomState.roundScores.some((entry) => entry.playerId === board.playerId)
                      ? ` · ${Math.round((roomState.roundScores.find((entry) => entry.playerId === board.playerId)?.score ?? 0) * 100)}%`
                      : ""}
                  </p>
                    <DrawingBoard strokes={board.strokes} interactive={false} color={color} size={size} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {roomState.phase === "vote" && !roomState.youVoted ? (
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void post(`/api/draw-the-weapon/room/${roomState.code}/vote`, { playerId, choice: playerId })}
                className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white"
              >
                My drawing is closer
              </button>
              {opponent ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void post(`/api/draw-the-weapon/room/${roomState.code}/vote`, { playerId, choice: opponent.id })}
                  className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white"
                >
                  {opponent.name}&apos;s drawing is closer
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy}
                onClick={() => void post(`/api/draw-the-weapon/room/${roomState.code}/vote`, { playerId, choice: "tie" })}
                className="rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-sm text-white"
              >
                Too close to call
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {roomState.phase === "finished" ? (
        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Results</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {(roomState.results ?? []).map((round) => (
              <li key={round.organ} className="flex items-center gap-3">
                <span className="w-24 shrink-0 overflow-hidden rounded-lg">
                  <WeaponPicture name={round.organ} />
                </span>
                <span>
                {round.organ}:{" "}
                {round.winnerIds.length === 0
                  ? "no points"
                  : round.winnerIds
                      .map((id) => roomState.players.find((player) => player.id === id)?.name ?? "Player")
                      .join(" and ")}
                </span>
              </li>
            ))}
          </ul>
          {isHost ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void post(`/api/draw-the-weapon/room/${roomState.code}/new-game`, { playerId })}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-lime-500 to-green-600 py-3 text-sm font-semibold text-white"
            >
              Play again
            </button>
          ) : null}
        </section>
      ) : null}
      {error ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
