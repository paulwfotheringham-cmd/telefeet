import Link from "next/link";
import { ResultsShell, StatCard } from "@/components/games311/results-shell";
import { fetchGameDetail, formatMs, formatPct } from "@/lib/games311/results-queries";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: { id: string } }) {
  const gameId = decodeURIComponent(params.id);
  let detail: Awaited<ReturnType<typeof fetchGameDetail>> | null = null;
  let error: string | null = null;
  try {
    detail = await fetchGameDetail(gameId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load game";
  }

  return (
    <ResultsShell active="games">
      <Link href="/results/games" className="text-sm text-violet-700 hover:underline">
        ← Back to games
      </Link>
      <h2 className="mt-2 text-xl font-semibold">{gameId}</h2>
      {error ? (
        <p className="mt-4 text-sm text-rose-700">{error}</p>
      ) : !detail?.game ? (
        <p className="mt-4 text-sm text-slate-500">No stats for this game yet</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Plays" value={detail.game.plays} />
            <StatCard label="Unique players" value={detail.game.uniquePlayers} />
            <StatCard label="Avg duration" value={formatMs(detail.game.avgDurationMs)} />
            <StatCard label="Repeat plays" value={detail.game.repeatPlays} />
            <StatCard
              label="Completion rate"
              value={
                detail.game.completionRate == null
                  ? "Unavailable"
                  : formatPct(detail.game.completionRate)
              }
            />
            <StatCard label="Total time" value={formatMs(detail.game.totalTimeMs)} />
          </div>
          <h3 className="mt-8 text-sm font-semibold uppercase text-slate-500">Recent events</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {detail.events.map((e) => (
              <li key={e.id} className="rounded-lg border bg-white px-3 py-2">
                {new Date(e.created_at).toLocaleString()} · {e.event_type}
                {e.active_ms != null ? ` · ${formatMs(e.active_ms)}` : ""} · visitor{" "}
                <span className="font-mono text-xs">{e.visitor_id.slice(0, 8)}…</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ResultsShell>
  );
}
