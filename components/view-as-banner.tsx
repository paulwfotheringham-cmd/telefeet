import Link from "next/link";

type Props = {
  entityLabel: string;
  exitHref: string;
};

export function ViewAsBanner({ entityLabel, exitHref }: Props) {
  return (
    <div className="border-b border-brand-gold/25 bg-gradient-to-r from-brand-gold/10 via-brand-gold/5 to-brand-gold/10 px-4 py-3.5 text-center text-brand-cream">
      <p className="text-sm font-medium tracking-wide md:text-base">
        <span className="text-brand-muted">Viewing as</span>{" "}
        <span className="font-semibold text-brand-goldHi">{entityLabel}</span>
        <span className="text-brand-muted"> · </span>
        <Link
          href={exitHref}
          className="font-semibold text-brand-gold underline decoration-brand-gold/50 underline-offset-4 transition hover:text-brand-goldHi"
        >
          Exit view
        </Link>
      </p>
    </div>
  );
}
