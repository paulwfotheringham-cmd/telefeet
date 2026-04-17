import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listAffiliatesForCompany, listCareHomesForCompany } from "@/lib/data/company-dashboard";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import type { PortalRole } from "@/lib/types/profile";

function FakeBars({
  values,
  colorClass,
}: {
  values: number[];
  colorClass: string;
}) {
  return (
    <div className="mt-4 flex h-40 items-end gap-2">
      {values.map((v, idx) => (
        <div key={`${idx}-${v}`} className="flex flex-1 items-end">
          <div
            className={`w-full rounded-t-md ${colorClass}`}
            style={{ height: `${v}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export default async function CompanyReportingPage() {
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

  const [clients, affiliates] = await Promise.all([
    listCareHomesForCompany(),
    listAffiliatesForCompany(),
  ]);

  const revenueMonth = clients.length * 1450 + 8200;

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link
                href="/company/dashboard"
                className="text-sm font-medium text-brand-gold underline-offset-4 transition hover:text-brand-goldHi hover:underline"
              >
                ← Back to dashboard
              </Link>
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-brand-muted">
                Company portal
              </p>
              <h1 className="text-2xl font-semibold">Reporting</h1>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5 ring-1 ring-brand-gold/10">
            <p className="text-xs uppercase tracking-wide text-brand-muted">Number of clients</p>
            <p className="mt-2 text-3xl font-semibold text-brand-cream">{clients.length}</p>
          </div>
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5 ring-1 ring-brand-gold/10">
            <p className="text-xs uppercase tracking-wide text-brand-muted">Number of affiliates</p>
            <p className="mt-2 text-3xl font-semibold text-brand-cream">{affiliates.length}</p>
          </div>
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5 ring-1 ring-brand-gold/10">
            <p className="text-xs uppercase tracking-wide text-brand-muted">Revenue this month</p>
            <p className="mt-2 text-3xl font-semibold text-brand-gold">
              ${revenueMonth.toLocaleString()}
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5 ring-1 ring-brand-gold/10">
            <h2 className="text-lg font-semibold">Commission paid to affiliates (calls)</h2>
            <p className="mt-1 text-sm text-brand-muted">Mock monthly values</p>
            <FakeBars
              values={[42, 55, 48, 66, 58, 71, 63, 74, 69, 78, 72, 84]}
              colorClass="bg-brand-gold/70"
            />
          </div>
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5 ring-1 ring-brand-gold/10">
            <h2 className="text-lg font-semibold">Commission from referrals to affiliates</h2>
            <p className="mt-1 text-sm text-brand-muted">Mock monthly values</p>
            <FakeBars
              values={[25, 31, 28, 36, 33, 41, 38, 44, 42, 47, 45, 53]}
              colorClass="bg-brand-goldHi/80"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
