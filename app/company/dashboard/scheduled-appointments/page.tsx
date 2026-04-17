import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import type { PortalRole } from "@/lib/types/profile";
import { ScheduledAppointmentsCalendar } from "@/app/client/dashboard/scheduled-appointments/calendar-view";

type PatientOption = {
  id: string;
  fullName: string;
};

export default async function CompanyScheduledAppointmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/company/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (role !== "company") {
    redirect("/company/login");
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("patients")
    .select("id, full_name")
    .order("full_name", { ascending: true })
    .limit(500);

  const patients: PatientOption[] =
    data?.map((p) => ({ id: p.id as string, fullName: String(p.full_name) })) ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link
                href="/company/dashboard"
                className="text-sm font-medium text-[#d4af37] underline-offset-4 transition hover:text-[#e8c766] hover:underline"
              >
                ← Back to dashboard
              </Link>
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-white/55">
                Company portal
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Scheduled appointments
              </h1>
              <p className="mt-2 text-sm text-white/65">
                Calendar overview across all company patients.
              </p>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <ScheduledAppointmentsCalendar
          patients={patients}
          initialPatientName={null}
        />
      </div>
    </div>
  );
}
