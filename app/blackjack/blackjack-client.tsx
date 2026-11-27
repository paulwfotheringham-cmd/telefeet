"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BettingBar } from "@/components/blackjack/betting-bar";
import { BlackjackTable } from "@/components/blackjack/blackjack-table";
import { GameControls } from "@/components/blackjack/game-controls";
import { RulesPanel } from "@/components/blackjack/rules-panel";
import { StatsPanel } from "@/components/blackjack/stats-panel";
import { MIN_BET, STARTING_BALANCE } from "@/lib/blackjack/constants";
import {
  blackjackReducer,
  canDouble,
  canHit,
  canSplit,
  canStand,
  createInitialState,
  roundStatsDelta,
  setSelectedChipGlobal,
  syncHumanBalance,
} from "@/lib/blackjack/engine";
import type { BlackjackClientState } from "@/lib/blackjack/room";
import { loadPlayerName, loadStats, savePlayerName, saveStats } from "@/lib/blackjack/storage";
import type { BlackjackAction, BlackjackGameState, SessionStats, TableMode } from "@/lib/blackjack/types";
import { formatRoomCodeSpaced, isValidRoomCode, normalizeRoomCode } from "@/lib/funquiz/room-code";

function getOrCreatePlayerId(): string {
  const key = "blackjack-player-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

type ReducerState = { game: BlackjackGameState; stats: SessionStats; chip: number };

function reducer(state: ReducerState, action: BlackjackAction): ReducerState {
  const game = blackjackReducer(state.game, action);
  let stats = state.stats;
  if (action.type === "SELECT_CHIP") {
    return { game, stats, chip: action.amount };
  }
  if (action.type === "RESET_SESSION") {
    stats = {
      balance: STARTING_BALANCE,
      startedAt: Date.now(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      sessionPl: 0,
    };
    saveStats(stats);
    return { game, stats, chip: state.chip };
  }
  if (game.phase === "roundComplete" && state.game.phase !== "roundComplete") {
    const delta = roundStatsDelta(game);
    stats = {
      ...syncHumanBalance(game, stats),
      gamesPlayed: stats.gamesPlayed + (delta.gamesPlayed ?? 0),
      wins: stats.wins + (delta.wins ?? 0),
      losses: stats.losses + (delta.losses ?? 0),
      pushes: stats.pushes + (delta.pushes ?? 0),
      sessionPl: stats.sessionPl + (delta.sessionPl ?? 0),
    };
    saveStats(stats);
  } else if (game.phase !== "roundComplete") {
    stats = syncHumanBalance(game, stats);
  }
  return { game, stats, chip: state.chip };
}

async function parseRoomState(res: Response): Promise<BlackjackClientState | null> {
  const data = (await res.json()) as { state?: BlackjackClientState; error?: string };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.state ?? null;
}

export function BlackjackClient() {
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("Player");
  const [ready, setReady] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<BlackjackClientState | null>(null);
  const [busy, setBusy] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const statsLoaded = useRef(false);

  const [reducerState, dispatch] = useReducer(reducer, {
    game: createInitialState("local", "Player", loadStats(), "solo", 0),
    stats: loadStats(),
    chip: 100,
  });

  useEffect(() => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
    const name = loadPlayerName() || "Player";
    setPlayerName(name);
    setSelectedChipGlobal(100);
    statsLoaded.current = true;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("code") || params.get("room");
    if (fromUrl) setJoinCode(normalizeRoomCode(fromUrl));
    setReady(true);
  }, []);

  const isOnline = !!room;
  const game = isOnline && room.game ? room.game : reducerState.game;
  const { stats, chip } = reducerState;
  const human = useMemo(
    () => game.seats.find((s) => s.id === game.humanSeatId) ?? game.seats.find((s) => s.isHuman) ?? game.seats[0]!,
    [game.humanSeatId, game.seats],
  );

  const refreshRoom = useCallback(async () => {
    if (!room || !playerId) return;
    try {
      const res = await fetch(`/api/blackjack/room/${room.code}?playerId=${encodeURIComponent(playerId)}`);
      const state = await parseRoomState(res);
      if (state) setRoom(state);
    } catch {
      /* keep last good state */
    }
  }, [room, playerId]);

  useEffect(() => {
    if (!room) return;
    const id = window.setInterval(() => void refreshRoom(), 1200);
    return () => window.clearInterval(id);
  }, [room, refreshRoom]);

  const runAiWhenNeeded = useCallback(() => {
    if (game.phase !== "playerTurn") return;
    const seat = game.seats[game.activeSeatIndex];
    if (seat && !seat.isHuman) {
      window.setTimeout(() => {
        void dispatchAction({ type: "AI_TICK" });
      }, 450);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dispatchAction redefined below
  }, [game, isOnline, room?.code, playerId, chip]);

  useEffect(() => {
    runAiWhenNeeded();
  }, [runAiWhenNeeded]);

  async function dispatchAction(action: BlackjackAction) {
    if (action.type === "SELECT_CHIP") {
      setSelectedChipGlobal(action.amount);
      dispatch(action);
      return;
    }
    if (isOnline && room) {
      setBusy(true);
      try {
        const res = await fetch(`/api/blackjack/room/${room.code}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, action, chip }),
        });
        const state = await parseRoomState(res);
        if (state) setRoom(state);
      } catch (err) {
        setSetupError(err instanceof Error ? err.message : "Action failed");
      } finally {
        setBusy(false);
      }
      return;
    }
    dispatch(action);
  }

  function startLocalMode(mode: TableMode) {
    savePlayerName(playerName);
    setRoom(null);
    setSetupError(null);
    dispatch({ type: "SET_MODE", mode, aiCount: 0 });
  }

  async function hostTable() {
    setSetupError(null);
    if (!playerName.trim()) {
      setSetupError("Enter your name first.");
      return;
    }
    const id = playerId || getOrCreatePlayerId();
    if (!playerId) setPlayerId(id);
    savePlayerName(playerName);
    setBusy(true);
    try {
      const res = await fetch("/api/blackjack/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: id, playerName: playerName.trim() }),
      });
      const state = await parseRoomState(res);
      if (state) {
        setRoom(state);
        const url = new URL(window.location.href);
        url.searchParams.set("code", state.code);
        window.history.replaceState(null, "", url.toString());
      }
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setBusy(false);
    }
  }

  async function joinTable() {
    setSetupError(null);
    if (!playerName.trim()) {
      setSetupError("Enter your name, then join.");
      return;
    }
    const normalized = normalizeRoomCode(joinCode);
    if (!isValidRoomCode(normalized)) {
      setSetupError("Room code must be 6 letters or numbers.");
      return;
    }
    const id = playerId || getOrCreatePlayerId();
    if (!playerId) setPlayerId(id);
    savePlayerName(playerName);
    setBusy(true);
    try {
      const res = await fetch("/api/blackjack/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: normalized,
          playerId: id,
          playerName: playerName.trim(),
        }),
      });
      const state = await parseRoomState(res);
      if (state) {
        setRoom(state);
        const url = new URL(window.location.href);
        url.searchParams.set("code", state.code);
        window.history.replaceState(null, "", url.toString());
      }
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Could not join room");
    } finally {
      setBusy(false);
    }
  }

  async function startWithoutGuest() {
    if (!room || !playerId) return;
    setBusy(true);
    setSetupError(null);
    try {
      const res = await fetch(`/api/blackjack/room/${room.code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const state = await parseRoomState(res);
      if (state) setRoom(state);
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Could not start");
    } finally {
      setBusy(false);
    }
  }

  function leaveRoom() {
    setRoom(null);
    setSetupError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("room");
    window.history.replaceState(null, "", url.pathname);
    dispatch({ type: "RESET_SESSION" });
  }

  if (!ready) {
    return <p className="py-20 text-center text-brand-muted">Loading table…</p>;
  }

  const showSetup = !isOnline && game.phase === "setup";
  const showLobby = isOnline && room.phase === "lobby";
  const showBetting = game.phase === "betting" && (!isOnline || room.phase === "playing");
  const myTurn =
    game.phase === "playerTurn" && game.seats[game.activeSeatIndex]?.id === game.humanSeatId;
  const showControls = myTurn;

  return (
    <div className="bj-page mx-auto flex min-h-[100dvh] max-w-[86rem] flex-col px-2 py-2 sm:px-3 sm:py-3">
      <header className="bj-header bj-header-casino">
        <Link href="/funquiz" className="bj-back">
          ← All Games
        </Link>
        <div className="bj-title-block">
          <h1 className="bj-title-casino">Blackjack</h1>
          {room ? (
            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-gold/80">
              Room {formatRoomCodeSpaced(room.code)}
            </p>
          ) : null}
        </div>
        <div className="bj-profile">
          <span className="bj-avatar">{initials(playerName)}</span>
          <div className="text-right text-sm">
            <p className="font-medium text-brand-cream">{playerName}</p>
            <p className="text-brand-goldHi tabular-nums">${isOnline && human ? human.balance : stats.balance}</p>
          </div>
        </div>
      </header>

      <div className="relative mt-1 min-w-0 flex-1">
        <BlackjackTable
          state={game}
          banner={
            game.banner &&
            (game.phase === "playerTurn" || game.phase === "roundComplete" || game.phase === "dealerTurn") ? (
              <p role="status" className="bj-banner-text">
                {game.banner}
              </p>
            ) : null
          }
          controls={
            showControls ? (
              <GameControls
                canHit={canHit(game)}
                canStand={canStand(game)}
                canDouble={canDouble(game)}
                canSplit={canSplit(game)}
                onHit={() => void dispatchAction({ type: "HIT" })}
                onStand={() => void dispatchAction({ type: "STAND" })}
                onDouble={() => void dispatchAction({ type: "DOUBLE" })}
                onSplit={() => void dispatchAction({ type: "SPLIT" })}
              />
            ) : null
          }
        />

        <aside className="absolute right-2 top-2 z-30 hidden w-52 flex-col gap-2 xl:flex">
          <BjSidebar stats={stats} currentBet={human.pendingBet || human.hands[0]?.bet || 0} />
          {room ? (
            <div className="rounded-xl border border-brand-gold/25 bg-black/70 p-3 text-xs text-brand-cream backdrop-blur-md">
              <p className="font-semibold uppercase tracking-wider text-brand-gold">Table</p>
              <p className="mt-1 tabular-nums text-brand-goldHi">{formatRoomCodeSpaced(room.code)}</p>
              <ul className="mt-2 space-y-1 text-brand-muted">
                {room.players.map((p) => (
                  <li key={p.id}>
                    {p.name}
                    {p.id === room.hostId ? " · host" : ""}
                    {p.id === playerId ? " · you" : ""}
                  </li>
                ))}
              </ul>
              <button type="button" className="bj-btn-ghost mt-3 w-full text-xs" onClick={leaveRoom}>
                Leave table
              </button>
            </div>
          ) : null}
        </aside>

        {showBetting ? (
          <div className="bj-betting-dock absolute bottom-3 left-1/2 z-20 w-[min(96%,36rem)] -translate-x-1/2">
            <BettingBar
              pendingBet={human.pendingBet}
              balance={human.balance}
              selectedChip={chip}
              betPlaced={human.betPlaced}
              disabled={busy || human.balance < MIN_BET}
              onSelectChip={(n) => void dispatchAction({ type: "SELECT_CHIP", amount: n })}
              onAdd={() => void dispatchAction({ type: "ADD_BET" })}
              onRemove={() => void dispatchAction({ type: "REMOVE_BET" })}
              onClear={() => void dispatchAction({ type: "CLEAR_BET" })}
              onPlaceBet={() => void dispatchAction({ type: "PLACE_BET" })}
              onDeal={() => void dispatchAction({ type: "DEAL" })}
            />
          </div>
        ) : null}

        {game.phase === "roundComplete" && (!isOnline || room.phase === "playing") ? (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2">
            <button
              type="button"
              className="bj-btn-deal"
              disabled={busy}
              onClick={() => void dispatchAction({ type: "NEW_ROUND" })}
            >
              New round
            </button>
            {!isOnline && stats.balance < MIN_BET ? (
              <button type="button" className="bj-btn-primary" onClick={() => void dispatchAction({ type: "RESET_SESSION" })}>
                Reset to ${STARTING_BALANCE}
              </button>
            ) : null}
          </div>
        ) : null}

        {showLobby ? (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <section className="bj-setup pointer-events-auto w-full max-w-md rounded-2xl border border-[#c4a574]/35 bg-[#14100c]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
              <h2 className="font-serif text-lg font-semibold text-[#f0d9a8]">Your table</h2>
              <p className="mt-1 text-sm text-[#d8c4a0]/80">Share this code — 2 real players, AI fill the rest.</p>
              <p className="mt-4 text-center font-serif text-3xl tracking-[0.35em] text-brand-goldHi">
                {formatRoomCodeSpaced(room.code)}
              </p>
              <button
                type="button"
                className="bj-btn-primary mt-3 w-full"
                onClick={() => void navigator.clipboard.writeText(room.code)}
              >
                Copy code
              </button>
              <ul className="mt-4 space-y-1 text-sm text-[#d8c4a0]/85">
                {room.players.map((p) => (
                  <li key={p.id}>
                    {p.name}
                    {p.id === room.hostId ? " (host)" : ""}
                    {p.id === playerId ? " — you" : ""}
                  </li>
                ))}
                {room.waitingForGuest ? <li className="text-brand-muted">Waiting for player 2…</li> : null}
              </ul>
              {setupError ? <p className="mt-3 text-sm text-red-300">{setupError}</p> : null}
              <div className="mt-4 grid gap-2">
                {room.isHost ? (
                  <button type="button" className="bj-btn-deal" disabled={busy} onClick={() => void startWithoutGuest()}>
                    {room.waitingForGuest ? "Start with AI fill (solo host)" : "Start table"}
                  </button>
                ) : (
                  <p className="text-center text-sm text-brand-muted">Waiting for host…</p>
                )}
                <button type="button" className="bj-btn-ghost" onClick={leaveRoom}>
                  Cancel
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {showSetup ? (
          <div className="absolute inset-0 z-[60] flex items-end justify-center bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 pb-8 sm:items-center sm:pb-4">
            <section className="bj-setup pointer-events-auto w-full max-w-md rounded-2xl border border-[#c4a574]/35 bg-[#14100c]/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-md">
              <h2 className="font-serif text-lg font-semibold text-[#f0d9a8]">Take a seat</h2>
              <p className="mt-1 text-sm text-[#d8c4a0]/80">Virtual chips — bankroll ${STARTING_BALANCE}.</p>
              <label className="mt-3 block text-sm text-[#d8c4a0]/75">
                Your name
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#5a3d22]/60 bg-black/40 px-3 py-2 text-[#f2ebe0]"
                />
              </label>
              <div className="mt-4 grid gap-2">
                <ModeButton
                  title="Solo vs dealer"
                  detail="You + 4 AI — five-seat table."
                  onClick={() => startLocalMode("solo")}
                />
                <ModeButton
                  title="Table with AI guests"
                  detail="Same five-seat table, local only."
                  onClick={() => startLocalMode("withAi")}
                />
                <ModeButton
                  title="Host table (2 players)"
                  detail="Get a room code — you + 1 friend + 3 AI."
                  onClick={() => void hostTable()}
                />
              </div>
              <div className="mt-5 border-t border-[#5a3d22]/50 pt-4">
                <p className="text-sm font-semibold text-[#f0d9a8]">Join with room code</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full rounded-xl border border-[#5a3d22]/60 bg-black/40 px-3 py-2 uppercase tracking-[0.2em] text-[#f2ebe0]"
                  />
                  <button type="button" className="bj-btn-primary shrink-0" disabled={busy} onClick={() => void joinTable()}>
                    Join
                  </button>
                </div>
              </div>
              {setupError ? <p className="mt-3 text-sm text-red-300">{setupError}</p> : null}
            </section>
          </div>
        ) : null}
      </div>

      <aside className="mt-2 flex flex-col gap-2 xl:hidden">
        <BjSidebar stats={stats} currentBet={human.pendingBet || human.hands[0]?.bet || 0} />
      </aside>
    </div>
  );
}

function BjSidebar({ stats, currentBet }: { stats: SessionStats; currentBet: number }) {
  return (
    <div className="flex flex-col gap-2">
      <StatsPanel stats={stats} currentBet={currentBet} />
      <RulesPanel />
    </div>
  );
}

function ModeButton({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="bj-mode-btn text-left">
      <span className="block font-semibold text-brand-cream">{title}</span>
      <span className="mt-1 block text-sm text-brand-muted">{detail}</span>
    </button>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PP";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
