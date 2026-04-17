import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";
import {
  AFFILIATE_COMPANY_OPTIONS,
  type AffiliateProfileMock,
} from "@/lib/mock/affiliate-profiles";

export default async function AffiliateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
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

  const item: AffiliateProfileMock | undefined = AFFILIATE_COMPANY_OPTIONS.find(
    (x) => x.slug === params.slug,
  );
  if (!item) notFound();

  return (
    <div className="min-h-screen bg-brand-ink text-brand-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
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
                Affiliate detail
              </p>
              <h1 className="text-2xl font-semibold">{item.name}</h1>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 ring-1 ring-brand-gold/10">
            <h2 className="text-lg font-semibold">Profile</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-brand-muted">Name</dt>
                <dd>{item.name}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Organisation</dt>
                <dd>{item.organisation}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Location</dt>
                <dd>{item.location}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Address</dt>
                <dd>{item.address}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 ring-1 ring-brand-gold/10">
            <h2 className="text-lg font-semibold">Patients they work with</h2>
            <ul className="mt-4 space-y-2">
              {item.patientsTheyWorkWith.map((name) => (
                <li
                  key={name}
                  className="rounded-lg border border-brand-line bg-brand-panel px-3 py-2 text-sm"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
