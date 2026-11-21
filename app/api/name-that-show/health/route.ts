import { NextResponse } from "next/server";
import { showStoreMode } from "@/lib/name-that-show/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = showStoreMode();
  return NextResponse.json({
    ok: true,
    store,
    hint:
      store === "memory"
        ? "Name That Show is using this server's memory. Set SUPABASE_SERVICE_ROLE_KEY so two players can share a room in production."
        : "Name That Show rooms are stored in Supabase.",
  });
}
