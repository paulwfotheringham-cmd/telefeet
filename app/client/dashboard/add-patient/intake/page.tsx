import Link from "next/link";
import { redirect } from "next/navigation";
import { TelefeetMark } from "@/components/telefeet-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { ViewAsBanner } from "@/components/view-as-banner";
import { createClient } from "@/lib/supabase/server";
import { getCareHomeDisplayName } from "@/lib/data/entities";
import type { PortalRole } from "@/lib/types/profile";
import { AddPatientIntakeChat } from "./add-patient-intake-chat";

type SearchParams = { viewAs?: string };

export default async function AddPatientIntakePage({
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
    .select("role, full_name, care_home_id")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (!role) {
    redirect("/client/login");
  }

  const viewAs = searchParams.viewAs;
  const isCompanyView =
    role === "company" && typeof viewAs === "string" && viewAs.length > 0;

  let bannerLabel: string | null = null;
  if (isCompanyView && viewAs) {
    bannerLabel = await getCareHomeDisplayName(viewAs);
  }

  const canUseIntake =
    role === "client"
      ? Boolean(profile?.care_home_id)
      : isCompanyView && Boolean(viewAs);

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner
          entityLabel={bannerLabel}
          exitHref="/company/dashboard"
        />
      ) : null}

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link
                href={
                  isCompanyView && viewAs
                    ? `/client/dashboard?viewAs=${encodeURIComponent(viewAs)}`
                    : "/client/dashboard"
                }
                className="text-sm font-medium text-brand-gold underline-offset-4 transition hover:text-brand-goldHi hover:underline"
              >
                ← Back to dashboard
              </Link>
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-brand-muted">
                Client portal
              </p>
              <h1 className="text-2xl font-semibold text-brand-cream">
                Add patient — guided intake
              </h1>
              <p className="mt-2 max-w-xl text-sm text-brand-cream/75">
                Work through the assistant questions; your replies appear in the
                thread as you go. Nothing is saved until you press{" "}
                <span className="font-medium text-brand-gold">Save patient</span>{" "}
                at the end.
              </p>
            </div>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        {canUseIntake ? (
          <AddPatientIntakeChat
            viewAsCareHomeId={isCompanyView && viewAs ? viewAs : null}
          />
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-amber-700/40 bg-amber-950/35 px-5 py-4 text-sm text-amber-100">
            Your account is not linked to a care home, so you cannot add
            patients yet. Ask your TeleFeet administrator to set{" "}
            <code className="rounded bg-brand-ink/80 px-1 text-brand-cream">
              care_home_id
            </code>{" "}
            on your profile in Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
