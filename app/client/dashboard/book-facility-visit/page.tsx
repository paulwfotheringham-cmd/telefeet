import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { ViewAsBanner } from "@/components/view-as-banner";
import { createClient } from "@/lib/supabase/server";
import { getCareHomeDisplayName } from "@/lib/data/entities";
import type { PortalRole } from "@/lib/types/profile";

type SearchParams = { viewAs?: string; patient?: string };

export default async function BookFacilityVisitPage({
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (!role) {
    redirect("/client/login");
  }

  const viewAs = searchParams.viewAs;
  const selectedPatient =
    typeof searchParams.patient === "string" && searchParams.patient.length > 0
      ? searchParams.patient
      : "";
  const isCompanyView =
    role === "company" && typeof viewAs === "string" && viewAs.length > 0;

  let bannerLabel: string | null = null;
  if (isCompanyView && viewAs) {
    bannerLabel = await getCareHomeDisplayName(viewAs);
  }

  const queryParams = new URLSearchParams();
  if (isCompanyView && viewAs) queryParams.set("viewAs", viewAs);
  if (selectedPatient) queryParams.set("patient", selectedPatient);
  const querySuffix = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";
  const backHref = `/client/dashboard${querySuffix}`;

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner entityLabel={bannerLabel} exitHref="/company/dashboard" />
      ) : null}
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 md:flex-row md:items-center">
          <div>
            <Link
              href={backHref}
              className="text-sm font-medium text-brand-gold underline-offset-4 transition hover:text-brand-goldHi hover:underline"
            >
              ← Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-brand-cream">
              Book a visit to my facility
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              Create an on-site podiatry visit request for your care home.
            </p>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        <section className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-card ring-1 ring-brand-gold/10">
          <form className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-brand-muted">
              Preferred date
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>
            <label className="text-sm text-brand-muted">
              Preferred time window
              <input
                type="text"
                placeholder="e.g. 09:00 - 12:00"
                className="mt-1 w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>
            <label className="text-sm text-brand-muted md:col-span-2">
              Visit notes
              <textarea
                rows={4}
                placeholder="Add details, access notes, or priority patients."
                className="mt-1 w-full rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="button"
                className="rounded-full border border-brand-gold/50 bg-brand-gold/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-goldHi transition hover:border-brand-gold hover:bg-brand-gold/20"
              >
                Submit visit request (coming next)
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
