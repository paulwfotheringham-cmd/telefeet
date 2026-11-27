import Link from "next/link";
import { ResultsShell } from "@/components/games311/results-shell";
import { fetchGames, formatMs, formatPct } from "@/lib/games311/results-queries";

export const dynamic = "force-dynamic";

export default async function ResultsGamesPage() {
  let rows: Awaited<ReturnType<typeof fetchGames>> = [];
  let error: string | null = null;
  try {
    rows = await fetchGames();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load games";
  }

  return (
    <ResultsShell active="games">
      <h2 className="text-xl font-semibold">Games</h2>
      {error ? (
        <p className="mt-4 text-sm text-rose-700">{error}</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Game</th>
                <th className="px-3 py-2">Plays</th>
                <th className="px-3 py-2">Unique players</th>
                <th className="px-3 py-2">Avg duration</th>
                <th className="px-3 py-2">Repeat plays</th>
                <th className="px-3 py-2">Completion</th>
                <th className="px-3 py-2">Total time</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-slate-500">
                    No game events yet
                  </td>
                </tr>
              ) : (
                rows.map((g) => (
                  <tr key={g.game_id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Link
                        href={`/results/games/${encodeURIComponent(g.game_id)}`}
                        className="font-medium text-violet-700 hover:underline"
                      >
                        {g.game_id}
                      </Link>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{g.plays}</td>
                    <td className="px-3 py-2 tabular-nums">{g.uniquePlayers}</td>
                    <td className="px-3 py-2">{formatMs(g.avgDurationMs)}</td>
                    <td className="px-3 py-2 tabular-nums">{g.repeatPlays}</td>
                    <td className="px-3 py-2">
                      {g.completionRate == null ? "Unavailable" : formatPct(g.completionRate)}
                    </td>
                    <td className="px-3 py-2">{formatMs(g.totalTimeMs)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </ResultsShell>
  );
}
