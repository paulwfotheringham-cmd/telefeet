"use client";

import { useState } from "react";
import { formatRoomCodeSpaced } from "@/lib/funquiz/room-code";

type Props = {
  code: string;
  /** Classes for the large code text. */
  codeClassName?: string;
  /** Classes for the primary Copy code button. */
  buttonClassName?: string;
  /** Optional path for a secondary “copy link” action, e.g. `/draw-the-flower`. */
  joinPath?: string;
};

export function ShareRoomCode({
  code,
  codeClassName = "text-violet-200",
  buttonClassName = "border-violet-400/40 text-violet-200",
  joinPath,
}: Props) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  function flash(kind: "code" | "link") {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Code for the other player
      </p>
      <p
        className={`mt-2 select-all font-mono text-3xl font-bold tracking-[0.28em] sm:text-4xl ${codeClassName}`}
      >
        {formatRoomCodeSpaced(code)}
      </p>
      <p className="mt-2 text-sm text-slate-400">
        They open this game and enter that code under “join with a code”.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${buttonClassName}`}
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(() => flash("code"));
          }}
        >
          {copied === "code" ? "Code copied" : "Copy code"}
        </button>
        {joinPath ? (
          <button
            type="button"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200"
            onClick={() => {
              const url = `${window.location.origin}${joinPath}?join=${code}`;
              void navigator.clipboard?.writeText(url).then(() => flash("link"));
            }}
          >
            {copied === "link" ? "Link copied" : "Copy link"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
