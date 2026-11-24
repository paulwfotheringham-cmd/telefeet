"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clubAuthHeaders } from "@/lib/funquiz/club-browser";

type LinkKind = "podcast" | "music" | "book" | "movie" | "tv";

const NAME_PLACEHOLDER: Record<LinkKind, string> = {
  podcast: "Show name",
  music: "Track or artist",
  book: "Book title",
  movie: "Film title",
  tv: "Series title",
};

type SavedLink = {
  id: string;
  email: string;
  name: string;
  url: string;
  description: string;
  createdAt: string;
};

export function LinkLibrary({
  kind,
  title,
  intro,
}: {
  kind: LinkKind;
  title: string;
  intro: string;
}) {
  const [items, setItems] = useState<SavedLink[]>([]);
  const [savedBy, setSavedBy] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/club/links?kind=${kind}`, { cache: "no-store" });
    const data = (await res.json()) as { items?: SavedLink[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load this list.");
      setLoaded(true);
      return;
    }
    setItems(data.items ?? []);
    setLoaded(true);
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/club/links", {
        method: "POST",
        headers: clubAuthHeaders(),
        body: JSON.stringify({ kind, name, url, description, savedBy }),
      });
      const data = (await res.json()) as { error?: string; item?: SavedLink };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Could not save that.");
        return;
      }
      setSavedBy("");
      setName("");
      setUrl("");
      setDescription("");
      setAdding(false);
      setItems((current) => [data.item!, ...current.filter((item) => item.id !== data.item!.id)]);
    } catch {
      setError("Could not save that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 py-8 sm:py-10">
      <Link href="/funquiz" className="text-sm font-medium text-slate-300 hover:text-white">
        Back to games
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{intro}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdding((open) => !open);
            setError("");
          }}
          className="rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20"
        >
          {adding ? "Close" : "Add new"}
        </button>
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Saved</h2>
        {!loaded ? <p className="mt-4 text-sm text-slate-400">Loading…</p> : null}
        {loaded && items.length === 0 ? <p className="mt-4 text-sm text-slate-400">Nothing saved yet.</p> : null}
        {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
          {items.map((item) => {
            const label = item.name || item.description || item.url || "Untitled";
            const href = /^https?:\/\//i.test(item.url) ? item.url : "";
            return (
            <li key={item.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    {label}
                  </a>
                ) : (
                  <p className="text-lg font-semibold text-white">{label}</p>
                )}
                {item.email ? (
                  <p className="text-sm text-amber-100">
                    Saved by <span className="font-medium">{item.email}</span>
                  </p>
                ) : null}
              </div>
              {item.description && item.description !== label ? <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.description}</p> : null}
              {item.url && item.url !== label ? <p className="mt-2 break-all text-xs text-slate-500">{item.url}</p> : null}
            </li>
            );
          })}
        </ul>
        ) : null}
      </section>

      {adding ? (
      <form noValidate onSubmit={(event) => void submit(event)} className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-6">
        <label className="block text-sm font-medium text-slate-200">
          Your name
          <input
            value={savedBy}
            maxLength={80}
            onChange={(event) => setSavedBy(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder="Optional"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-200">
          Name
          <input
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder={NAME_PLACEHOLDER[kind]}
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-200">
          Internet URL
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder="Optional"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-200">
          Description
          <textarea
            value={description}
            maxLength={600}
            rows={4}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder="What is it?"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
      ) : null}
    </div>
  );
}
