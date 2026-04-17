import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import type { PortalRole } from "@/lib/types/profile";
import { PatientDatabaseView, type PatientRow } from "./patient-database-view";

type IntakeShape = {
  demographics?: {
    dateOfBirth?: string;
    gender?: string;
    address?: string;
  };
  clinical?: {
    medicalConditions?: string;
    chiefComplaint?: string;
  };
};

export default async function CompanyPatientDatabasePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/company/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role as PortalRole | undefined;
  if (role !== "company") redirect("/company/login");

  const admin = createAdminClient();
  const { data } = await admin
    .from("patients")
    .select("id, full_name, intake_json")
    .order("created_at", { ascending: false })
    .limit(500);

  const patients: PatientRow[] =
    data?.map((row) => {
      const intake = (row.intake_json ?? {}) as IntakeShape;
      return {
        id: String(row.id),
        fullName: String(row.full_name ?? ""),
        dateOfBirth: intake.demographics?.dateOfBirth ?? "",
        gender: intake.demographics?.gender ?? "",
        chiefComplaint: intake.clinical?.chiefComplaint ?? "",
        medicalConditions: intake.clinical?.medicalConditions ?? "",
        location: intake.demographics?.address ?? "",
      };
    }) ?? [];

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col justify-between gap-4 border-b border-brand-line pb-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <TelefeetMark className="h-11 w-auto shrink-0 opacity-95" />
            <div>
              <Link
                href="/company/dashboard"
                className="text-sm font-medium text-brand-gold underline-offset-4 transition hover:text-brand-goldHi hover:underline"
              >
                ← Back to dashboard
              </Link>
              <p className="mt-3 text-sm font-medium uppercase tracking-wide text-brand-muted">
                Company portal
              </p>
              <h1 className="text-2xl font-semibold">Patient database</h1>
              <p className="mt-2 text-sm text-brand-cream/75">
                Search and filter patient intake records collected from the client AI intake flow.
              </p>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <PatientDatabaseView patients={patients} />
      </div>
    </div>
  );
}
