import Link from "next/link";
import { ResultsLogoutButton } from "@/components/games311/results-logout-button";

const NAV = [
  { href: "/results", label: "Overview" },
  { href: "/results/visitors", label: "Visitors" },
  { href: "/results/games", label: "Games" },
  { href: "/results/comments", label: "Comments" },
];

export function ResultsShell({
  active,
  children,
}: {
  active: "overview" | "visitors" | "games" | "comments";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Games311</p>
            <h1 className="text-lg font-semibold">Analytics</h1>
          </div>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => {
              const isActive =
                (active === "overview" && item.href === "/results") ||
                (active !== "overview" && item.href.endsWith(active));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isActive ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ResultsLogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition hover:ring-2 hover:ring-violet-300">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function BarChart({
  title,
  points,
}: {
  title: string;
  points: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {points.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No data yet</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {points.map((p) => (
            <li key={p.label} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-sm">
              <span className="truncate text-slate-600">{p.label}</span>
              <div className="h-2 rounded bg-slate-100">
                <div
                  className="h-2 rounded bg-violet-500"
                  style={{ width: `${(p.value / max) * 100}%` }}
                />
              </div>
              <span className="text-right tabular-nums text-slate-800">{p.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
