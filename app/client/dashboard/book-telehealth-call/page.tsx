import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCareHomeDisplayName } from "@/lib/data/entities";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import { ViewAsBanner } from "@/components/view-as-banner";

type SearchParams = { viewAs?: string; patient?: string };

type PatientOption = {
  id: string;
  fullName: string;
};

export default async function BookTelehealthCallPage({
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
      data?.map((p) => ({ id: p.id as string, fullName: String(p.full_name) })) ??
      [];
  } else if (role === "company" && viewAs) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("patients")
      .select("id, full_name")
      .eq("care_home_id", viewAs)
      .order("full_name", { ascending: true });
    patients =
      data?.map((p) => ({ id: p.id as string, fullName: String(p.full_name) })) ??
      [];
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {isCompanyView && bannerLabel ? (
        <ViewAsBanner entityLabel={bannerLabel} exitHref="/company/dashboard" />
      ) : null}

      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
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
                Book new telehealth call
              </h1>
              <p className="mt-2 text-sm text-white/65">
                Select a patient and preferred slot. Booking workflow can be
                connected to your calendar provider next.
              </p>
            </div>
          </div>
          <SignOutButton redirectPortal={isCompanyView ? "company" : "client"} />
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 ring-1 ring-[#d4af37]/10 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
              Patient
              <select className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20">
                <option value="">Choose patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
              Preferred date
              <input
                type="date"
                className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
              Preferred time
              <input
                type="time"
                className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
              Telehealth clinician
              <input
                type="text"
                placeholder="e.g. Podiatry team"
                className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white transition hover:border-[#d4af37]/45 hover:bg-white/[0.04]"
            >
              Cancel
            </Link>
            <button
              type="button"
              className="rounded-xl border border-[#d4af37]/60 bg-gradient-to-b from-[#e8c766] to-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_14px_28px_-10px_rgba(212,175,55,0.45)] transition hover:from-[#d4af37] hover:to-[#e8c766]"
            >
              Save booking (coming next)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
