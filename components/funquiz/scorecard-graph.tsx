"use client";

import type { ScorecardData } from "@/lib/funquiz/types";

type Props = {
  scorecard: ScorecardData;
};

function BarChart({
  bars,
  maxValue,
  valueSuffix = "",
}: {
  bars: { label: string; value: number; color: string }[];
  maxValue: number;
  valueSuffix?: string;
}) {
  const safeMax = Math.max(maxValue, 1);
  return (
    <div className="mt-4 space-y-4">
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="mb-1 flex justify-between text-xs text-slate-300">
            <span className="truncate pr-2 font-medium text-slate-200">{bar.label}</span>
            <span className="tabular-nums text-violet-200">
              {bar.value}
              {valueSuffix}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${bar.color}`}
              style={{ width: `${Math.min(100, (bar.value / safeMax) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineAreaChart({
  points,
  maxValue,
  yLabel,
}: {
  points: { label: string; value: number }[];
  maxValue: number;
  yLabel?: string;
}) {
  if (points.length === 0) return null;
  const safeMax = Math.max(maxValue, 1);
  const w = 320;
  const h = 120;
  const pad = 8;
  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? w / 2
        : pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - (p.value / safeMax) * (h - pad * 2);
    return { x, y, ...p };
  });
  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const area = `${coords[0]!.x},${h - pad} ${line} ${coords[coords.length - 1]!.x},${h - pad}`;

  return (
    <div className="mt-4">
      {yLabel ? <p className="mb-2 text-xs text-slate-400">{yLabel}</p> : null}
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md text-violet-400" role="img">
        <polygon points={area} fill="currentColor" fillOpacity={0.15} />
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c) => (
          <circle key={c.label} cx={c.x} cy={c.y} r={3.5} fill="currentColor" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>{points[0]!.label}</span>
        <span>{points[points.length - 1]!.label}</span>
      </div>
    </div>
  );
}

export function FunQuizScorecardGraph({ scorecard }: Props) {
  if (scorecard.kind === "take_turns") {
    const max = Math.max(...scorecard.players.map((p) => p.total), 1);
    return (
      <div className="rounded-2xl border border-violet-400/30 bg-slate-900/80 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-200">
          Scorecard
        </h3>
        <BarChart
          maxValue={max}
          valueSuffix={` / ${scorecard.players[0]?.total ?? 25}`}
          bars={scorecard.players.map((p, i) => ({
            label: p.name,
            value: p.correct,
            color: i === 0 ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-gradient-to-r from-cyan-500 to-teal-400",
          }))}
        />
      </div>
    );
  }

  if (scorecard.kind === "play_together") {
    return (
      <div className="rounded-2xl border border-violet-400/30 bg-slate-900/80 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-200">
          Team scorecard
        </h3>
        <p className="mt-2 text-2xl font-bold tabular-nums text-white">
          {scorecard.correct}
          <span className="text-lg font-medium text-slate-400"> / {scorecard.total}</span>
          <span className="ml-2 text-sm font-normal text-emerald-300">
            ({Math.round((scorecard.correct / Math.max(scorecard.total, 1)) * 100)}%)
          </span>
        </p>
        <LineAreaChart
          points={scorecard.cumulativeSeries}
          maxValue={scorecard.total}
          yLabel="Cumulative correct answers"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-slate-900/80 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
        Ladder scorecard
      </h3>
      <p className="mt-2 text-sm text-slate-300">
        {scorecard.correctCount} correct of {scorecard.questionsAnswered} answered · Final prize{" "}
        <strong className="text-amber-100">
          ${scorecard.finalPrize.toLocaleString("en-US")}
        </strong>
      </p>
      <LineAreaChart
        points={scorecard.stepSeries}
        maxValue={scorecard.maxPrize}
        yLabel="Virtual prize level per question"
      />
    </div>
  );
}
