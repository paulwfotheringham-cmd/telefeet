import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";
import { SignOutButton } from "@/components/sign-out-button";
import { TelefeetMark } from "@/components/telefeet-mark";

const affiliateTiles = [
  {
    title: "Search affiliate",
    href: "/company/dashboard/affiliates/search",
    description: "Find and open an affiliate profile.",
  },
  {
    title: "Add affiliate",
    href: "/company/dashboard/affiliates/add",
    description: "Create a new affiliate organisation profile.",
  },
] as const;

export default async function CompanyAffiliatesPage() {
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
                Affiliates
              </p>
              <h1 className="text-2xl font-semibold">Affiliate management</h1>
            </div>
          </div>
          <SignOutButton redirectPortal="company" />
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {affiliateTiles.map((tile, index) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative overflow-hidden rounded-2xl border border-brand-line bg-brand-panel text-inherit ring-1 ring-brand-gold/10 transition hover:border-brand-gold/45 hover:shadow-card"
            >
              <div className="relative z-10 flex min-h-[150px] flex-col justify-center gap-2 px-6 py-5">
                <span className="font-mono text-[10px] text-brand-gold/55">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-semibold text-brand-cream">
                  {tile.title}
                </h2>
                <p className="text-sm text-brand-muted">{tile.description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
