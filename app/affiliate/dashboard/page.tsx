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

  let bannerLabel: string | null = null;
  if (isCompanyView && viewAs) {
    bannerLabel = await getAffiliateDisplayName(viewAs);
  }

  const displayName =
    profile?.full_name?.trim() ||
    (isCompanyView ? "TeleFeet staff" : "Affiliate clinician");
  const affiliateTiles = [
    { title: "Check calendar", href: "/affiliate/dashboard/calendar" },
    { title: "Check appointments", href: "/affiliate/dashboard/appointments" },
    {
      title: "Outstanding tasks",
      href: "/affiliate/dashboard/outstanding-tasks",
    },
    { title: "Billing", href: "/affiliate/dashboard/billing" },
    { title: "Profile", href: "/affiliate/dashboard/profile" },
  ] as const;

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

        <section aria-label="Affiliate quick actions" className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-cream">
            Practice dashboard
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {affiliateTiles.map((tile, index) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="group relative overflow-hidden rounded-2xl border border-brand-line bg-brand-panel text-inherit shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ring-1 ring-brand-gold/10 transition hover:border-brand-gold/45 hover:shadow-card"
              >
                <div className="relative z-10 flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 py-5 text-center">
                  <span className="font-mono text-[10px] text-brand-gold/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold leading-snug text-brand-cream">
                    {tile.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
