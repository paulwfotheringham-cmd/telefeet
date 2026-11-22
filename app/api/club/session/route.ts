import { NextResponse } from "next/server";
import { accountFromToken, bearerToken, login, signup } from "@/lib/funquiz/club";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const account = await accountFromToken(bearerToken(request));
  if (!account) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  return NextResponse.json({ account: { id: account.id, email: account.email, name: account.name } });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string; mode?: string };
  const email = body.email ?? "";
  const password = body.password ?? "";
  const result = body.mode === "signup" ? await signup(email, password) : await login(email, password);
  if (!("token" in result) || !result.token || !result.account) {
    const message = "error" in result ? result.error : "Could not sign in.";
    const status = "status" in result ? result.status : 400;
    return NextResponse.json({ error: message }, { status });
  }
  return NextResponse.json({ token: result.token, account: result.account });
}
