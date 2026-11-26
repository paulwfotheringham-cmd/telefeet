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
import { loadPlayerName, loadStats, savePlayerName, saveStats } from "@/lib/blackjack/storage";
import type { BlackjackAction, BlackjackGameState, SessionStats, TableMode } from "@/lib/blackjack/types";

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

export function BlackjackClient() {
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("Player");
  const [ready, setReady] = useState(false);
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
    setReady(true);
  }, []);

  const { game, stats, chip } = reducerState;
  const human = useMemo(() => game.seats.find((s) => s.isHuman) ?? game.seats[0]!, [game.seats]);

  const runAiWhenNeeded = useCallback(() => {
    if (game.phase !== "playerTurn") return;
    const seat = game.seats[game.activeSeatIndex];
    if (seat && !seat.isHuman) {
      window.setTimeout(() => dispatch({ type: "AI_TICK" }), 450);
    }
  }, [game]);

  useEffect(() => {
    runAiWhenNeeded();
  }, [runAiWhenNeeded]);

  const dispatchAction = (action: BlackjackAction) => dispatch(action);

  function startMode(mode: TableMode, aiCount: number) {
    savePlayerName(playerName);
    dispatch({ type: "SET_MODE", mode, aiCount });
  }

  if (!ready) {
    return <p className="py-20 text-center text-brand-muted">Loading table…</p>;
  }

  const showSetup = game.phase === "setup";
  const showBetting = game.phase === "betting";
  const showControls = game.phase === "playerTurn" && human && game.seats[game.activeSeatIndex]?.isHuman;

  return (
    <div className="bj-page mx-auto flex min-h-[100dvh] max-w-[82rem] flex-col px-3 py-4 sm:px-6 sm:py-6">
      <header className="bj-header">
        <Link href="/funquiz" className="bj-back">
          ← All Games
        </Link>
        <div className="bj-title-block">
          <span aria-hidden className="bj-title-suit-top">
            ♠
          </span>
          <h1 className="bj-title">Blackjack</h1>
          <p className="bj-subtitle">Beat the dealer and get 21</p>
        </div>
        <div className="bj-profile">
          <span className="bj-avatar">{initials(playerName)}</span>
          <div className="text-right text-sm">
            <p className="font-medium text-brand-cream">{playerName}</p>
            <p className="text-brand-goldHi tabular-nums">${stats.balance}</p>
          </div>
        </div>
      </header>

      <div className="mt-2 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="relative min-w-0">
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
                  onHit={() => dispatchAction({ type: "HIT" })}
                  onStand={() => dispatchAction({ type: "STAND" })}
                  onDouble={() => dispatchAction({ type: "DOUBLE" })}
                  onSplit={() => dispatchAction({ type: "SPLIT" })}
                />
              ) : null
            }
          />

          {showSetup ? (
          <div className="absolute inset-0 z-[60] flex items-center justify-center rounded-xl bg-black/50 p-4 backdrop-blur-sm">
            <section className="bj-setup pointer-events-auto w-full max-w-xl rounded-3xl border border-[#c4a574]/35 bg-[#14100c]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
              <h2 className="font-serif text-xl font-semibold text-[#f0d9a8]">Take a seat</h2>
              <p className="mt-2 text-sm text-[#d8c4a0]/80">
                Virtual chips only — starting bankroll ${STARTING_BALANCE}.
              </p>
              <label className="mt-4 block text-sm text-[#d8c4a0]/75">
                Your name
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#5a3d22]/60 bg-black/40 px-3 py-2 text-[#f2ebe0]"
                />
              </label>
              <div className="mt-6 grid gap-3">
                <ModeButton
                  title="Solo vs dealer"
                  detail="You plus 4 AI guests — full five-seat table."
                  onClick={() => startMode("solo", 0)}
                />
                <ModeButton
                  title="Table with AI guests"
                  detail="Same five-seat table: you and four AI players."
                  onClick={() => startMode("withAi", 0)}
                />
                <ModeButton
                  title="Play separate (host table)"
                  detail="Host a five-seat table (extra humans join as we add multiplayer)."
                  onClick={() => startMode("hostTable", 0)}
                />
              </div>
            </section>
          </div>
          ) : null}
        </div>

        <aside className="hidden flex-col gap-2 lg:flex">
          <BjSidebar stats={stats} currentBet={human.pendingBet || human.hands[0]?.bet || 0} />
        </aside>
      </div>

      <div className="mx-auto mt-2 w-full max-w-3xl">
        {game.banner &&
        game.phase === "betting" &&
        !game.banner.startsWith("Bet:") &&
        game.banner !== "Place your bet" ? (
          <p className="bj-banner" role="status">
            {game.banner}
          </p>
        ) : null}
        {showBetting ? (
          <BettingBar
            pendingBet={human.pendingBet}
            balance={human.balance}
            selectedChip={chip}
            betPlaced={human.betPlaced}
            disabled={human.balance < MIN_BET}
            onSelectChip={(n) => dispatchAction({ type: "SELECT_CHIP", amount: n })}
            onAdd={() => dispatchAction({ type: "ADD_BET" })}
            onRemove={() => dispatchAction({ type: "REMOVE_BET" })}
            onClear={() => dispatchAction({ type: "CLEAR_BET" })}
            onPlaceBet={() => dispatchAction({ type: "PLACE_BET" })}
            onDeal={() => dispatchAction({ type: "DEAL" })}
          />
        ) : null}
        {game.phase === "roundComplete" ? (
          <div className="flex flex-wrap justify-center gap-2 pb-4">
            <button type="button" className="bj-btn-deal" onClick={() => dispatchAction({ type: "NEW_ROUND" })}>
              New round
            </button>
            {stats.balance < MIN_BET ? (
              <button type="button" className="bj-btn-primary" onClick={() => dispatchAction({ type: "RESET_SESSION" })}>
                Reset to ${STARTING_BALANCE}
              </button>
            ) : null}
          </div>
        ) : null}
        <aside className="mt-3 flex flex-col gap-2 lg:hidden">
          <BjSidebar stats={stats} currentBet={human.pendingBet || human.hands[0]?.bet || 0} />
        </aside>
      </div>
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