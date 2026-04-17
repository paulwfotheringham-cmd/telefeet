import Link from "next/link";
import { redirect } from "next/navigation";
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

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-dark/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/60">
              Company portal
            </p>
            <h1 className="text-3xl font-semibold text-brand-dark">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-sm text-brand-dark/75">
              Jump into a care home or affiliate experience to see exactly what
              they see.
            </p>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-dark/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-brand-dark">Clients</h2>
                <p className="mt-1 text-sm text-brand-dark/70">
                  Care homes using TeleFeet in their units.
                </p>
              </div>
              <span className="rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold text-brand-dark">
                {careHomes.length} accounts
              </span>
            </div>
            <ul className="mt-6 space-y-2">
              {careHomes.length === 0 ? (
                <li className="rounded-lg bg-brand-light px-3 py-4 text-sm text-brand-dark/70">
                  No care homes found yet. Add client profiles with a{" "}
                  <code className="rounded bg-white px-1">care_home_id</code> in
                  Supabase.
                </li>
              ) : (
                careHomes.map((home) => (
                  <li key={home.id}>
                    <Link
                      href={`/client/dashboard?viewAs=${encodeURIComponent(home.id)}`}
                      className="flex items-center justify-between rounded-xl border border-brand-dark/10 bg-brand-light px-4 py-3 text-sm font-medium text-brand-dark transition hover:border-brand-primary hover:bg-white"
                    >
                      <span>{home.label}</span>
                      <span className="text-xs font-normal text-brand-dark/60">
                        {home.nurseCount} nurse{home.nurseCount === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-dark/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-brand-dark">
                  Affiliates
                </h2>
                <p className="mt-1 text-sm text-brand-dark/70">
                  Partner podiatrists in the Footworx network.
                </p>
              </div>
              <span className="rounded-full bg-brand-secondary/30 px-3 py-1 text-xs font-semibold text-brand-dark">
                {affiliates.length} partners
              </span>
            </div>
            <ul className="mt-6 space-y-2">
              {affiliates.length === 0 ? (
                <li className="rounded-lg bg-brand-light px-3 py-4 text-sm text-brand-dark/70">
                  No affiliates found yet. Add affiliate profiles with an{" "}
                  <code className="rounded bg-white px-1">affiliate_id</code> in
                  Supabase.
                </li>
              ) : (
                affiliates.map((aff) => (
                  <li key={aff.id}>
                    <Link
                      href={`/affiliate/dashboard?viewAs=${encodeURIComponent(aff.id)}`}
                      className="flex items-center justify-between rounded-xl border border-brand-dark/10 bg-brand-light px-4 py-3 text-sm font-medium text-brand-dark transition hover:border-brand-primary hover:bg-white"
                    >
                      <span>{aff.label}</span>
                      <span className="text-xs font-normal text-brand-dark/60">
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
