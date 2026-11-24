"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EUROPE_GDP_2025, EUROPE_GDP_NOTE } from "@/lib/funquiz/europe-gdp";

type Step = "size" | "mode" | "sort" | "handoff" | "reveal";
type Mode = "single" | "together" | "separate";

const SIZES = [
  { count: 10, title: "Top 10", detail: "The ten largest European economies." },
  { count: 20, title: "Top 20", detail: "A longer list, still the bigger economies." },
  { count: EUROPE_GDP_2025.length, title: `All ${EUROPE_GDP_2025.length}`, detail: "Every European country on the IMF list." },
] as const;

function shuffle(list: string[], seed: number): string[] {
  const copy = list.slice();
  let state = seed >>> 0;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    const j = state % (i + 1);
    const current = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = current;
  }
  return copy;
}

function move(list: string[], index: number, direction: -1 | 1): string[] {
  const next = index + direction;
  if (next < 0 || next >= list.length) return list;
  const copy = list.slice();
  const current = copy[index]!;
  copy[index] = copy[next]!;
  copy[next] = current;
  return copy;
}

function inPlace(order: string[], correct: string[]): number {
  return order.reduce((total, country, index) => total + (country === correct[index] ? 1 : 0), 0);
}

export function GdpClient() {
  const [step, setStep] = useState<Step>("size");
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<Mode>("single");
  const [order, setOrder] = useState<string[]>([]);
  const [firstScore, setFirstScore] = useState<number | null>(null);
  const [secondScore, setSecondScore] = useState<number | null>(null);
  const [seed, setSeed] = useState(1);

  const correct = useMemo(
    () => EUROPE_GDP_2025.slice(0, count).map((row) => row.country),
    [count],
  );
  const billions = useMemo(() => {
    const table = new Map<string, number>();
    for (const row of EUROPE_GDP_2025) table.set(row.country, row.billions);
    return table;
  }, []);

  function beginSort(nextCount: number, nextMode: Mode, nextSeed: number) {
    const names = EUROPE_GDP_2025.slice(0, nextCount).map((row) => row.country);
    setCount(nextCount);
    setMode(nextMode);
    setSeed(nextSeed);
    setOrder(shuffle(names, nextSeed));
    setStep("sort");
  }

  function lock() {
    const points = inPlace(order, correct);
    if (mode === "separate" && firstScore === null) {
      setFirstScore(points);
      setOrder(shuffle(correct, seed + 17));
      setStep("handoff");
      return;
    }
    if (mode === "separate") setSecondScore(points);
    else setFirstScore(points);
    setStep("reveal");
  }

  const score = firstScore ?? 0;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-4 py-8">
      <Link href="/funquiz" className="text-sm text-amber-200/90 hover:text-white">
        Back to games
      </Link>
      <h1 className="mt-4 text-center text-4xl font-bold text-white">European GDP</h1>
      <p className="mt-2 text-center text-sm text-slate-300">
        Put the countries in order, largest economy first. The figures stay hidden until you lock the list.
      </p>

      {step === "size" ? (
        <div className="mt-8 grid gap-3">
          {SIZES.map((size) => (
            <button
              key={size.count}
              type="button"
              onClick={() => {
                setCount(size.count);
                setFirstScore(null);
                setSecondScore(null);
                setStep("mode");
              }}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-left text-white hover:border-amber-300/60"
            >
              <span className="block text-lg font-semibold">{size.title}</span>
              <span className="mt-1 block text-sm text-slate-300">{size.detail}</span>
            </button>
          ))}
        </div>
      ) : null}

      {step === "mode" ? (
        <div className="mt-8 grid gap-3">
          {(
            [
              ["single", "Single player", "Sort the list on your own."],
              ["together", "Play together", "Sort one shared list."],
              ["separate", "Play separate", "Each player sorts a shuffled list, then the scores are compared."],
            ] as const
          ).map(([id, title, detail]) => (
            <button
              key={id}
              type="button"
              onClick={() => beginSort(count, id, Date.now() % 100000)}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-left text-white hover:border-amber-300/60"
            >
              <span className="block text-lg font-semibold">{title}</span>
              <span className="mt-1 block text-sm text-slate-300">{detail}</span>
            </button>
          ))}
        </div>
      ) : null}

      {step === "handoff" ? (
        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center">
          <p className="text-lg text-white">Player 1 locked a score of {firstScore} out of {count}.</p>
          <button
            type="button"
            onClick={() => setStep("sort")}
            className="mt-6 rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Player 2, start your list
          </button>
        </section>
      ) : null}

      {step === "sort" ? (
        <section className="mt-6">
          <p className="text-center text-sm text-amber-200/90">
            {mode === "separate" && firstScore !== null ? "Player 2" : mode === "separate" ? "Player 1" : "Largest at the top"}
          </p>
          <ol className="mt-4 space-y-2">
            {order.map((country, index) => (
              <li key={country} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2">
                <span className="w-8 text-center text-sm text-slate-400">{index + 1}</span>
                <span className="flex-1 text-white">{country}</span>
                <button
                  type="button"
                  aria-label={`Move ${country} up`}
                  onClick={() => setOrder((current) => move(current, index, -1))}
                  className="rounded-full border border-white/15 px-3 py-1 text-sm text-white"
                >
                  Up
                </button>
                <button
                  type="button"
                  aria-label={`Move ${country} down`}
                  onClick={() => setOrder((current) => move(current, index, 1))}
                  className="rounded-full border border-white/15 px-3 py-1 text-sm text-white"
                >
                  Down
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={lock}
            className="mt-5 w-full rounded-full bg-amber-300 py-3 text-sm font-semibold text-slate-950"
          >
            Lock this order
          </button>
        </section>
      ) : null}

      {step === "reveal" ? (
        <section className="mt-6">
          <p className="text-center text-2xl font-semibold text-white">
            {mode === "separate"
              ? `Player 1: ${score} / ${count} · Player 2: ${secondScore} / ${count}`
              : `${score} of ${count} in the right place`}
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">{EUROPE_GDP_NOTE}</p>
          <ol className="mt-4 space-y-2">
            {correct.map((country, index) => (
              <li key={country} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white">
                <span>
                  {index + 1}. {country}
                </span>
                <span className="text-sm text-amber-200">{billions.get(country)?.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => {
              setFirstScore(null);
              setSecondScore(null);
              setStep("size");
            }}
            className="mt-5 w-full rounded-full border border-white/15 py-3 text-sm text-white"
          >
            Play again
          </button>
        </section>
      ) : null}
    </main>
  );
}
