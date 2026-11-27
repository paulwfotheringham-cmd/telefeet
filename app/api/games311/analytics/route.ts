import { NextResponse } from "next/server";
import {
  ApiError,
  getAdminOrNull,
  parseFeedbackStatus,
  requireUuid,
  sanitizeFeedbackText,
  sanitizeGameId,
  sanitizePath,
  touchVisitor,
} from "@/lib/games311/server";

export const dynamic = "force-dynamic";

type Body = {
  action?: string;
  visitorId?: string;
  sessionId?: string;
  path?: string;
  activeMsDelta?: number;
  gameId?: string | null;
  eventType?: string;
  wouldPay?: boolean;
  feedbackText?: string;
  feedbackStatus?: string;
  endSession?: boolean;
};

const recent = new Map<string, number>();
const RATE_MS = 4000;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const prev = recent.get(key) ?? 0;
  if (now - prev < RATE_MS) return false;
  recent.set(key, now);
  if (recent.size > 5000) {
    for (const [k, t] of recent) {
      if (now - t > 60_000) recent.delete(k);
    }
  }
  return true;
}

export async function POST(request: Request) {
  try {
    const supabase = getAdminOrNull();
    if (!supabase) {
      return NextResponse.json(
        { error: "Analytics storage is not configured on this server." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as Body;
    const action = body.action?.trim();
    if (!action) {
      return NextResponse.json({ error: "action required" }, { status: 400 });
    }

    const visitorId = requireUuid(body.visitorId, "visitorId");
    if (!rateLimit(`${action}:${visitorId}`)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (action === "session_start") {
      const sessionId = requireUuid(body.sessionId, "sessionId");
      const path = sanitizePath(body.path);
      const visitor = await touchVisitor(supabase, visitorId, { bumpVisit: true });
      const now = new Date().toISOString();
      const { error } = await supabase.from("games311_sessions").upsert(
        {
          session_id: sessionId,
          visitor_id: visitorId,
          started_at: now,
          last_active_at: now,
          active_ms: 0,
          visit_number: visitor.visit_count,
          landing_path: path,
          updated_at: now,
        },
        { onConflict: "session_id" },
      );
      if (error) throw new ApiError(500, error.message);

      await supabase.from("games311_game_events").insert({
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: "page_view",
        game_id: "home",
      });

      return NextResponse.json({
        ok: true,
        visitNumber: visitor.visit_count,
        isReturning: visitor.is_returning,
        feedbackStatus: visitor.feedback_status,
      });
    }

    if (action === "heartbeat") {
      const sessionId = requireUuid(body.sessionId, "sessionId");
      const delta = Math.min(Math.max(0, Math.floor(Number(body.activeMsDelta) || 0)), 120_000);
      const status = parseFeedbackStatus(body.feedbackStatus);
      const visitor = await touchVisitor(supabase, visitorId, {
        addActiveMs: delta,
        feedbackStatus: status ?? undefined,
      });

      const now = new Date().toISOString();
      const { data: session } = await supabase
        .from("games311_sessions")
        .select("active_ms")
        .eq("session_id", sessionId)
        .eq("visitor_id", visitorId)
        .maybeSingle();

      if (session) {
        const { error } = await supabase
          .from("games311_sessions")
          .update({
            active_ms: Number(session.active_ms) + delta,
            last_active_at: now,
            ended_at: body.endSession ? now : null,
            updated_at: now,
          })
          .eq("session_id", sessionId)
          .eq("visitor_id", visitorId);
        if (error) throw new ApiError(500, error.message);
      }

      return NextResponse.json({
        ok: true,
        visitNumber: visitor.visit_count,
        feedbackStatus: visitor.feedback_status,
      });
    }

    if (action === "game_event") {
      const sessionId = requireUuid(body.sessionId, "sessionId");
      const gameId = sanitizeGameId(body.gameId);
      const eventType = body.eventType?.trim();
      if (!gameId || (eventType !== "game_launch" && eventType !== "game_end" && eventType !== "page_view")) {
        return NextResponse.json({ error: "Invalid game event" }, { status: 400 });
      }
      const activeMs =
        body.activeMsDelta == null
          ? null
          : Math.min(Math.max(0, Math.floor(Number(body.activeMsDelta) || 0)), 3_600_000);

      await touchVisitor(supabase, visitorId, {});
      const { error } = await supabase.from("games311_game_events").insert({
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: eventType,
        game_id: gameId,
        active_ms: activeMs,
      });
      if (error) throw new ApiError(500, error.message);
      return NextResponse.json({ ok: true });
    }

    if (action === "feedback") {
      const sessionId = body.sessionId ? requireUuid(body.sessionId, "sessionId") : null;
      if (typeof body.wouldPay !== "boolean") {
        return NextResponse.json({ error: "wouldPay required" }, { status: 400 });
      }
      const text = sanitizeFeedbackText(body.feedbackText);
      const gameId = sanitizeGameId(body.gameId);
      const visitor = await touchVisitor(supabase, visitorId, { feedbackStatus: "submitted" });

      const { error } = await supabase.from("games311_feedback").upsert(
        {
          visitor_id: visitorId,
          session_id: sessionId,
          would_pay: body.wouldPay,
          feedback_text: text,
          game_id: gameId,
          visit_number: visitor.visit_count,
        },
        { onConflict: "visitor_id" },
      );
      if (error) throw new ApiError(500, error.message);
      return NextResponse.json({ ok: true });
    }

    if (action === "feedback_status") {
      const status = parseFeedbackStatus(body.feedbackStatus);
      if (!status || (status !== "shown" && status !== "dismissed" && status !== "eligible")) {
        return NextResponse.json({ error: "Invalid feedbackStatus" }, { status: 400 });
      }
      const visitor = await touchVisitor(supabase, visitorId, { feedbackStatus: status });
      return NextResponse.json({ ok: true, feedbackStatus: visitor.feedback_status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[games311 analytics]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
