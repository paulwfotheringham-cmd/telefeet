import { NextResponse } from "next/server";
import { tuneStoreMode } from "@/lib/name-that-tune/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = tuneStoreMode();
  return NextResponse.json({
    ok: true,
    store,
    hint:
      store === "memory"
        ? "Name That Tune is using this server's memory. Set SUPABASE_SERVICE_ROLE_KEY so two players can share a room in production."
        : "Name That Tune rooms are stored in Supabase.",
  });
}
