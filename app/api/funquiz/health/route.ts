import { NextResponse } from "next/server";
import { isQuizStoreConfigured, quizStoreMode } from "@/lib/funquiz/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = quizStoreMode();
  return NextResponse.json({
    ok: isQuizStoreConfigured(),
    store: mode,
  });
}
