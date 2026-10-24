import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

/** Temporary diagnostics for lobby player reads (remove after join fix verified). */
export async function GET(_request: Request, { params }: Params) {
  const code = params.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }
  const supabase = createAdminClient();
  const rpc = await supabase.rpc("funquiz_list_players", { p_room_code: code });
  const table = await supabase.from("funquiz_players").select("*").eq("room_code", code);
  const counted = await supabase
    .from("funquiz_players")
    .select("*", { count: "exact" })
    .eq("room_code", code);
  return NextResponse.json({
    code,
    rpc: { error: rpc.error?.message ?? null, len: rpc.data?.length ?? 0 },
    table: { error: table.error?.message ?? null, len: table.data?.length ?? 0 },
    counted: {
      error: counted.error?.message ?? null,
      len: counted.data?.length ?? 0,
      count: counted.count,
    },
  });
}
