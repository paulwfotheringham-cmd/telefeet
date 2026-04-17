import Link from "next/link";
import { redirect } from "next/navigation";
import { TelefeetLoginLogo } from "@/components/telefeet-login-logo";
import { TelefeetMark } from "@/components/telefeet-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { ViewAsBanner } from "@/components/view-as-banner";
import { createClient } from "@/lib/supabase/server";
import { getCareHomeDisplayName } from "@/lib/data/entities";
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

  const addPatientHref =
    isCompanyView && viewAs
      ? `/client/dashboard/add-patient/intake?viewAs=${encodeURIComponent(viewAs)}`
      : "/client/dashboard/add-patient/intake";

  const signOutClass =
    "rounded-full border border-[#d4af37]/50 bg-black/60 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_20px_-4px_rgba(212,175,55,0.35)] backdrop-blur-sm transition hover:border-[#e8c766] hover:text-[#e8c766]";

  return (
    <div className="relative min-h-screen bg-black text-white antialiased">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(212,175,55,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(212,175,55,0.08),transparent_40%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,rgba(0,0,0,0.65)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:56px_56px]"
        aria-hidden
      />

      {isCompanyView && bannerLabel ? (
        <ViewAsBanner
          entityLabel={bannerLabel}
          exitHref="/company/dashboard"
        />
      ) : null}

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-5 py-12 sm:px-8 sm:py-14">
        <header className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent px-6 py-8 shadow-[0_0_0_1px_rgba(212,175,55,0.12),0_32px_64px_-24px_rgba(0,0,0,0.9)] sm:px-10 sm:py-10">
          <div
            className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent sm:inset-x-12"
            aria-hidden
          />
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:gap-8 sm:border-b-0 sm:pb-0">
                <div className="relative shrink-0 rounded-2xl border border-[#d4af37]/30 bg-black/40 p-3 ring-1 ring-[#d4af37]/15">
                  <TelefeetMark className="h-14 w-auto opacity-100 sm:h-16" />
                </div>
                <div className="min-w-0 flex-1">
                  <TelefeetLoginLogo variant="inline" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
                  Client portal
                </p>
                <h1 className="text-balance text-3xl font-light tracking-tight text-white sm:text-4xl md:text-[2.5rem] md:leading-tight">
                  Hello,{" "}
                  <span className="font-medium text-[#f5f0e6]">{displayName}</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-white/65">
                  Appointments, clinical notes, and telehealth — one private
                  workspace for your care home.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 md:pt-2">
              <SignOutButton
                redirectPortal={isCompanyView ? "company" : "client"}
                className={signOutClass}
              />
            </div>
          </div>
        </header>

        <section aria-label="Dashboard shortcuts" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
                Quick actions
              </p>
              <h2 className="mt-1 text-lg font-light text-white/90">
                Choose a module
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {dashboardTiles.map((title, index) => {
              const num = String(index + 1).padStart(2, "0");
              const label = (
                <div className="relative z-10 flex min-h-[132px] flex-col items-center justify-center gap-3 px-4 py-6 text-center">
                  <span className="font-mono text-[10px] text-[#d4af37]/50">
                    {num}
                  </span>
                  <p className="text-sm font-medium leading-snug tracking-wide text-white">
                    {title}
                  </p>
                </div>
              );
              const tileClass =
                "group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0a] text-inherit shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-[#d4af37]/[0.07] before:to-transparent before:opacity-0 before:transition before:duration-300 hover:border-[#d4af37]/45 hover:before:opacity-100 hover:shadow-[0_0_40px_-12px_rgba(212,175,55,0.25)]";

              if (title === "Add Patient") {
                return (
                  <Link
                    key={title}
                    href={addPatientHref}
                    className={`${tileClass} no-underline`}
                  >
                    {label}
                  </Link>
                );
              }

              return (
                <div key={title} className={tileClass}>
                  {label}
                </div>
              );
            })}
          </div>

          {!isCompanyView ? (
            <p className="text-center text-sm text-white/45">
              <Link
                href="/client/login"
                className="text-[#d4af37] underline-offset-4 transition hover:text-[#e8c766] hover:underline"
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
