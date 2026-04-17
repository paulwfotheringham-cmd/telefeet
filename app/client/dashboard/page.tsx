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

  return (
    <div className="min-h-screen bg-brand-light">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner
          entityLabel={bannerLabel}
          exitHref="/company/dashboard"
        />
      ) : null}

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-dark/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-dark/60">
              Client portal
            </p>
            <h1 className="text-3xl font-semibold text-brand-dark">
              Hello, {displayName}
            </h1>
            <p className="mt-2 text-lg text-brand-dark/80">
              This is where nurse workflows will live — appointments, notes, and
              telehealth visits.
            </p>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-dark/5">
          <h2 className="text-xl font-semibold text-brand-dark">Today</h2>
          <p className="text-brand-dark/80">
            Dashboard content will appear here as features are enabled.
          </p>
          {!isCompanyView ? (
            <Link
              href="/client/login"
              className="text-brand-primary underline-offset-4 hover:underline"
            >
              Need help signing in?
            </Link>
          ) : null}
        </section>
      </div>
    </div>
  );
}
