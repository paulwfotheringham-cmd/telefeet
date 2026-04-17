import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCareHomeDisplayName } from "@/lib/data/entities";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import { ViewAsBanner } from "@/components/view-as-banner";
import { ScheduledAppointmentsCalendar } from "./calendar-view";

type SearchParams = { viewAs?: string; patient?: string };

type PatientOption = {
  id: string;
  fullName: string;
};

export default async function ScheduledAppointmentsPage({
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
    .select("role, care_home_id")
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

  if (role === "company" && !isCompanyView) {
    redirect("/company/dashboard");
  }

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

  let patients: PatientOption[] = [];
  if (role === "client") {
    const { data } = await supabase
      .from("patients")
      .select("id, full_name")
      .order("full_name", { ascending: true });
    patients =
      data?.map((p) => ({ id: p.id as string, fullName: String(p.full_name) })) ?? [];
  } else if (role === "company" && viewAs) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("patients")
      .select("id, full_name")
      .eq("care_home_id", viewAs)
      .order("full_name", { ascending: true });
    patients =
      data?.map((p) => ({ id: p.id as string, fullName: String(p.full_name) })) ?? [];
  }

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
              <h1 className="text-2xl font-semibold text-white">
                Scheduled appointments
              </h1>
              <p className="mt-2 text-sm text-white/65">
                Calendar view by day with patient and month filtering.
              </p>
            </div>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        <ScheduledAppointmentsCalendar
          patients={patients}
          initialPatientName={patientName}
        />
      </div>
    </div>
  );
}
