import Link from "next/link";
import { ResultsShell, StatCard } from "@/components/games311/results-shell";
import { fetchVisitors, formatMs } from "@/lib/games311/results-queries";

export const dynamic = "force-dynamic";

export default async function ResultsVisitorsPage({
  searchParams,
}: {
  searchParams?: { q?: string; sort?: string };
}) {
  const q = searchParams?.q || "";
  const sort = searchParams?.sort || "last";
  let payload: Awaited<ReturnType<typeof fetchVisitors>> | null = null;
  let error: string | null = null;
  try {
    payload = await fetchVisitors(q);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load visitors";
  }

  const rows = [...(payload?.rows || [])].sort((a, b) => {
    if (sort === "visits") return b.visit_count - a.visit_count;
    if (sort === "active") return b.total_active_ms - a.total_active_ms;
    if (sort === "games") return b.games_played_count - a.games_played_count;
    return b.last_seen_at.localeCompare(a.last_seen_at);
  });

  return (
    <ResultsShell active="visitors">
      <h2 className="text-xl font-semibold">Visitors</h2>
      {error ? (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : payload ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="New visitors" value={payload.newCount} />
            <StatCard label="Returning visitors" value={payload.returningCount} />
            <StatCard label="1 visit" value={payload.frequency.one} />
            <StatCard label="2–3 visits" value={payload.frequency.twoThree} />
            <StatCard label="4–10 visits" value={payload.frequency.fourTen} />
            <StatCard label="10+ visits" value={payload.frequency.tenPlus} />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Retention beyond visit counts is Unavailable from current session linkage alone.
          </p>

          <form className="mt-4 flex flex-wrap gap-2" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search visitor ID or game"
              className="min-w-[16rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="last">Sort: last visit</option>
              <option value="visits">Sort: visits</option>
              <option value="active">Sort: active time</option>
              <option value="games">Sort: games played</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </form>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Visitor</th>
                  <th className="px-3 py-2">First</th>
                  <th className="px-3 py-2">Last</th>
                  <th className="px-3 py-2">Visits</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Games #</th>
                  <th className="px-3 py-2">Games</th>
                  <th className="px-3 py-2">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-slate-500">
                      No visitors yet
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.visitor_id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-xs">
                        <Link
                          href={`/results/visitors/${r.visitor_id}`}
                          className="text-violet-700 hover:underline"
                        >
                          {r.visitor_id.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(r.first_seen_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(r.last_seen_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{r.visit_count}</td>
                      <td className="px-3 py-2">{formatMs(r.total_active_ms)}</td>
                      <td className="px-3 py-2 tabular-nums">{r.games_played_count}</td>
                      <td className="px-3 py-2 max-w-[12rem] truncate">
                        {r.games_played.join(", ") || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {r.would_pay == null ? "—" : r.would_pay ? "YES" : "NO"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </ResultsShell>
  );
}
