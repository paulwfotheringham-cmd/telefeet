import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isQuizStoreConfigured, quizStoreMode } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = quizStoreMode();
  if (!isQuizStoreConfigured()) {
    return NextResponse.json({ ok: false, store: mode });
  }
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("funquiz_rooms").select("code").limit(1);
    if (error) {
      return NextResponse.json({ ok: false, store: mode, db: "error", hint: error.message });
    }
    return NextResponse.json({ ok: true, store: mode, db: "ready" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok: false, store: mode, db: "unreachable", hint: message });
  }
}
