import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import type { PortalRole } from "@/lib/types/profile";

export default async function AffiliateCalendarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/affiliate/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role as PortalRole | undefined;
  if (!role) redirect("/affiliate/login");

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link href="/affiliate/dashboard" className="text-sm text-brand-gold">
                ← Back to dashboard
              </Link>
              <h1 className="mt-3 text-2xl font-semibold">Check calendar</h1>
            </div>
          </div>
          <SignOutButton redirectPortal={role === "company" ? "company" : "affiliate"} />
        </header>
        <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 ring-1 ring-brand-gold/10">
          <p className="text-brand-cream/80">Monthly clinician calendar view (coming next).</p>
        </div>
      </div>
    </div>
  );
}
