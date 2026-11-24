"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clubAuthHeaders, clubToken } from "@/lib/funquiz/club-browser";

type LinkKind = "podcast" | "music";

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
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/club/links?kind=${kind}`, { headers: clubAuthHeaders() });
    if (res.status === 401) {
      window.location.replace(`/funquiz?next=${encodeURIComponent(`/funquiz/${kind === "podcast" ? "podcasts" : "music"}`)}`);
      return;
    }
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
    if (!clubToken()) return;
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
        body: JSON.stringify({ kind, name, url, description }),
      });
      const data = (await res.json()) as { error?: string; item?: SavedLink };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Could not save that.");
        return;
      }
      setName("");
      setUrl("");
      setDescription("");
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
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{intro}</p>

      <form onSubmit={(event) => void submit(event)} className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-6">
        <label className="block text-sm font-medium text-slate-200">
          Name
          <input
            required
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder={kind === "podcast" ? "Show name" : "Track or artist"}
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-200">
          Internet URL
          <input
            required
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-400/60"
            placeholder="https://"
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

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Saved</h2>
        {!loaded ? <p className="mt-4 text-sm text-slate-400">Loading…</p> : null}
        {loaded && items.length === 0 ? <p className="mt-4 text-sm text-slate-400">Nothing saved yet.</p> : null}
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <a href={item.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                {item.name}
              </a>
              {item.description ? <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.description}</p> : null}
              <p className="mt-3 break-all text-xs text-slate-400">{item.url}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.email}
                {" · "}
                {new Date(item.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
