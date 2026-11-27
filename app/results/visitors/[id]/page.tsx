import Link from "next/link";
import { ResultsShell } from "@/components/games311/results-shell";
import { fetchVisitorDetail, formatMs } from "@/lib/games311/results-queries";

export const dynamic = "force-dynamic";

export default async function VisitorDetailPage({ params }: { params: { id: string } }) {
  let detail: Awaited<ReturnType<typeof fetchVisitorDetail>> | null = null;
  let error: string | null = null;
  try {
    detail = await fetchVisitorDetail(params.id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load visitor";
  }

  return (
    <ResultsShell active="visitors">
      <Link href="/results/visitors" className="text-sm text-violet-700 hover:underline">
        ← Back to visitors
      </Link>
      <h2 className="mt-2 text-xl font-semibold">Visitor detail</h2>
      {error ? (
        <p className="mt-4 text-sm text-rose-700">{error}</p>
      ) : !detail?.visitor ? (
        <p className="mt-4 text-sm text-slate-500">Visitor not found</p>
      ) : (
        <>
          <p className="mt-2 font-mono text-xs text-slate-600">{detail.visitor.visitor_id}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-lg border bg-white p-3">
              First: {new Date(detail.visitor.first_seen_at).toLocaleString()}
            </div>
            <div className="rounded-lg border bg-white p-3">
              Last: {new Date(detail.visitor.last_seen_at).toLocaleString()}
            </div>
            <div className="rounded-lg border bg-white p-3">
              Visits: {detail.visitor.visit_count}
            </div>
            <div className="rounded-lg border bg-white p-3">
              Active: {formatMs(detail.visitor.total_active_ms)}
            </div>
            <div className="rounded-lg border bg-white p-3">
              Feedback:{" "}
              {detail.feedback
                ? detail.feedback.would_pay
                  ? "YES"
                  : "NO"
                : "—"}
            </div>
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase text-slate-500">Visits</h3>
          <div className="mt-2 space-y-3">
            {detail.sessions.length === 0 ? (
              <p className="text-sm text-slate-500">No sessions recorded</p>
            ) : (
              detail.sessions.map((s) => {
                const sessionEvents = detail!.events.filter((e) => e.session_id === s.session_id);
                const launches = sessionEvents.filter((e) => e.event_type === "game_launch");
                return (
                  <div key={s.session_id} className="rounded-xl border bg-white p-4 text-sm">
                    <p className="font-medium">
                      {new Date(s.started_at).toLocaleString()}
                      {s.ended_at ? ` → ${new Date(s.ended_at).toLocaleString()}` : ""}
                    </p>
                    <p className="mt-1 text-slate-600">
                      Visit #{s.visit_number} · Active {formatMs(s.active_ms)} · Games played{" "}
                      {launches.length}
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-slate-700">
                      {launches.length === 0 ? (
                        <li>No games launched this visit</li>
                      ) : (
                        launches.map((e) => {
                          const end = sessionEvents.find(
                            (x) =>
                              x.event_type === "game_end" &&
                              x.game_id === e.game_id &&
                              x.created_at >= e.created_at,
                          );
                          return (
                            <li key={e.id}>
                              {e.game_id}
                              {end?.active_ms != null ? ` · ${formatMs(end.active_ms)}` : ""}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </ResultsShell>
  );
}
