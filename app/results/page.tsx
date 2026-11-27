import Link from "next/link";
import { BarChart, ResultsShell, StatCard } from "@/components/games311/results-shell";
import { fetchOverview, formatMs, formatPct } from "@/lib/games311/results-queries";

export const dynamic = "force-dynamic";

export default async function ResultsOverviewPage() {
  let data: Awaited<ReturnType<typeof fetchOverview>> | null = null;
  let error: string | null = null;
  try {
    data = await fetchOverview();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load analytics";
  }

  return (
    <ResultsShell active="overview">
      <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
      {error ? (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : data ? (
        <>
          <section className="mt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Visitors</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Unique visitors" value={data.uniqueVisitors} />
              <StatCard label="New visitors" value={data.newVisitors} />
              <StatCard label="Returning visitors" value={data.returningVisitors} />
              <StatCard label="Returning %" value={formatPct(data.returningPct)} />
              <StatCard label="Total visits" value={data.totalVisits} />
              <StatCard
                label="Avg visits / visitor"
                value={data.avgVisitsPerVisitor.toFixed(2)}
              />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Engagement
            </h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Games played" value={data.totalGamesPlayed} />
              <StatCard label="Avg active / visitor" value={formatMs(data.avgActiveMsPerVisitor)} />
              <StatCard label="Avg active / visit" value={formatMs(data.avgActiveMsPerVisit)} />
              <StatCard label="Total active time" value={formatMs(data.totalActiveMs)} />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Subscription validation
            </h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="YES" value={data.yes} />
              <StatCard label="NO" value={data.no} />
              <StatCard label="YES %" value={formatPct(data.yesPct)} />
              <StatCard label="NO %" value={formatPct(data.noPct)} />
              <StatCard label="Total responses" value={data.totalResponses} />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Feedback</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Total comments"
                value={data.totalComments}
                href="/results/comments"
              />
              <Link
                href="/results/comments"
                className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-semibold text-violet-800 shadow-sm hover:bg-violet-100"
              >
                View all comments →
              </Link>
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <BarChart
              title="Visitors over time (first seen)"
              points={data.visitorsOverTime.map((p) => ({ label: p.day, value: p.count }))}
            />
            <BarChart
              title="Returning vs new"
              points={[
                { label: "Returning", value: data.returningVsNew.returning },
                { label: "New", value: data.returningVsNew.newVisitors },
              ]}
            />
            <BarChart
              title="YES vs NO"
              points={[
                { label: "YES", value: data.yesVsNo.yes },
                { label: "NO", value: data.yesVsNo.no },
              ]}
            />
            <BarChart
              title="Games played over time"
              points={data.gamesOverTime.map((p) => ({ label: p.day, value: p.count }))}
            />
          </section>
        </>
      ) : null}
    </ResultsShell>
  );
}
