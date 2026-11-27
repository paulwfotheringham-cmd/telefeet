import { createAdminClient } from "@/lib/supabase/admin";

export type VisitorRow = {
  visitor_id: string;
  first_seen_at: string;
  last_seen_at: string;
  visit_count: number;
  total_active_ms: number;
  feedback_status: string;
};

export type SessionRow = {
  session_id: string;
  visitor_id: string;
  started_at: string;
  ended_at: string | null;
  active_ms: number;
  visit_number: number;
  landing_path: string;
};

export type EventRow = {
  id: string;
  visitor_id: string;
  session_id: string;
  event_type: string;
  game_id: string;
  active_ms: number | null;
  created_at: string;
};

export type FeedbackRow = {
  id: string;
  visitor_id: string;
  session_id: string | null;
  would_pay: boolean;
  feedback_text: string | null;
  game_id: string | null;
  visit_number: number | null;
  created_at: string;
};

function admin() {
  return createAdminClient();
}

export async function fetchOverview() {
  const supabase = admin();
  const [{ data: visitors }, { data: sessions }, { data: events }, { data: feedback }] =
    await Promise.all([
      supabase.from("games311_visitors").select("*"),
      supabase.from("games311_sessions").select("*"),
      supabase.from("games311_game_events").select("*"),
      supabase.from("games311_feedback").select("*"),
    ]);

  const v = (visitors || []) as VisitorRow[];
  const s = (sessions || []) as SessionRow[];
  const e = (events || []) as EventRow[];
  const f = (feedback || []) as FeedbackRow[];

  const uniqueVisitors = v.length;
  const returning = v.filter((x) => x.visit_count > 1).length;
  const newVisitors = v.filter((x) => x.visit_count === 1).length;
  const totalVisits = v.reduce((n, x) => n + Number(x.visit_count || 0), 0);
  const totalActiveMs = v.reduce((n, x) => n + Number(x.total_active_ms || 0), 0);
  const launches = e.filter((x) => x.event_type === "game_launch");
  const yes = f.filter((x) => x.would_pay === true).length;
  const no = f.filter((x) => x.would_pay === false).length;
  const comments = f.filter((x) => (x.feedback_text || "").trim().length > 0).length;

  const visitorsOverTime = bucketByDay(v.map((x) => x.first_seen_at));
  const gamesOverTime = bucketByDay(launches.map((x) => x.created_at));

  return {
    uniqueVisitors,
    newVisitors,
    returningVisitors: returning,
    returningPct: uniqueVisitors ? (returning / uniqueVisitors) * 100 : 0,
    totalVisits,
    avgVisitsPerVisitor: uniqueVisitors ? totalVisits / uniqueVisitors : 0,
    totalGamesPlayed: launches.length,
    avgActiveMsPerVisitor: uniqueVisitors ? totalActiveMs / uniqueVisitors : 0,
    avgActiveMsPerVisit: totalVisits ? totalActiveMs / totalVisits : 0,
    totalActiveMs,
    yes,
    no,
    yesPct: f.length ? (yes / f.length) * 100 : 0,
    noPct: f.length ? (no / f.length) * 100 : 0,
    totalResponses: f.length,
    totalComments: comments,
    visitorsOverTime,
    returningVsNew: { returning, newVisitors },
    yesVsNo: { yes, no },
    gamesOverTime,
  };
}

function bucketByDay(isos: string[]): { day: string; count: number }[] {
  const map = new Map<string, number>();
  for (const iso of isos) {
    if (!iso) continue;
    const day = iso.slice(0, 10);
    map.set(day, (map.get(day) || 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));
}

export async function fetchVisitors(search = "") {
  const supabase = admin();
  const [{ data: visitors }, { data: events }, { data: feedback }] = await Promise.all([
    supabase.from("games311_visitors").select("*").order("last_seen_at", { ascending: false }),
    supabase.from("games311_game_events").select("visitor_id, event_type, game_id"),
    supabase.from("games311_feedback").select("visitor_id, would_pay"),
  ]);
  const v = (visitors || []) as VisitorRow[];
  const e = (events || []) as Pick<EventRow, "visitor_id" | "event_type" | "game_id">[];
  const f = (feedback || []) as Pick<FeedbackRow, "visitor_id" | "would_pay">[];
  const fb = new Map(f.map((x) => [x.visitor_id, x.would_pay]));

  const gamesByVisitor = new Map<string, Set<string>>();
  const playsByVisitor = new Map<string, number>();
  for (const row of e) {
    if (row.event_type !== "game_launch") continue;
    playsByVisitor.set(row.visitor_id, (playsByVisitor.get(row.visitor_id) || 0) + 1);
    if (!gamesByVisitor.has(row.visitor_id)) gamesByVisitor.set(row.visitor_id, new Set());
    gamesByVisitor.get(row.visitor_id)!.add(row.game_id);
  }

  const q = search.trim().toLowerCase();
  const rows = v
    .map((x) => ({
      ...x,
      games_played_count: playsByVisitor.get(x.visitor_id) || 0,
      games_played: [...(gamesByVisitor.get(x.visitor_id) || [])],
      would_pay: fb.has(x.visitor_id) ? fb.get(x.visitor_id)! : null,
    }))
    .filter((x) => {
      if (!q) return true;
      return (
        x.visitor_id.toLowerCase().includes(q) ||
        x.games_played.some((g) => g.toLowerCase().includes(q))
      );
    });

  const freq = { one: 0, twoThree: 0, fourTen: 0, tenPlus: 0 };
  for (const x of v) {
    const n = Number(x.visit_count || 0);
    if (n <= 1) freq.one += 1;
    else if (n <= 3) freq.twoThree += 1;
    else if (n <= 10) freq.fourTen += 1;
    else freq.tenPlus += 1;
  }

  return {
    rows,
    frequency: freq,
    newCount: v.filter((x) => x.visit_count === 1).length,
    returningCount: v.filter((x) => x.visit_count > 1).length,
  };
}

export async function fetchVisitorDetail(visitorId: string) {
  const supabase = admin();
  const [{ data: visitor }, { data: sessions }, { data: events }, { data: feedback }] =
    await Promise.all([
      supabase.from("games311_visitors").select("*").eq("visitor_id", visitorId).maybeSingle(),
      supabase
        .from("games311_sessions")
        .select("*")
        .eq("visitor_id", visitorId)
        .order("started_at", { ascending: false }),
      supabase
        .from("games311_game_events")
        .select("*")
        .eq("visitor_id", visitorId)
        .order("created_at", { ascending: true }),
      supabase.from("games311_feedback").select("*").eq("visitor_id", visitorId).maybeSingle(),
    ]);

  return {
    visitor: visitor as VisitorRow | null,
    sessions: (sessions || []) as SessionRow[],
    events: (events || []) as EventRow[],
    feedback: feedback as FeedbackRow | null,
  };
}

export async function fetchGames() {
  const supabase = admin();
  const { data: events } = await supabase
    .from("games311_game_events")
    .select("game_id, event_type, visitor_id, active_ms, session_id");
  const e = (events || []) as Pick<
    EventRow,
    "game_id" | "event_type" | "visitor_id" | "active_ms" | "session_id"
  >[];

  type Agg = {
    game_id: string;
    plays: number;
    uniquePlayers: Set<string>;
    durations: number[];
    ends: number;
  };
  const map = new Map<string, Agg>();
  for (const row of e) {
    if (row.game_id === "home") continue;
    if (!map.has(row.game_id)) {
      map.set(row.game_id, {
        game_id: row.game_id,
        plays: 0,
        uniquePlayers: new Set(),
        durations: [],
        ends: 0,
      });
    }
    const agg = map.get(row.game_id)!;
    if (row.event_type === "game_launch") {
      agg.plays += 1;
      agg.uniquePlayers.add(row.visitor_id);
    }
    if (row.event_type === "game_end") {
      agg.ends += 1;
      if (row.active_ms != null) agg.durations.push(Number(row.active_ms));
    }
  }

  const rows = [...map.values()]
    .map((g) => {
      const avgDuration =
        g.durations.length > 0
          ? g.durations.reduce((a, b) => a + b, 0) / g.durations.length
          : null;
      const totalTime = g.durations.reduce((a, b) => a + b, 0);
      const unique = g.uniquePlayers.size;
      const repeatPlays = Math.max(0, g.plays - unique);
      const completionRate = g.plays > 0 ? (g.ends / g.plays) * 100 : null;
      return {
        game_id: g.game_id,
        plays: g.plays,
        uniquePlayers: unique,
        avgDurationMs: avgDuration,
        repeatPlays,
        completionRate,
        totalTimeMs: totalTime || null,
      };
    })
    .sort((a, b) => b.plays - a.plays);

  return rows;
}

export async function fetchGameDetail(gameId: string) {
  const rows = await fetchGames();
  const game = rows.find((g) => g.game_id === gameId) || null;
  const supabase = admin();
  const { data: events } = await supabase
    .from("games311_game_events")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false })
    .limit(200);
  return { game, events: (events || []) as EventRow[] };
}

export async function fetchComments(opts: {
  search?: string;
  game?: string;
  wouldPay?: "yes" | "no" | "";
  page?: number;
  pageSize?: number;
}) {
  const supabase = admin();
  const { data } = await supabase
    .from("games311_feedback")
    .select("*")
    .order("created_at", { ascending: false });
  let rows = ((data || []) as FeedbackRow[]).filter((r) => (r.feedback_text || "").trim().length > 0);

  const search = (opts.search || "").trim().toLowerCase();
  if (search) {
    rows = rows.filter(
      (r) =>
        (r.feedback_text || "").toLowerCase().includes(search) ||
        r.visitor_id.toLowerCase().includes(search) ||
        (r.game_id || "").toLowerCase().includes(search),
    );
  }
  if (opts.game) rows = rows.filter((r) => r.game_id === opts.game);
  if (opts.wouldPay === "yes") rows = rows.filter((r) => r.would_pay === true);
  if (opts.wouldPay === "no") rows = rows.filter((r) => r.would_pay === false);

  const pageSize = opts.pageSize || 25;
  const page = Math.max(1, opts.page || 1);
  const total = rows.length;
  const slice = rows.slice((page - 1) * pageSize, page * pageSize);
  return { rows: slice, total, page, pageSize };
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "Unavailable";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "Unavailable";
  return `${n.toFixed(1)}%`;
}
