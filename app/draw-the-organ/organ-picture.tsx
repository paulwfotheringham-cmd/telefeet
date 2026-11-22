import type { ReactNode } from "react";
import { ORGANS, type OrganId } from "@/lib/draw-the-organ/organs";

const TITLES = new Map(ORGANS.map((organ) => [organ.title, organ.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: OrganId, label: string) {
  switch (id) {
    case "heart":
      return (
        <Frame label={label}>
          <path
            fill="#e11d48"
            d="M120 138c-8-6-46-32-58-52-14-22-8-48 16-56 16-6 30 2 40 16 4-8 12-22 28-24 22-2 40 16 42 36 4 28-28 58-68 80z"
          />
          <path fill="#fb7185" d="M92 58c8-16 28-18 34-2-12 2-24 0-34 2z" />
          <path fill="#9f1239" d="M118 46c6-14 22-16 26-4-10 6-18 6-26 4z" />
        </Frame>
      );
    case "brain":
      return (
        <Frame label={label}>
          <path fill="#f9a8d4" d="M78 92c-18-8-28-32-16-52 8-14 28-22 46-16 6-16 28-26 48-18 22 8 30 32 22 50 16 8 24 28 14 44-8 16-28 22-46 16-8 14-30 18-46 6-16-8-22-18-22-30z" />
          <path fill="none" stroke="#9d174d" strokeWidth="3" d="M120 36v78M92 52c12 6 12 18 0 26M148 52c-12 6-12 18 0 26M86 84c14 4 18 16 8 24M154 84c-14 4-18 16-8 24" />
          <ellipse cx="102" cy="124" rx="22" ry="12" fill="#f472b6" />
          <ellipse cx="142" cy="124" rx="22" ry="12" fill="#f472b6" />
          <path fill="#be185d" d="M112 128h16v18h-16z" />
        </Frame>
      );
    case "lungs":
      return (
        <Frame label={label}>
          <path fill="#fda4af" d="M108 48c-8 8-46 16-58 40-14 28-4 58 22 62 18 4 36-8 40-24 2-8 4-28 4-40 0-16-2-32-8-38z" />
          <path fill="#fb7185" d="M132 48c8 8 46 16 58 40 14 28 4 58-22 62-18 4-36-8-40-24-2-8-4-28-4-40 0-16 2-32 8-38z" />
          <path fill="none" stroke="#9f1239" strokeWidth="5" strokeLinecap="round" d="M120 18v34M120 50c-18 10-28 16-34 22M120 50c18 10 28 16 34 22" />
        </Frame>
      );
    case "liver":
      return (
        <Frame label={label}>
          <path fill="#b45309" d="M36 72c8-28 48-42 92-36 36 6 70 8 78 32 8 28-6 48-28 56-34 12-78 14-112 2-22-8-36-28-30-54z" />
          <path fill="#92400e" d="M132 48c18 4 34 16 38 32-20 2-40-6-52-16 2-8 8-16 14-16z" />
          <ellipse cx="168" cy="96" rx="10" ry="16" fill="#65a30d" />
        </Frame>
      );
    case "stomach":
      return (
        <Frame label={label}>
          <path fill="#fb7185" d="M78 36c28-16 74-8 84 18 8 22 2 36-12 46-22 16-34 28-28 40 8 14-10 22-28 12-22-12-16-34-4-48 10-12 6-28-4-40-8-10-12-20-8-28z" />
          <path fill="none" stroke="#9f1239" strokeWidth="4" strokeLinecap="round" d="M86 48c20 6 40 8 58 2" />
          <path fill="#9f1239" d="M150 108c16 8 28 8 36-2l8 6c-14 18-36 18-54 6z" />
        </Frame>
      );
    case "kidneys":
      return (
        <Frame label={label}>
          <path fill="#e11d48" d="M78 36c22-8 40 8 40 32v28c0 22-16 36-36 32-22-4-36-22-32-46 2-20 10-42 28-46z" />
          <path fill="#f8fafc" d="M96 58c8 6 10 18 6 32-2-12-6-20-14-24 2-4 5-6 8-8z" />
          <path fill="#e11d48" d="M162 36c-22-8-40 8-40 32v28c0 22 16 36 36 32 22-4 36-22 32-46-2-20-10-42-28-46z" />
          <path fill="#f8fafc" d="M144 58c-8 6-10 18-6 32 2-12 6-20 14-24-2-4-5-6-8-8z" />
          <path fill="none" stroke="#9f1239" strokeWidth="3" d="M92 132c8 10 18 12 28 8M148 132c-8 10-18 12-28 8" />
        </Frame>
      );
    case "intestines":
      return (
        <Frame label={label}>
          <path
            fill="none"
            stroke="#fb7185"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M48 46h144c10 0 18 10 18 22s-8 20-18 20H70c-12 0-20 8-20 18s8 18 20 18h110"
          />
          <path fill="none" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" d="M70 70c16 8 20 8 36 0M108 70c16 8 20 8 36 0M86 108c16 8 20 8 36 0M124 108c16 8 20 8 36 0" />
        </Frame>
      );
    case "eye":
      return (
        <Frame label={label}>
          <path fill="#e2e8f0" d="M28 80c32-36 152-36 184 0-32 36-152 36-184 0z" />
          <path fill="none" stroke="#334155" strokeWidth="4" d="M28 80c32-36 152-36 184 0-32 36-152 36-184 0z" />
          <circle cx="120" cy="80" r="28" fill="#fff" />
          <circle cx="120" cy="80" r="16" fill="#2563eb" />
          <circle cx="120" cy="80" r="8" fill="#0f172a" />
          <circle cx="126" cy="74" r="3" fill="#fff" />
        </Frame>
      );
    case "ear":
      return (
        <Frame label={label}>
          <path fill="#fdba74" d="M132 28c28 8 40 36 36 64-4 28-22 48-40 52-6 2-8-6-4-10 10-8 16-22 16-36 0-4 2-8 6-8 10 0 16-14 12-26-6-16-8-36-26-36z" />
          <path fill="none" stroke="#9a3412" strokeWidth="6" strokeLinecap="round" d="M118 40c22 4 34 24 30 46-4 18-16 30-28 36" />
          <path fill="none" stroke="#9a3412" strokeWidth="5" strokeLinecap="round" d="M124 58c12 4 16 16 10 26-6 10-8 16-4 28" />
          <path fill="#fdba74" d="M96 118c8 16 28 22 40 10 4-4-2-10-10-8-8 2-16-2-18-10-2-6-8-4-12 8z" />
        </Frame>
      );
    case "hand":
      return (
        <Frame label={label}>
          <g fill="#fdba74">
            <rect x="78" y="72" width="96" height="64" rx="26" />
            <rect x="84" y="34" width="18" height="56" rx="9" />
            <rect x="106" y="22" width="18" height="68" rx="9" />
            <rect x="128" y="30" width="18" height="60" rx="9" />
            <rect x="150" y="42" width="16" height="48" rx="8" />
            <ellipse cx="64" cy="96" rx="16" ry="24" transform="rotate(-35 64 96)" />
          </g>
        </Frame>
      );
    case "foot":
      return (
        <Frame label={label}>
          <g fill="#fdba74">
            <ellipse cx="128" cy="108" rx="62" ry="28" />
            <ellipse cx="78" cy="86" rx="14" ry="18" />
            <ellipse cx="104" cy="68" rx="14" ry="20" />
            <ellipse cx="132" cy="62" rx="14" ry="20" />
            <ellipse cx="158" cy="70" rx="13" ry="18" />
            <ellipse cx="180" cy="86" rx="12" ry="16" />
          </g>
        </Frame>
      );
    case "skull":
      return (
        <Frame label={label}>
          <path fill="#e7e5e4" d="M120 22c40 0 66 28 66 64 0 28-16 46-36 52v14H90v-14c-20-6-36-24-36-52 0-36 26-64 66-64z" />
          <ellipse cx="96" cy="78" rx="16" ry="18" fill="#0f172a" />
          <ellipse cx="144" cy="78" rx="16" ry="18" fill="#0f172a" />
          <path fill="#0f172a" d="M112 96c4 10 12 10 16 0 2 8-4 16-8 16s-10-8-8-16z" />
          <path fill="#fff" d="M92 132h8v10h-8zM104 132h8v10h-8zM116 132h8v10h-8zM128 132h8v10h-8zM140 132h8v10h-8z" />
        </Frame>
      );
    case "spine":
      return (
        <Frame label={label}>
          {[28, 48, 68, 88, 108, 128].map((y) => (
            <g key={y}>
              <rect x="96" y={y} width="48" height="14" rx="6" fill="#d6d3d1" stroke="#57534e" strokeWidth="2" />
              <rect x="114" y={y + 2} width="12" height="10" rx="2" fill="#a8a29e" />
              <path d={`M120 ${y + 14} l8 8 h-16z`} fill="#a8a29e" />
            </g>
          ))}
        </Frame>
      );
    case "ribs":
      return (
        <Frame label={label}>
          <path fill="#d6d3d1" stroke="#57534e" strokeWidth="3" d="M108 24h24v112h-24z" />
          {[40, 58, 76, 94, 112].map((y) => (
            <g key={y}>
              <path d={`M108 ${y}c-28 8-48 8-64-6`} fill="none" stroke="#a8a29e" strokeWidth="7" strokeLinecap="round" />
              <path d={`M132 ${y}c28 8 48 8 64-6`} fill="none" stroke="#a8a29e" strokeWidth="7" strokeLinecap="round" />
            </g>
          ))}
        </Frame>
      );
    case "bladder":
      return (
        <Frame label={label}>
          <path fill="#f9a8d4" d="M120 36c34 0 58 28 58 58 0 28-24 48-58 48s-58-20-58-48c0-30 24-58 58-58z" />
          <path fill="none" stroke="#9d174d" strokeWidth="4" strokeLinecap="round" d="M78 48c12 10 18 16 18 28M162 48c-12 10-18 16-18 28M120 112v28" />
        </Frame>
      );
    case "pancreas":
      return (
        <Frame label={label}>
          <path fill="#f59e0b" d="M46 96c8-28 36-40 58-28 16 8 20 6 36-4 22-14 48-8 58 10 8 16 2 30-12 36-20 8-28 4-46 12-22 10-40 8-58-2-16-8-28-10-36-24z" />
          <circle cx="62" cy="90" r="6" fill="#b45309" />
          <circle cx="108" cy="78" r="5" fill="#b45309" />
          <circle cx="156" cy="74" r="5" fill="#b45309" />
        </Frame>
      );
    case "spleen":
      return (
        <Frame label={label}>
          <path fill="#7c3aed" d="M150 36c28 8 40 40 28 68-10 24-36 36-62 30-18-4-22-8-18-20 6-16-8-20-20-14-16 8-34-4-36-22-2-22 16-40 40-46 20-6 44-4 68 4z" />
          <path fill="#5b21b6" d="M118 70c16 4 22 16 16 28-2-10-10-16-22-16 2-6 4-10 6-12z" />
        </Frame>
      );
    case "diaphragm":
      return (
        <Frame label={label}>
          <path fill="#fb7185" d="M28 108c28-48 156-48 184 0-8 16-28 22-46 16-10-4-16-4-26 2-12 8-24 8-36 0-10-6-16-6-26-2-18 6-38 0-50-16z" />
          <path fill="none" stroke="#9f1239" strokeWidth="3" d="M36 104c30-40 140-40 168 0" />
          <path fill="#e11d48" d="M108 96h24l8 28h-40z" />
        </Frame>
      );
    case "teeth":
      return (
        <Frame label={label}>
          {[46, 78, 110, 142, 174].map((x, index) => (
            <path
              key={x}
              fill="#fff"
              stroke="#94a3b8"
              strokeWidth="3"
              d={`M${x} ${index === 2 ? 28 : 40}h22c4 0 8 6 8 16 0 16-4 28-8 36-2 6-6 8-11 8s-9-2-11-8c-4-8-8-20-8-36 0-10 4-16 8-16z`}
            />
          ))}
          <path fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" d="M40 108c30 28 130 28 160 0" />
        </Frame>
      );
    default:
      return null;
  }
}

export function OrganPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof ORGANS)[number]["title"]);
  if (!id) return null;
  return picture(id, `Answer: ${name}`);
}
