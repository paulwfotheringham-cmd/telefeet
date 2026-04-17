import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { ViewAsBanner } from "@/components/view-as-banner";
import { createClient } from "@/lib/supabase/server";
import { getAffiliateDisplayName, getCareHomeDisplayName } from "@/lib/data/entities";
import type { PortalRole } from "@/lib/types/profile";

type SearchParams = { viewAs?: string };

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/client/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (!role) {
    redirect("/client/login");
  }

  const viewAs = searchParams.viewAs;
  const isCompanyView =
    role === "company" && typeof viewAs === "string" && viewAs.length > 0;

  if (role === "company" && !isCompanyView) {
    redirect("/company/dashboard");
  }

  let bannerLabel: string | null = null;
  if (isCompanyView && viewAs) {
    bannerLabel = await getCareHomeDisplayName(viewAs);
  }

  const displayName =
    profile?.full_name?.trim() ||
    (isCompanyView ? "TeleFeet staff" : "Care home team member");

  const dashboardTiles = [
    "Select Patient",
    "Add Patient",
    "View all scheduled appointments",
    "Profile",
    "Outstanding tasks",
  ] as const;

  return (
    <div className="min-h-screen bg-brand-light">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner
          entityLabel={bannerLabel}
          exitHref="/company/dashboard"
        />
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-dark/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-dark/60">
              Client portal
            </p>
            <h1 className="text-3xl font-semibold text-brand-dark">
              Hello, {displayName}
            </h1>
            <p className="mt-2 text-lg text-brand-dark/80">
              Appointments, notes, and telehealth visits from one place.
            </p>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        <section aria-label="Dashboard shortcuts">
          <h2 className="sr-only">Quick actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {dashboardTiles.map((title) => (
              <div
                key={title}
                className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-brand-dark/10 bg-white px-3 py-5 text-center shadow-sm ring-1 ring-brand-dark/5 transition hover:border-brand-primary/35 hover:shadow-md"
              >
                <p className="text-sm font-semibold leading-snug text-brand-dark">
                  {title}
                </p>
              </div>
            ))}
          </div>
          {!isCompanyView ? (
            <p className="mt-6 text-center text-sm text-brand-dark/65">
              <Link
                href="/client/login"
                className="text-brand-primary underline-offset-4 hover:underline"
              >
                Need help signing in?
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
