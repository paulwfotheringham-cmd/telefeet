import React, { type ReactNode } from "react";
import { INSTRUMENTS, type InstrumentId } from "@/lib/draw-the-instrument/instruments";

const TITLES = new Map(INSTRUMENTS.map((instrument) => [instrument.title, instrument.id]));
const INK = "#334155";

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: InstrumentId, label: string) {
  switch (id) {
    case "guitar":
      return (
        <Frame label={label}>
          <ellipse cx="78" cy="96" rx="34" ry="42" fill="#fed7aa" stroke={INK} strokeWidth="4" />
          <circle cx="78" cy="96" r="10" fill="#0f172a" />
          <rect x="104" y="28" width="14" height="92" rx="4" fill="#fdba74" stroke={INK} strokeWidth="3" />
          <rect x="100" y="22" width="22" height="16" rx="3" fill="#334155" />
        </Frame>
      );
    case "piano":
      return (
        <Frame label={label}>
          <path d="M28 78h184v48H28z" fill="#0f172a" />
          <path d="M36 54h168v28H36z" fill="#e2e8f0" stroke={INK} strokeWidth="3" />
          <path d="M48 54v28M72 54v28M96 54v28M120 54v28M144 54v28M168 54v28" stroke={INK} strokeWidth="3" />
          <rect x="58" y="54" width="10" height="16" fill="#0f172a" />
          <rect x="86" y="54" width="10" height="16" fill="#0f172a" />
          <rect x="130" y="54" width="10" height="16" fill="#0f172a" />
          <rect x="154" y="54" width="10" height="16" fill="#0f172a" />
        </Frame>
      );
    case "drum":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="78" rx="62" ry="22" fill="#fecaca" stroke={INK} strokeWidth="4" />
          <path d="M58 78v36c0 14 28 24 62 24s62-10 62-24V78" fill="#fca5a5" stroke={INK} strokeWidth="4" />
          <path d="M150 40l28 36" stroke="#b45309" strokeWidth="6" />
        </Frame>
      );
    case "violin":
      return (
        <Frame label={label}>
          <ellipse cx="108" cy="108" rx="22" ry="28" fill="#fdba74" stroke={INK} strokeWidth="4" />
          <ellipse cx="108" cy="72" rx="16" ry="18" fill="#fed7aa" stroke={INK} strokeWidth="3" />
          <rect x="102" y="22" width="8" height="48" fill="#334155" />
          <path d="M92 24h28" stroke={INK} strokeWidth="4" />
        </Frame>
      );
    case "trumpet":
      return (
        <Frame label={label}>
          <path d="M36 78h90l36-22v48l-36-22H36z" fill="#fbbf24" stroke="#92400e" strokeWidth="4" />
          <circle cx="70" cy="96" r="8" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
          <circle cx="92" cy="96" r="8" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
          <circle cx="114" cy="96" r="8" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
        </Frame>
      );
    case "flute":
      return (
        <Frame label={label}>
          <rect x="28" y="72" width="184" height="16" rx="8" fill="#e2e8f0" stroke={INK} strokeWidth="4" />
          <circle cx="64" cy="80" r="4" fill="#0f172a" />
          <circle cx="92" cy="80" r="4" fill="#0f172a" />
          <circle cx="120" cy="80" r="4" fill="#0f172a" />
          <circle cx="148" cy="80" r="4" fill="#0f172a" />
        </Frame>
      );
    case "saxophone":
      return (
        <Frame label={label}>
          <path d="M150 28c-8 20-6 36 8 48 18 16 8 40-16 52-20 10-48 4-58-12" fill="none" stroke="#fbbf24" strokeWidth="12" />
          <circle cx="78" cy="122" r="14" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
          <rect x="142" y="20" width="22" height="12" rx="3" fill="#334155" />
        </Frame>
      );
    case "harp":
      return (
        <Frame label={label}>
          <path d="M70 28c48 8 78 40 78 104" fill="none" stroke="#b45309" strokeWidth="8" />
          <path d="M70 28v112" stroke="#b45309" strokeWidth="8" />
          <path d="M78 48h58M82 68h62M86 88h58M90 108h46" stroke="#92400e" strokeWidth="2" />
        </Frame>
      );
    case "cello":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="36" ry="32" fill="#c2410c" stroke={INK} strokeWidth="4" />
          <ellipse cx="120" cy="70" rx="24" ry="20" fill="#ea580c" stroke={INK} strokeWidth="3" />
          <rect x="114" y="18" width="12" height="48" fill="#334155" />
          <path d="M70 132h100" stroke={INK} strokeWidth="4" />
        </Frame>
      );
    case "banjo":
      return (
        <Frame label={label}>
          <circle cx="86" cy="92" r="40" fill="#fef3c7" stroke={INK} strokeWidth="6" />
          <circle cx="86" cy="92" r="16" fill="#0f172a" />
          <rect x="118" y="40" width="12" height="70" fill="#b45309" />
        </Frame>
      );
    case "accordion":
      return (
        <Frame label={label}>
          <rect x="36" y="48" width="36" height="72" rx="6" fill="#dc2626" />
          <rect x="168" y="48" width="36" height="72" rx="6" fill="#dc2626" />
          <path d="M72 56h24l8 8-8 8h-24zM104 56h24l8 8-8 8h-24zM136 56h24l8 8-8 8h-24z" fill="#fecaca" stroke={INK} strokeWidth="2" />
          <path d="M72 96h24l8 8-8 8h-24zM104 96h24l8 8-8 8h-24zM136 96h24l8 8-8 8h-24z" fill="#fecaca" stroke={INK} strokeWidth="2" />
        </Frame>
      );
    case "harmonica":
      return (
        <Frame label={label}>
          <rect x="36" y="62" width="168" height="36" rx="6" fill="#e2e8f0" stroke={INK} strokeWidth="4" />
          <path d="M52 74h12M76 74h12M100 74h12M124 74h12M148 74h12M172 74h12" stroke={INK} strokeWidth="6" />
        </Frame>
      );
    case "xylophone":
      return (
        <Frame label={label}>
          <rect x="40" y="40" width="150" height="14" rx="4" fill="#f59e0b" />
          <rect x="48" y="62" width="140" height="14" rx="4" fill="#fbbf24" />
          <rect x="56" y="84" width="128" height="14" rx="4" fill="#fcd34d" />
          <rect x="64" y="106" width="112" height="14" rx="4" fill="#fde68a" />
        </Frame>
      );
    case "trombone":
      return (
        <Frame label={label}>
          <path d="M40 70h120" stroke="#fbbf24" strokeWidth="8" />
          <path d="M40 96h90" stroke="#f59e0b" strokeWidth="8" />
          <path d="M160 62c24 0 36 12 36 28s-12 28-36 28" fill="none" stroke="#fbbf24" strokeWidth="8" />
          <path d="M130 70v26" stroke="#92400e" strokeWidth="6" />
        </Frame>
      );
    case "clarinet":
      return (
        <Frame label={label}>
          <rect x="108" y="18" width="16" height="120" rx="6" fill="#1e293b" />
          <circle cx="116" cy="48" r="3" fill="#f8fafc" />
          <circle cx="116" cy="68" r="3" fill="#f8fafc" />
          <circle cx="116" cy="88" r="3" fill="#f8fafc" />
          <circle cx="116" cy="108" r="3" fill="#f8fafc" />
          <path d="M108 18c0-10 16-10 16 0" fill="#334155" />
        </Frame>
      );
    case "ukulele":
      return (
        <Frame label={label}>
          <ellipse cx="96" cy="100" rx="28" ry="30" fill="#fde68a" stroke={INK} strokeWidth="4" />
          <circle cx="96" cy="100" r="8" fill="#0f172a" />
          <rect x="116" y="36" width="12" height="72" rx="3" fill="#d97706" />
        </Frame>
      );
    case "tambourine":
      return (
        <Frame label={label}>
          <circle cx="120" cy="82" r="48" fill="none" stroke="#b45309" strokeWidth="14" />
          <circle cx="168" cy="58" r="6" fill="#fbbf24" />
          <circle cx="176" cy="82" r="6" fill="#fbbf24" />
          <circle cx="168" cy="106" r="6" fill="#fbbf24" />
        </Frame>
      );
    case "bongos":
      return (
        <Frame label={label}>
          <ellipse cx="86" cy="70" rx="32" ry="12" fill="#fed7aa" stroke={INK} strokeWidth="3" />
          <path d="M54 70v40c0 10 14 16 32 16s32-6 32-16V70" fill="#fdba74" stroke={INK} strokeWidth="3" />
          <ellipse cx="156" cy="84" rx="26" ry="10" fill="#fecaca" stroke={INK} strokeWidth="3" />
          <path d="M130 84v32c0 8 12 14 26 14s26-6 26-14V84" fill="#fca5a5" stroke={INK} strokeWidth="3" />
        </Frame>
      );
    case "french-horn":
      return (
        <Frame label={label}>
          <circle cx="120" cy="84" r="40" fill="none" stroke="#fbbf24" strokeWidth="10" />
          <circle cx="150" cy="70" r="18" fill="#f59e0b" stroke="#92400e" strokeWidth="4" />
          <rect x="70" y="96" width="36" height="8" rx="3" fill="#fbbf24" />
        </Frame>
      );
    case "bagpipes":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="100" rx="40" ry="28" fill="#166534" stroke="#052e16" strokeWidth="3" />
          <rect x="112" y="28" width="10" height="60" fill="#14532d" />
          <rect x="132" y="40" width="8" height="48" fill="#14532d" />
          <rect x="96" y="46" width="8" height="42" fill="#14532d" />
          <path d="M150 108h36" stroke="#052e16" strokeWidth="6" />
        </Frame>
      );
    default:
      return null;
  }
}

export function InstrumentPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof INSTRUMENTS)[number]["title"]);
  if (!id) return null;
  return picture(id, `Answer: ${name}`);
}
