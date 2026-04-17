import Link from "next/link";
import { redirect } from "next/navigation";
import { TelefeetMark } from "@/components/telefeet-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { ViewAsBanner } from "@/components/view-as-banner";
import { createClient } from "@/lib/supabase/server";
import { getAffiliateDisplayName } from "@/lib/data/entities";
import type { PortalRole } from "@/lib/types/profile";

type SearchParams = { viewAs?: string };

export default async function AffiliateDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/affiliate/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (!role) {
    redirect("/affiliate/login");
  }

  const viewAs = searchParams.viewAs;
  const isCompanyView =
    role === "company" && typeof viewAs === "string" && viewAs.length > 0;

  if (role === "company" && !isCompanyView) {
    redirect("/company/dashboard");
  }

  let bannerLabel: string | null = null;
  if (isCompanyView && viewAs) {
    bannerLabel = await getAffiliateDisplayName(viewAs);
  }

  const displayName =
    profile?.full_name?.trim() ||
    (isCompanyView ? "TeleFeet staff" : "Affiliate clinician");

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner
          entityLabel={bannerLabel}
          exitHref="/company/dashboard"
        />
      ) : null}

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-muted">
              Affiliate portal
            </p>
            <h1 className="text-3xl font-semibold text-brand-cream">
              Hello, {displayName}
            </h1>
            <p className="mt-2 text-lg text-brand-cream/80">
              Referrals, caseload, and telehealth visits will appear here as the
              program rolls out.
            </p>
            </div>
          </div>
          <SignOutButton
            redirectPortal={isCompanyView ? "company" : "affiliate"}
          />
        </header>

        <section className="grid gap-4 rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-card ring-1 ring-brand-gold/10">
          <h2 className="text-xl font-semibold text-brand-cream">
            Practice overview
          </h2>
          <p className="text-brand-cream/80">
            Dashboard modules will be wired to Supabase as workflows are defined.
          </p>
          {!isCompanyView ? (
            <Link
              href="/affiliate/login"
              className="w-fit text-brand-gold underline-offset-4 transition hover:text-brand-goldHi hover:underline"
            >
              Login help
            </Link>
          ) : null}
        </section>
      </div>
    </div>
  );
}
