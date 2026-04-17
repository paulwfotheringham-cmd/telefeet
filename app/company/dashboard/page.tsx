import Link from "next/link";
import { redirect } from "next/navigation";
import { TelefeetMark } from "@/components/telefeet-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import {
  listAffiliatesForCompany,
  listCareHomesForCompany,
} from "@/lib/data/company-dashboard";
import type { PortalRole } from "@/lib/types/profile";

export default async function CompanyDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/company/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (role !== "company") {
    redirect("/company/login");
  }

  let careHomes: Awaited<ReturnType<typeof listCareHomesForCompany>> = [];
  let affiliates: Awaited<ReturnType<typeof listAffiliatesForCompany>> = [];

  try {
    careHomes = await listCareHomesForCompany();
  } catch {
    careHomes = [];
  }

  try {
    affiliates = await listAffiliatesForCompany();
  } catch {
    affiliates = [];
  }

  const displayName = profile?.full_name?.trim() || "Team member";
  const companyTiles = [
    "Patient database",
    "Scheduled appointments",
    "Outstanding Tasks",
  ] as const;

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Company portal
            </p>
            <h1 className="text-3xl font-semibold text-brand-cream">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-sm text-brand-cream/75">
              Jump into a care home or affiliate experience to see exactly what
              they see.
            </p>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <section aria-label="Company quick actions">
          <h2 className="sr-only">Company quick actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {companyTiles.map((title, index) => {
              const tileClass =
                "group relative overflow-hidden rounded-2xl border border-brand-line bg-brand-panel text-inherit shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-brand-gold/10 transition hover:border-brand-gold/45 hover:shadow-card";
              const tileLabel = (
                <div className="relative z-10 flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 py-5 text-center">
                  <span className="font-mono text-[10px] text-brand-gold/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold leading-snug text-brand-cream">
                    {title}
                  </p>
                </div>
              );

              if (title === "Scheduled appointments") {
                return (
                  <Link
                    key={title}
                    href="/company/dashboard/scheduled-appointments"
                    className={`${tileClass} no-underline`}
                  >
                    {tileLabel}
                  </Link>
                );
              }

              return (
                <div key={title} className={tileClass}>
                  {tileLabel}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="flex flex-col rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-card ring-1 ring-brand-gold/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-brand-cream">Clients</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Care homes using TeleFeet in their units.
                </p>
              </div>
              <span className="rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-goldHi">
                {careHomes.length} accounts
              </span>
            </div>
            <ul className="mt-6 space-y-2">
              {careHomes.length === 0 ? (
                <li className="rounded-lg bg-brand-panel px-3 py-4 text-sm text-brand-muted">
                  No care homes found yet. Add client profiles with a{" "}
                  <code className="rounded bg-brand-ink px-1 text-brand-cream">
                    care_home_id
                  </code>{" "}
                  in Supabase.
                </li>
              ) : (
                careHomes.map((home) => (
                  <li key={home.id}>
                    <Link
                      href={`/client/dashboard?viewAs=${encodeURIComponent(home.id)}`}
                      className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-panel px-4 py-3 text-sm font-medium text-brand-cream transition hover:border-brand-gold/45 hover:bg-brand-surface"
                    >
                      <span>{home.label}</span>
                      <span className="text-xs font-normal text-brand-muted">
                        {home.nurseCount} nurse{home.nurseCount === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="flex flex-col rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-card ring-1 ring-brand-gold/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-brand-cream">
                  Affiliates
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Partner podiatrists in the Footworx network.
                </p>
              </div>
              <span className="rounded-full border border-brand-goldLo/40 bg-brand-goldLo/15 px-3 py-1 text-xs font-semibold text-brand-goldHi">
                {affiliates.length} partners
              </span>
            </div>
            <ul className="mt-6 space-y-2">
              {affiliates.length === 0 ? (
                <li className="rounded-lg bg-brand-panel px-3 py-4 text-sm text-brand-muted">
                  No affiliates found yet. Add affiliate profiles with an{" "}
                  <code className="rounded bg-brand-ink px-1 text-brand-cream">
                    affiliate_id
                  </code>{" "}
                  in Supabase.
                </li>
              ) : (
                affiliates.map((aff) => (
                  <li key={aff.id}>
                    <Link
                      href={`/affiliate/dashboard?viewAs=${encodeURIComponent(aff.id)}`}
                      className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-panel px-4 py-3 text-sm font-medium text-brand-cream transition hover:border-brand-gold/45 hover:bg-brand-surface"
                    >
                      <span>{aff.label}</span>
                      <span className="text-xs font-normal text-brand-muted">
                        {aff.memberCount} seat{aff.memberCount === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
