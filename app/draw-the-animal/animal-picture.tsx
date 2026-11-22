import React, { type ReactNode } from "react";
import { ANIMALS, type AnimalId } from "@/lib/draw-the-animal/animals";

const TITLES = new Map(ANIMALS.map((animal) => [animal.title, animal.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: AnimalId, label: string) {
  switch (id) {
    case "cat":
      return (
        <Frame label={label}>
          <path fill="#f59e0b" d="M86 118c-28-6-40-28-32-48 6-16 22-24 40-22 4-18 22-30 42-24 16 4 26 20 24 36 16 2 28 16 26 32-2 18-18 30-38 30-8 18-28 24-46 16-6-4-12-12-16-20z" />
          <path fill="#d97706" d="M78 62l-22-28 28 8zM150 58l28-24-8 32z" />
          <path fill="#b45309" d="M168 108c22 8 36 2 44-12-16 2-28 6-44 12z" />
          <circle cx="108" cy="92" r="3" fill="#0f172a" />
          <circle cx="132" cy="90" r="3" fill="#0f172a" />
        </Frame>
      );
    case "dog":
      return (
        <Frame label={label}>
          <ellipse cx="128" cy="96" rx="52" ry="32" fill="#92400e" />
          <ellipse cx="78" cy="78" rx="22" ry="18" fill="#b45309" />
          <path fill="#78350f" d="M62 62c-16 2-22 18-10 28 4-12 10-16 18-16zM96 58c8-16 24-10 22 6-10-2-18 0-22-6z" />
          <path fill="#92400e" d="M168 84c22-4 36 10 34 22-14-2-26-8-34-22z" />
          <ellipse cx="58" cy="82" rx="10" ry="7" fill="#d6d3d1" />
          <circle cx="70" cy="76" r="2.5" fill="#0f172a" />
        </Frame>
      );
    case "fish":
      return (
        <Frame label={label}>
          <ellipse cx="118" cy="82" rx="58" ry="28" fill="#0284c7" />
          <path fill="#0369a1" d="M168 82l42-28v56z" />
          <path fill="#38bdf8" d="M108 58c8-16 24-16 28 0-12 4-22 4-28 0z" />
          <circle cx="84" cy="78" r="5" fill="#0f172a" />
          <circle cx="86" cy="76" r="2" fill="#fff" />
        </Frame>
      );
    case "bird":
      return (
        <Frame label={label}>
          <ellipse cx="118" cy="86" rx="28" ry="20" fill="#2563eb" />
          <path fill="#1d4ed8" d="M112 74c28-36 62-28 70-8-28 4-48 8-70 8z" />
          <circle cx="96" cy="78" r="12" fill="#3b82f6" />
          <path fill="#f59e0b" d="M78 78l-22 6 22 6z" />
          <path fill="#1e3a8a" d="M108 104l-4 28M128 104l6 28" stroke="#1e3a8a" strokeWidth="4" />
          <circle cx="92" cy="76" r="2" fill="#0f172a" />
        </Frame>
      );
    case "elephant":
      return (
        <Frame label={label}>
          <ellipse cx="132" cy="96" rx="58" ry="36" fill="#94a3b8" />
          <circle cx="78" cy="78" r="28" fill="#64748b" />
          <ellipse cx="58" cy="86" rx="16" ry="22" fill="#94a3b8" />
          <path fill="#64748b" d="M70 100c-6 28 8 40 16 36 4-16 2-28-4-40z" />
          <path fill="#e7e5e4" d="M64 108c-2 8 6 10 8 2z" />
          <circle cx="70" cy="72" r="3" fill="#0f172a" />
        </Frame>
      );
    case "giraffe":
      return (
        <Frame label={label}>
          <rect x="108" y="28" width="18" height="70" rx="8" fill="#fbbf24" />
          <ellipse cx="118" cy="26" rx="14" ry="12" fill="#f59e0b" />
          <path fill="#d97706" d="M108 16l-4-12 8 6zM128 16l6-12-8 6z" />
          <ellipse cx="128" cy="112" rx="40" ry="22" fill="#fbbf24" />
          <circle cx="108" cy="104" r="6" fill="#b45309" />
          <circle cx="136" cy="118" r="7" fill="#b45309" />
          <circle cx="154" cy="104" r="5" fill="#b45309" />
          <path stroke="#b45309" strokeWidth="4" d="M112 132v16M146 132v16" />
        </Frame>
      );
    case "snake":
      return (
        <Frame label={label}>
          <path fill="none" stroke="#16a34a" strokeWidth="16" strokeLinecap="round" d="M36 110c24-40 48-40 64-8 16 32 40 28 56-4 14-28 36-20 48 8" />
          <circle cx="196" cy="102" r="8" fill="#15803d" />
          <circle cx="198" cy="100" r="2" fill="#0f172a" />
          <path fill="#dc2626" d="M204 104l10 2-10 3z" />
        </Frame>
      );
    case "turtle":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="88" rx="48" ry="32" fill="#15803d" />
          <path fill="#166534" d="M84 78h72M120 58v58M96 68c16 20 32 20 48 0M96 108c16-16 32-16 48 0" stroke="#166534" strokeWidth="3" />
          <ellipse cx="176" cy="78" rx="14" ry="10" fill="#22c55e" />
          <ellipse cx="78" cy="108" rx="12" ry="8" fill="#22c55e" />
          <ellipse cx="162" cy="112" rx="12" ry="8" fill="#22c55e" />
          <circle cx="180" cy="76" r="2" fill="#0f172a" />
        </Frame>
      );
    case "rabbit":
      return (
        <Frame label={label}>
          <ellipse cx="96" cy="48" rx="10" ry="28" fill="#d6d3d1" />
          <ellipse cx="122" cy="44" rx="10" ry="30" fill="#e7e5e4" />
          <ellipse cx="96" cy="52" rx="5" ry="16" fill="#fda4af" />
          <ellipse cx="122" cy="48" rx="5" ry="18" fill="#fda4af" />
          <ellipse cx="118" cy="104" rx="36" ry="28" fill="#d6d3d1" />
          <circle cx="104" cy="96" r="3" fill="#0f172a" />
          <circle cx="124" cy="94" r="3" fill="#0f172a" />
          <ellipse cx="148" cy="118" rx="10" ry="6" fill="#e7e5e4" />
        </Frame>
      );
    case "horse":
      return (
        <Frame label={label}>
          <ellipse cx="132" cy="96" rx="48" ry="26" fill="#92400e" />
          <path fill="#78350f" d="M86 78c-8-28 10-40 24-28 4 16 2 28-6 36z" />
          <ellipse cx="78" cy="62" rx="16" ry="12" fill="#b45309" />
          <path fill="#1c1917" d="M70 52c8-16 22-8 18 8-10-2-16 0-18-8z" />
          <path fill="#1c1917" d="M172 84c24 2 36 16 28 28-16-6-28-14-28-28z" />
          <path stroke="#78350f" strokeWidth="5" d="M108 118v22M124 120v22M150 118v22M166 116v22" />
        </Frame>
      );
    case "cow":
      return (
        <Frame label={label}>
          <ellipse cx="128" cy="100" rx="58" ry="32" fill="#d6d3d1" />
          <ellipse cx="100" cy="92" rx="14" ry="10" fill="#1c1917" />
          <ellipse cx="150" cy="108" rx="16" ry="10" fill="#1c1917" />
          <ellipse cx="78" cy="72" rx="18" ry="14" fill="#e7e5e4" />
          <path fill="#1c1917" d="M62 62c-8-10 4-16 10-6zM92 58c6-12 16-6 8 6z" />
          <ellipse cx="64" cy="78" rx="8" ry="6" fill="#fb7185" />
          <path stroke="#a8a29e" strokeWidth="5" d="M100 128v16M150 128v16" />
        </Frame>
      );
    case "pig":
      return (
        <Frame label={label}>
          <ellipse cx="124" cy="96" rx="50" ry="32" fill="#fda4af" />
          <ellipse cx="78" cy="78" rx="20" ry="16" fill="#fb7185" />
          <ellipse cx="64" cy="82" rx="10" ry="8" fill="#fb7185" />
          <circle cx="60" cy="80" r="1.5" fill="#9f1239" />
          <circle cx="68" cy="80" r="1.5" fill="#9f1239" />
          <path fill="#e11d48" d="M70 62c-4-14 10-16 12-2zM96 64c2-14 16-10 10 4z" />
          <path fill="#fb7185" d="M160 100c16 2 22 12 12 18-8-6-16-10-12-18z" />
        </Frame>
      );
    case "duck":
      return (
        <Frame label={label}>
          <ellipse cx="128" cy="100" rx="42" ry="26" fill="#fbbf24" />
          <circle cx="86" cy="78" r="16" fill="#f59e0b" />
          <path fill="#f97316" d="M68 78l-24 4 24 8z" />
          <path fill="#f97316" d="M118 122l-8 16 16-4zM146 122l4 16 12-8z" />
          <circle cx="80" cy="76" r="2" fill="#0f172a" />
        </Frame>
      );
    case "frog":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="100" rx="46" ry="28" fill="#22c55e" />
          <circle cx="86" cy="62" r="16" fill="#16a34a" />
          <circle cx="154" cy="62" r="16" fill="#16a34a" />
          <circle cx="86" cy="62" r="7" fill="#0f172a" />
          <circle cx="154" cy="62" r="7" fill="#0f172a" />
          <path fill="#15803d" d="M78 112c-20 8-28 20-16 24 10-10 20-16 16-24zM162 112c20 8 28 20 16 24-10-10-20-16-16-24z" />
        </Frame>
      );
    case "butterfly":
      return (
        <Frame label={label}>
          <ellipse cx="78" cy="70" rx="36" ry="26" fill="#c026d3" />
          <ellipse cx="162" cy="70" rx="36" ry="26" fill="#a21caf" />
          <ellipse cx="84" cy="112" rx="28" ry="20" fill="#e879f9" />
          <ellipse cx="156" cy="112" rx="28" ry="20" fill="#d946ef" />
          <rect x="114" y="52" width="12" height="70" rx="6" fill="#1c1917" />
          <path stroke="#1c1917" strokeWidth="2" d="M118 56c-10-16-6-24 2-28M122 56c10-16 6-24-2-28" />
        </Frame>
      );
    case "penguin":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="88" rx="36" ry="48" fill="#0f172a" />
          <ellipse cx="120" cy="100" rx="20" ry="30" fill="#e7e5e4" />
          <circle cx="108" cy="62" r="4" fill="#fff" />
          <circle cx="132" cy="62" r="4" fill="#fff" />
          <circle cx="108" cy="62" r="2" fill="#0f172a" />
          <circle cx="132" cy="62" r="2" fill="#0f172a" />
          <path fill="#f97316" d="M112 74l16 4-16 4z" />
          <path fill="#f97316" d="M96 132l12 12 12-12zM132 132l8 12 14-10z" />
        </Frame>
      );
    case "owl":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="92" rx="40" ry="46" fill="#92400e" />
          <path fill="#78350f" d="M84 60l-16-28 28 16zM156 60l16-28-28 16z" />
          <circle cx="104" cy="86" r="14" fill="#fef3c7" />
          <circle cx="136" cy="86" r="14" fill="#fef3c7" />
          <circle cx="104" cy="86" r="6" fill="#0f172a" />
          <circle cx="136" cy="86" r="6" fill="#0f172a" />
          <path fill="#f59e0b" d="M114 102l12 8 12-8-12 4z" />
        </Frame>
      );
    case "lion":
      return (
        <Frame label={label}>
          <circle cx="120" cy="78" r="42" fill="#d97706" />
          <circle cx="120" cy="82" r="24" fill="#fbbf24" />
          <ellipse cx="120" cy="122" rx="36" ry="20" fill="#f59e0b" />
          <circle cx="112" cy="78" r="3" fill="#0f172a" />
          <circle cx="128" cy="78" r="3" fill="#0f172a" />
          <path fill="#b45309" d="M150 118c20 4 28 16 16 22-12-8-20-14-16-22z" />
        </Frame>
      );
    case "monkey":
      return (
        <Frame label={label}>
          <ellipse cx="124" cy="100" rx="32" ry="28" fill="#92400e" />
          <circle cx="100" cy="70" r="20" fill="#b45309" />
          <circle cx="86" cy="64" r="8" fill="#d6d3d1" />
          <circle cx="114" cy="62" r="8" fill="#d6d3d1" />
          <ellipse cx="100" cy="76" rx="10" ry="8" fill="#fdba74" />
          <circle cx="96" cy="70" r="2" fill="#0f172a" />
          <path fill="#78350f" d="M150 108c28 8 36 24 20 30-8-12-18-18-20-30z" />
        </Frame>
      );
    case "bear":
      return (
        <Frame label={label}>
          <ellipse cx="126" cy="104" rx="46" ry="30" fill="#78350f" />
          <circle cx="88" cy="72" r="22" fill="#92400e" />
          <circle cx="74" cy="56" r="8" fill="#78350f" />
          <circle cx="102" cy="54" r="8" fill="#78350f" />
          <ellipse cx="78" cy="78" rx="8" ry="6" fill="#d6d3d1" />
          <circle cx="82" cy="68" r="2.5" fill="#0f172a" />
          <circle cx="96" cy="66" r="2.5" fill="#0f172a" />
        </Frame>
      );
    case "whale":
      return (
        <Frame label={label}>
          <path fill="#1d4ed8" d="M36 96c20-36 80-48 130-28 28 12 42 8 52 20-28 6-40 28-78 32-40 4-84 0-104-24z" />
          <path fill="#1e3a8a" d="M150 78c8-20 22-16 18 4-8 2-14 2-18-4z" />
          <path fill="#1e3a8a" d="M48 108c-16 10-8 22 8 16z" />
          <circle cx="168" cy="84" r="3" fill="#0f172a" />
          <path fill="#93c5fd" d="M188 48c4 12 4 20 0 28 6-10 8-18 0-28z" />
        </Frame>
      );
    case "shark":
      return (
        <Frame label={label}>
          <path fill="#64748b" d="M28 90c36-20 90-24 140-8 20 6 36 4 44 14-30 4-48 18-86 18-46 0-78-8-98-24z" />
          <path fill="#475569" d="M120 70l18-28 8 30z" />
          <path fill="#334155" d="M40 104l-16 16 28-6z" />
          <circle cx="176" cy="84" r="3" fill="#0f172a" />
          <path fill="#fff" d="M186 96l-16 4 16 3z" />
        </Frame>
      );
    case "crab":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="88" rx="40" ry="26" fill="#dc2626" />
          <path fill="#b91c1c" d="M78 78c-24-8-36 8-28 20 10-8 20-12 28-20zM162 78c24-8 36 8 28 20-10-8-20-12-28-20z" />
          <circle cx="108" cy="80" r="3" fill="#0f172a" />
          <circle cx="132" cy="80" r="3" fill="#0f172a" />
          <path stroke="#b91c1c" strokeWidth="4" d="M96 112l-10 16M112 114l-2 18M128 114l2 18M144 112l10 16" />
        </Frame>
      );
    case "octopus":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="64" rx="36" ry="28" fill="#7c3aed" />
          <circle cx="108" cy="60" r="4" fill="#fff" />
          <circle cx="132" cy="60" r="4" fill="#fff" />
          <circle cx="108" cy="60" r="2" fill="#0f172a" />
          <circle cx="132" cy="60" r="2" fill="#0f172a" />
          <path fill="none" stroke="#6d28d9" strokeWidth="8" strokeLinecap="round" d="M88 84c-8 24 8 40 0 52M104 88c-4 28 10 36 2 48M120 90c0 30 0 30 0 48M136 88c4 28-10 36-2 48M152 84c8 24-8 40 0 52" />
        </Frame>
      );
    case "bee":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="88" rx="28" ry="36" fill="#facc15" />
          <path fill="#0f172a" d="M94 78h52v10H94zM94 96h52v10H94z" />
          <circle cx="120" cy="52" r="12" fill="#0f172a" />
          <ellipse cx="86" cy="78" rx="22" ry="12" fill="#e2e8f0" />
          <ellipse cx="154" cy="78" rx="22" ry="12" fill="#e2e8f0" />
          <path stroke="#0f172a" strokeWidth="2" d="M112 42c-8-14-4-20 2-24M128 42c8-14 4-20-2-24" />
        </Frame>
      );
    case "mouse":
      return (
        <Frame label={label}>
          <ellipse cx="118" cy="100" rx="36" ry="24" fill="#a8a29e" />
          <circle cx="86" cy="78" r="16" fill="#d6d3d1" />
          <circle cx="74" cy="66" r="10" fill="#e7e5e4" />
          <circle cx="98" cy="64" r="10" fill="#e7e5e4" />
          <circle cx="80" cy="76" r="2" fill="#0f172a" />
          <path fill="none" stroke="#78716c" strokeWidth="3" d="M150 108c28 8 40-10 52 6" />
        </Frame>
      );
    case "fox":
      return (
        <Frame label={label}>
          <ellipse cx="128" cy="104" rx="40" ry="24" fill="#ea580c" />
          <path fill="#c2410c" d="M86 78l-8-28 24 16zM118 72l8-30 16 28z" />
          <path fill="#fff7ed" d="M92 86c8 10 20 8 24-2-12 0-20 0-24 2z" />
          <circle cx="96" cy="78" r="2.5" fill="#0f172a" />
          <path fill="#f97316" d="M160 100c30 2 42 18 24 26-14-8-24-16-24-26z" />
          <path fill="#fff7ed" d="M176 112c8 4 12 4 16-2-6 0-12 0-16 2z" />
        </Frame>
      );
    case "deer":
      return (
        <Frame label={label}>
          <ellipse cx="132" cy="108" rx="42" ry="24" fill="#b45309" />
          <path fill="#92400e" d="M92 86c-4-24 12-36 22-20 2 12 0 22-8 28z" />
          <ellipse cx="84" cy="64" rx="12" ry="10" fill="#d97706" />
          <path stroke="#78350f" strokeWidth="3" d="M76 56l-8-16M72 44l-8-8M72 44l6-10M96 54l8-16M100 42l8-8M100 42l-4-12" />
          <path stroke="#92400e" strokeWidth="4" d="M112 128v16M150 128v16" />
          <circle cx="80" cy="62" r="2" fill="#0f172a" />
        </Frame>
      );
    case "crocodile":
      return (
        <Frame label={label}>
          <path fill="#15803d" d="M24 86h150c16 0 28 10 28 22s-14 20-32 18c-20 16-48 18-78 8-28-8-48-8-68-16v-32z" />
          <path fill="#f8fafc" d="M36 96h70v4H36z" />
          <path fill="#166534" d="M150 78c20-6 36 4 34 16-16-2-28-6-34-16z" />
          <circle cx="188" cy="96" r="3" fill="#0f172a" />
        </Frame>
      );
    case "snail":
      return (
        <Frame label={label}>
          <ellipse cx="86" cy="112" rx="48" ry="16" fill="#a16207" />
          <circle cx="132" cy="86" r="32" fill="#ca8a04" />
          <circle cx="132" cy="86" r="18" fill="#eab308" />
          <circle cx="132" cy="86" r="8" fill="#a16207" />
          <circle cx="70" cy="96" r="8" fill="#d97706" />
          <circle cx="66" cy="94" r="2" fill="#0f172a" />
        </Frame>
      );
    case "bat":
      return (
        <Frame label={label}>
          <path fill="#1e293b" d="M120 78c-20-8-48-36-78-28 8 20 20 28 36 32-8 16-6 28 8 32 10-12 22-16 34-16 12 0 24 4 34 16 14-4 16-16 8-32 16-4 28-12 36-32-30-8-58 20-78 28z" />
          <circle cx="108" cy="84" r="3" fill="#f8fafc" />
          <circle cx="132" cy="84" r="3" fill="#f8fafc" />
          <path fill="#334155" d="M112 96l8 6 8-6z" />
        </Frame>
      );
    case "chicken":
      return (
        <Frame label={label}>
          <ellipse cx="124" cy="100" rx="40" ry="28" fill="#fde68a" stroke="#d97706" strokeWidth="3" />
          <circle cx="86" cy="78" r="16" fill="#fcd34d" stroke="#d97706" strokeWidth="3" />
          <path fill="#dc2626" d="M78 64c4-14 14-12 12 0zM90 62c6-14 14-8 6 6z" />
          <path fill="#f59e0b" d="M70 80l-18 4 18 6z" />
          <path fill="#f59e0b" d="M112 124l-6 14 14-2zM140 124l4 14 12-6z" />
          <circle cx="80" cy="76" r="2" fill="#0f172a" />
        </Frame>
      );
    case "camel":
      return (
        <Frame label={label}>
          <path fill="#d6a35c" d="M40 112c8-20 28-24 40-10 8-22 28-28 40-8 10-18 32-16 40 2 16-4 36 4 40 18H40z" />
          <ellipse cx="58" cy="78" rx="14" ry="12" fill="#c48a45" />
          <path stroke="#a16207" strokeWidth="4" d="M70 122v18M110 124v16M150 124v16M180 120v18" />
          <circle cx="52" cy="76" r="2" fill="#0f172a" />
        </Frame>
      );
    case "flamingo":
      return (
        <Frame label={label}>
          <path fill="#fb7185" d="M150 120c-10-30-8-52 8-70 10-12 8-28-8-32-18-4-24 12-16 26-14 8-30 28-28 52 2 16 20 28 44 24z" />
          <path fill="#e11d48" d="M156 28c18-6 28 4 22 14-10-2-18-4-22-14z" />
          <path stroke="#fb7185" strokeWidth="3" d="M140 124c-8 16-4 24 6 22M156 126c6 14 16 14 18 4" />
          <circle cx="148" cy="36" r="2" fill="#0f172a" />
        </Frame>
      );
    case "starfish":
      return (
        <Frame label={label}>
          <path fill="#f97316" d="M120 28l16 36 38 8-28 24 8 38-34-20-34 20 8-38-28-24 38-8z" />
          <circle cx="120" cy="86" r="8" fill="#ea580c" />
        </Frame>
      );
    case "ladybug":
      return (
        <Frame label={label}>
          <ellipse cx="128" cy="92" rx="48" ry="36" fill="#dc2626" />
          <path fill="#0f172a" d="M124 58v70" stroke="#0f172a" strokeWidth="4" />
          <circle cx="108" cy="80" r="8" fill="#0f172a" />
          <circle cx="150" cy="84" r="7" fill="#0f172a" />
          <circle cx="112" cy="108" r="6" fill="#0f172a" />
          <circle cx="148" cy="110" r="7" fill="#0f172a" />
          <ellipse cx="78" cy="86" rx="16" ry="14" fill="#1c1917" />
          <circle cx="72" cy="82" r="2" fill="#fff" />
        </Frame>
      );
    default:
      return null;
  }
}

export function AnimalPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof ANIMALS)[number]["title"]);
  if (!id) return null;
  return picture(id, `Answer: ${name}`);
}
