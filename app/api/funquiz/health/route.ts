import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkSupabaseHostReachable } from "@/lib/funquiz/supabase-host-check";
import { isQuizStoreConfigured, quizStoreMode } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = quizStoreMode();
  if (!isQuizStoreConfigured()) {
    return NextResponse.json({ ok: false, store: mode, db: "missing_env" });
  }

  const hostCheck = await checkSupabaseHostReachable(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!hostCheck.ok) {
    return NextResponse.json({
      ok: false,
      store: mode,
      db: "unreachable",
      projectRef: hostCheck.ref,
      hint: hostCheck.reason,
    });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("funquiz_rooms").select("code").limit(1);
    if (error) {
      const needsMigration =
        error.message.includes("funquiz_rooms") &&
        (error.message.includes("does not exist") || error.code === "42P01");
      return NextResponse.json({
        ok: false,
        store: mode,
        db: needsMigration ? "migration_required" : "error",
        projectRef: hostCheck.ref,
        hint: error.message,
      });
    }
    return NextResponse.json({ ok: true, store: mode, db: "ready", projectRef: hostCheck.ref });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({
      ok: false,
      store: mode,
      db: "client_error",
      projectRef: hostCheck.ref,
      hint: message,
    });
  }
}
