import { NextResponse } from "next/server";
import { addLink, bearerToken, listLinks } from "@/lib/funquiz/club";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  const result = await listLinks(bearerToken(request), kind);
  if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { kind?: string; name?: string; url?: string; description?: string };
  const result = await addLink(bearerToken(request), body);
  if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
