import Link from "next/link";
import { redirect } from "next/navigation";
import { getCareHomeDisplayName } from "@/lib/data/entities";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import { ViewAsBanner } from "@/components/view-as-banner";
import { TelefeetCallRoom } from "./call-room";

type SearchParams = { viewAs?: string; patient?: string };

export default async function TelefeetCallPage({
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
  const patientName =
    typeof searchParams.patient === "string" && searchParams.patient.length > 0
      ? searchParams.patient
      : null;
  const isCompanyView =
    role === "company" && typeof viewAs === "string" && viewAs.length > 0;

  let bannerLabel: string | null = null;
  if (isCompanyView && viewAs) {
    bannerLabel = await getCareHomeDisplayName(viewAs);
  }

  const backParams = new URLSearchParams();
  if (isCompanyView && viewAs) backParams.set("viewAs", viewAs);
  if (patientName) backParams.set("patient", patientName);
  const backHref = backParams.toString()
    ? `/client/dashboard?${backParams.toString()}`
    : "/client/dashboard";

  return (
    <div className="min-h-screen bg-black text-white">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner entityLabel={bannerLabel} exitHref="/company/dashboard" />
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link
                href={backHref}
                className="text-sm font-medium text-[#d4af37] underline-offset-4 transition hover:text-[#e8c766] hover:underline"
              >
                ← Back to dashboard
              </Link>
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-white/55">
                Client portal
              </p>
              <h1 className="text-2xl font-semibold text-white">TeleFeet call</h1>
              <p className="mt-2 text-sm text-white/65">
                Secure video room for live telehealth sessions.
              </p>
            </div>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        <TelefeetCallRoom />
      </div>
    </div>
  );
}
