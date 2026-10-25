import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isFunquizMigrationRequired } from "@/lib/funquiz/funquiz-db-health";
import { checkSupabaseHostReachable } from "@/lib/funquiz/supabase-host-check";
import { isQuizStoreConfigured, quizStoreMode } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

function missingFunquizEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  return missing;
}

export async function GET() {
  const mode = quizStoreMode();
  const missingEnv = missingFunquizEnvVars();
  if (!isQuizStoreConfigured()) {
    return NextResponse.json({
      ok: false,
      store: mode,
      db: "missing_env",
      missingEnv,
      hint:
        missingEnv.length === 1 && missingEnv[0] === "SUPABASE_SERVICE_ROLE_KEY"
          ? "Fun Quiz Preview is missing the server key. If Production already works, enable the same existing variables for Preview in Vercel (Environment Variables → Preview scope)."
          : "Fun Quiz Preview is missing Supabase env at runtime. Games 1–3 share one store; Production likely has these set for Production scope only—enable Preview for the same keys, or deploy Game 3 via merge to main.",
    });
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
      const needsMigration = isFunquizMigrationRequired(error);
      return NextResponse.json({
        ok: false,
        store: mode,
        db: needsMigration ? "migration_required" : "error",
        projectRef: hostCheck.ref,
        hint: error.message,
      });
    }
    const { error: rpcError } = await supabase.rpc("funquiz_resolved_players_json", {
      p_room_code: "______",
    });
    return NextResponse.json({
      ok: true,
      store: mode,
      db: "ready",
      projectRef: hostCheck.ref,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      resolvedPlayersRpc: !rpcError,
    });
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
