"use client";

export function ResultsLogoutButton() {
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      onClick={() => {
        void fetch("/api/games311/results/logout", { method: "POST" }).then(() => {
          window.location.href = "/results/login";
        });
      }}
    >
      Log out
    </button>
  );
}
