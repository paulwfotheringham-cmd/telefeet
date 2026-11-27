import { ResultsShell, StatCard } from "@/components/games311/results-shell";
import { fetchComments } from "@/lib/games311/results-queries";

export const dynamic = "force-dynamic";

export default async function ResultsCommentsPage({
  searchParams,
}: {
  searchParams?: { q?: string; game?: string; wouldPay?: string; page?: string };
}) {
  const q = searchParams?.q || "";
  const game = searchParams?.game || "";
  const wouldPay =
    searchParams?.wouldPay === "yes" || searchParams?.wouldPay === "no"
      ? searchParams.wouldPay
      : "";
  const page = Number(searchParams?.page || "1") || 1;

  let payload: Awaited<ReturnType<typeof fetchComments>> | null = null;
  let error: string | null = null;
  try {
    payload = await fetchComments({ search: q, game, wouldPay, page, pageSize: 25 });
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load comments";
  }

  const totalPages = payload ? Math.max(1, Math.ceil(payload.total / payload.pageSize)) : 1;

  return (
    <ResultsShell active="comments">
      <h2 className="text-xl font-semibold">Comments</h2>
      <p className="mt-1 text-sm text-slate-500">
        Optional free-text feedback collected historically. Current popup no longer asks for
        comments.
      </p>
      {error ? (
        <p className="mt-4 text-sm text-rose-700">{error}</p>
      ) : payload ? (
        <>
          <div className="mt-4">
            <StatCard label="Comments" value={payload.total} />
          </div>
          <form className="mt-4 flex flex-wrap gap-2" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search text / visitor / game"
              className="min-w-[14rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="game"
              defaultValue={game}
              placeholder="Game id"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              name="wouldPay"
              defaultValue={wouldPay}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All YES/NO</option>
              <option value="yes">YES only</option>
              <option value="no">NO only</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Filter
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {payload.rows.length === 0 ? (
              <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
                No comments in the database.
              </p>
            ) : (
              payload.rows.map((r) => (
                <article key={r.id} className="rounded-xl border bg-white p-4 text-sm shadow-sm">
                  <p className="whitespace-pre-wrap text-slate-800">{r.feedback_text}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleString()} · visitor{" "}
                    <span className="font-mono">{r.visitor_id.slice(0, 8)}…</span>
                    {r.game_id ? ` · game ${r.game_id}` : ""} ·{" "}
                    {r.would_pay ? "YES" : "NO"}
                  </p>
                </article>
              ))
            )}
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex gap-2 text-sm">
              {page > 1 ? (
                <a
                  className="text-violet-700 hover:underline"
                  href={`/results/comments?q=${encodeURIComponent(q)}&game=${encodeURIComponent(game)}&wouldPay=${wouldPay}&page=${page - 1}`}
                >
                  ← Prev
                </a>
              ) : null}
              <span className="text-slate-500">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <a
                  className="text-violet-700 hover:underline"
                  href={`/results/comments?q=${encodeURIComponent(q)}&game=${encodeURIComponent(game)}&wouldPay=${wouldPay}&page=${page + 1}`}
                >
                  Next →
                </a>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </ResultsShell>
  );
}
