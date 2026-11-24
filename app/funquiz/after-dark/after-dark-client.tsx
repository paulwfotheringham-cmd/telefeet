"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  shuffleStills,
  stillsForHeat,
  type AfterDarkHeat,
  type AfterDarkStill,
} from "@/lib/funquiz/after-dark";

const GATE_KEY = "after-dark-ok";

type Step = "gate" | "heat" | "who" | "handoff" | "reel" | "reveal";

const HEATS: { id: AfterDarkHeat; title: string; detail: string }[] = [
  { id: "warm", title: "Warm", detail: "Evening clothes. A look." },
  { id: "warmer", title: "Warmer", detail: "Closer. A bare shoulder, an open collar." },
  { id: "hot", title: "Hot", detail: "Bedroom light. Still dressed." },
];

function stillById(deck: AfterDarkStill[], id: string) {
  return deck.find((still) => still.id === id) ?? null;
}

export function AfterDarkClient() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>("gate");
  const [heat, setHeat] = useState<AfterDarkHeat>("warm");
  const [two, setTwo] = useState(false);
  const [deck, setDeck] = useState<AfterDarkStill[]>([]);
  const [index, setIndex] = useState(0);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [firstKept, setFirstKept] = useState<string[]>([]);
  const [secondKept, setSecondKept] = useState<string[]>([]);

  useEffect(() => {
    if (window.localStorage.getItem(GATE_KEY) === "1") setStep("heat");
    setReady(true);
  }, []);

  function enter() {
    window.localStorage.setItem(GATE_KEY, "1");
    setStep("heat");
  }

  function start(nextHeat: AfterDarkHeat, nextTwo: boolean) {
    setHeat(nextHeat);
    setTwo(nextTwo);
    setDeck(shuffleStills(stillsForHeat(nextHeat), Date.now() % 100000));
    setIndex(0);
    setPlayer(1);
    setFirstKept([]);
    setSecondKept([]);
    setStep("reel");
  }

  function choose(keep: boolean) {
    const current = deck[index];
    if (!current) return;
    if (keep) {
      if (player === 1) setFirstKept((kept) => [...kept, current.id]);
      else setSecondKept((kept) => [...kept, current.id]);
    }
    if (index + 1 < deck.length) {
      setIndex(index + 1);
      return;
    }
    if (two && player === 1) {
      setStep("handoff");
      return;
    }
    setStep("reveal");
  }

  function beginSecond() {
    setPlayer(2);
    setIndex(0);
    setStep("reel");
  }

  if (!ready) return <main className="min-h-[100dvh] bg-black" />;

  if (step === "gate") {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">After dark</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Adults 18 and over</h1>
        <p className="mt-3 text-sm text-slate-300">Suggestive pictures. Nothing explicit. No questions.</p>
        <button
          type="button"
          onClick={enter}
          className="mt-8 rounded-full bg-amber-300 py-3 text-sm font-semibold text-slate-950"
        >
          Enter
        </button>
        <Link href="/funquiz" className="mt-4 text-sm text-slate-400">
          Not now
        </Link>
      </main>
    );
  }

  if (step === "heat" || step === "who") {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-6 py-10">
        <Link href="/funquiz" className="text-sm text-slate-400">
          Back
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-white">The Reel</h1>
        <p className="mt-2 text-sm text-slate-300">Pictures, one at a time. Keep one, or move on.</p>
        {step === "heat" ? (
          <div className="mt-8 grid gap-3">
            {HEATS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setHeat(item.id);
                  setStep("who");
                }}
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-left"
              >
                <span className="block text-lg font-semibold text-white">{item.title}</span>
                <span className="mt-1 block text-sm text-slate-300">{item.detail}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            <button
              type="button"
              onClick={() => start(heat, false)}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-left text-white"
            >
              <span className="block text-lg font-semibold">Just me</span>
              <span className="mt-1 block text-sm text-slate-300">Keep the pictures you want.</span>
            </button>
            <button
              type="button"
              onClick={() => start(heat, true)}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-left text-white"
            >
              <span className="block text-lg font-semibold">Two of us</span>
              <span className="mt-1 block text-sm text-slate-300">Each of you keeps a private set. Then you see where you differed.</span>
            </button>
          </div>
        )}
      </main>
    );
  }

  if (step === "handoff") {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 text-center">
        <h1 className="text-4xl font-bold text-white">Pass the phone</h1>
        <p className="mt-3 text-sm text-slate-300">
          Player 2, same pictures. What you keep stays hidden until the end.
        </p>
        <button
          type="button"
          onClick={beginSecond}
          className="mt-8 rounded-full bg-amber-300 py-3 text-sm font-semibold text-slate-950"
        >
          Player 2, start
        </button>
      </main>
    );
  }

  if (step === "reveal") {
    const both = firstKept.filter((id) => secondKept.includes(id));
    const onlyFirst = firstKept.filter((id) => !secondKept.includes(id));
    const onlySecond = secondKept.filter((id) => !firstKept.includes(id));
    const groups = two
      ? [
          ["Only player 1", onlyFirst],
          ["Only player 2", onlySecond],
          ["You both kept", both],
        ]
      : [["You kept", firstKept]];
    return (
      <main className="mx-auto min-h-[100dvh] max-w-3xl px-4 py-8">
        <h1 className="text-center text-4xl font-bold text-white">{two ? "Where you differed" : "You kept"}</h1>
        {groups.map(([title, ids]) => (
          <section key={String(title)} className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/80">{title}</h2>
            {Array.isArray(ids) && ids.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ids.map((id) => {
                  const still = stillById(deck, String(id));
                  if (!still) return null;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={still.id} src={still.src} alt="" className="aspect-[3/4] w-full rounded-2xl object-cover" />
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">None.</p>
            )}
          </section>
        ))}
        <button
          type="button"
          onClick={() => setStep("heat")}
          className="mt-8 w-full rounded-full border border-white/15 py-3 text-sm text-white"
        >
          Play again
        </button>
      </main>
    );
  }

  const still = deck[index];
  if (!still) return null;

  return (
    <main className="relative min-h-[100dvh] bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still.src} alt="" className="mx-auto h-[100dvh] w-full max-w-3xl object-contain" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 text-xs text-white/80">
        <span>{two ? `Player ${player}` : "The Reel"}</span>
        <span>
          {index + 1} / {deck.length}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-6 pt-16">
        <button
          type="button"
          onClick={() => choose(false)}
          className="flex-1 rounded-full border border-white/20 py-3 text-sm font-semibold text-white"
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="flex-1 rounded-full bg-amber-300 py-3 text-sm font-semibold text-slate-950"
        >
          Keep
        </button>
      </div>
    </main>
  );
}
