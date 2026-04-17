import Link from "next/link";
import { LoginHeroShell } from "@/components/login-hero-shell";
import { TelefeetLoginLogo } from "@/components/telefeet-login-logo";
import { TelefeetMark } from "@/components/telefeet-mark";

const portals = [
  {
    href: "/client/login",
    title: "Care homes",
    description:
      "Appointments, residents, and telehealth for your units — sign in to the client portal.",
  },
  {
    href: "/company/login",
    title: "Company",
    description:
      "TeleFeet staff: oversight, client accounts, and view-as access for support.",
  },
  {
    href: "/affiliate/login",
    title: "Affiliates",
    description:
      "Footworx partner podiatrists: clinical tools and referrals (rolling out).",
  },
] as const;

export default function Home() {
  return (
    <LoginHeroShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 md:gap-12">
        <header className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="flex w-full max-w-[320px] flex-col items-center gap-5 md:items-start">
            <TelefeetMark className="h-16 w-auto md:h-20" />
            <TelefeetLoginLogo />
          </div>
          <h1 className="mt-1 max-w-xl text-balance text-3xl font-semibold tracking-tight text-brand-cream md:text-4xl">
            Telehealth foot care, built for care homes and clinicians.
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-brand-cream/75">
            TeleFeet by Footworx connects your teams with structured visits and
            clear workflows. Choose your portal to sign in.
          </p>
        </header>

        <nav
          aria-label="Portals"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {portals.map(({ href, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-brand-line bg-brand-surface/90 p-5 text-left shadow-card ring-1 ring-brand-gold/10 transition hover:border-brand-gold/45 hover:ring-brand-gold/20"
            >
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-gold">
                {title}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-brand-cream/85">
                {description}
              </span>
              <span className="mt-4 text-sm font-medium text-brand-gold transition group-hover:text-brand-goldHi">
                Sign in →
              </span>
            </Link>
          ))}
        </nav>

        <p className="text-center text-xs text-brand-muted md:text-left">
          © {new Date().getFullYear()} TeleFeet · Footworx
        </p>
      </div>
    </LoginHeroShell>
  );
}
