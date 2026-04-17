import Link from "next/link";

type Props = {
  entityLabel: string;
  exitHref: string;
};

export function ViewAsBanner({ entityLabel, exitHref }: Props) {
  return (
    <div className="border-b border-brand-secondary/40 bg-brand-secondary/25 px-4 py-3 text-center text-brand-dark">
      <p className="text-base font-semibold md:text-lg">
        Viewing as: {entityLabel}{" "}
        <span className="text-brand-dark/60">—</span>{" "}
        <Link
          href={exitHref}
          className="text-brand-primary underline decoration-2 underline-offset-4 hover:text-brand-dark"
        >
          Exit View
        </Link>
      </p>
    </div>
  );
}
