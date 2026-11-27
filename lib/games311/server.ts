import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/games311/ids";

export type FeedbackStatus = "pending" | "eligible" | "shown" | "submitted" | "dismissed";

const FEEDBACK_STATUSES = new Set<FeedbackStatus>([
  "pending",
  "eligible",
  "shown",
  "submitted",
  "dismissed",
]);

export function sanitizePath(raw: unknown): string {
  if (typeof raw !== "string") return "/";
  const trimmed = raw.trim().slice(0, 200);
  if (!trimmed.startsWith("/")) return "/";
  return trimmed;
}

export function sanitizeGameId(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") return null;
  const v = raw.trim().slice(0, 80);
  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(v)) return null;
  return v;
}

export function sanitizeFeedbackText(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") return null;
  const v = raw.trim().slice(0, 2000);
  return v.length ? v : null;
}

export function parseFeedbackStatus(raw: unknown): FeedbackStatus | null {
  if (typeof raw !== "string") return null;
  return FEEDBACK_STATUSES.has(raw as FeedbackStatus) ? (raw as FeedbackStatus) : null;
}

export function requireUuid(raw: unknown, field: string): string {
  if (typeof raw !== "string" || !isUuid(raw)) {
    throw new ApiError(400, `${field} must be a UUID`);
  }
  return raw;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getAdminOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

/** Soft rate limit: reject if last write for visitor was too recent (client also throttles). */
export async function touchVisitor(
  supabase: ReturnType<typeof createAdminClient>,
  visitorId: string,
  opts: { bumpVisit?: boolean; addActiveMs?: number; feedbackStatus?: FeedbackStatus },
) {
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("games311_visitors")
    .select("visitor_id, visit_count, total_active_ms, feedback_status")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("games311_visitors").insert({
      visitor_id: visitorId,
      first_seen_at: now,
      last_seen_at: now,
      visit_count: 1,
      total_active_ms: Math.max(0, opts.addActiveMs ?? 0),
      feedback_status: opts.feedbackStatus ?? "pending",
      updated_at: now,
    });
    if (error) throw new ApiError(500, error.message);
    return { visit_count: 1, is_returning: false, feedback_status: opts.feedbackStatus ?? "pending" };
  }

  const visitCount = opts.bumpVisit ? Number(existing.visit_count) + 1 : Number(existing.visit_count);
  const totalActive = Number(existing.total_active_ms) + Math.max(0, opts.addActiveMs ?? 0);
  // Never downgrade terminal feedback statuses from heartbeats
  let nextStatus = existing.feedback_status as FeedbackStatus;
  if (opts.feedbackStatus) {
    if (existing.feedback_status === "submitted" || existing.feedback_status === "dismissed") {
      nextStatus = existing.feedback_status as FeedbackStatus;
    } else {
      nextStatus = opts.feedbackStatus;
    }
  }

  const { error } = await supabase
    .from("games311_visitors")
    .update({
      last_seen_at: now,
      visit_count: visitCount,
      total_active_ms: totalActive,
      feedback_status: nextStatus,
      updated_at: now,
    })
    .eq("visitor_id", visitorId);
  if (error) throw new ApiError(500, error.message);

  return {
    visit_count: visitCount,
    is_returning: visitCount > 1,
    feedback_status: nextStatus,
  };
}
