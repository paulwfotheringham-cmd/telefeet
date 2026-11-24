import { NextResponse } from "next/server";
import { movieStoreMode } from "@/lib/name-that-star/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = movieStoreMode();
  return NextResponse.json({
    ok: true,
    store,
    hint:
      store === "memory"
        ? "Name That Movie is using this server's memory. Set SUPABASE_SERVICE_ROLE_KEY so two players can share a room in production."
        : "Name That Movie rooms are stored in Supabase.",
  });
}
