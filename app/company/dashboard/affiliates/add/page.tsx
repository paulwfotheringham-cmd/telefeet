import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";

export default async function AddAffiliatePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/company/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role as PortalRole | undefined;
  if (role !== "company") redirect("/company/login");

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link
                href="/company/dashboard/affiliates"
                className="text-sm font-medium text-brand-gold underline-offset-4 transition hover:text-brand-goldHi hover:underline"
              >
                ← Back to affiliates
              </Link>
              <h1 className="mt-3 text-2xl font-semibold">Add affiliate</h1>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <section className="rounded-2xl border border-brand-line bg-brand-surface p-6 ring-1 ring-brand-gold/10">
          <p className="text-sm text-brand-muted">
            Affiliate creation form coming next. This page is ready to be wired
            to your add-affiliate workflow.
          </p>
        </section>
      </div>
    </div>
  );
}
