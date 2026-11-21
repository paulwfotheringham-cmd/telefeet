import { NextResponse } from "next/server";
import { gameStoreMode } from "@/lib/name-that-game/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = gameStoreMode();
  return NextResponse.json({
    ok: true,
    store,
    hint:
      store === "memory"
        ? "Name That Game is using this server's memory. Set SUPABASE_SERVICE_ROLE_KEY so two players can share a room in production."
        : "Name That Game rooms are stored in Supabase.",
  });
}
