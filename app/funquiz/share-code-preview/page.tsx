"use client";

import { ShareRoomCode } from "@/components/funquiz/share-room-code";

export default function ShareCodePreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="text-lg font-semibold">Waiting room</h1>
        <p className="mt-2 text-sm text-slate-300">
          Quiz: <strong className="text-violet-200">True or false</strong>
        </p>
        <p className="mt-1 text-sm text-slate-300">
          Mode: <strong className="text-violet-200">Play together</strong>
        </p>
        <ShareRoomCode code="69Z9KA" joinPath="/funquiz" />
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Player one
          </li>
          <li className="text-slate-500">Waiting for player 2…</li>
        </ul>
      </div>
    </main>
  );
}
