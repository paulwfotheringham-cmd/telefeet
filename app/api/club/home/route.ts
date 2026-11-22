import { NextResponse } from "next/server";
import { bearerToken, clubHome } from "@/lib/funquiz/club";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await clubHome(bearerToken(request));
  if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
