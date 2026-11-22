import React, { type ReactNode } from "react";
import { APPLIANCES, type ApplianceId } from "@/lib/draw-the-appliance/appliances";

const TITLES = new Map(APPLIANCES.map((appliance) => [appliance.title, appliance.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: ApplianceId, label: string) {
  switch (id) {
    case "fridge":
      return (
        <Frame label={label}>
          <rect x="78" y="18" width="84" height="124" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <path stroke="#64748b" strokeWidth="3" d="M82 78h76" />
          <rect x="148" y="36" width="6" height="22" rx="2" fill="#334155" />
          <rect x="148" y="92" width="6" height="28" rx="2" fill="#334155" />
        </Frame>
      );
    case "freezer":
      return (
        <Frame label={label}>
          <rect x="42" y="48" width="156" height="78" rx="8" fill="#f1f5f9" stroke="#64748b" strokeWidth="4" />
          <path stroke="#94a3b8" strokeWidth="8" d="M54 62h132" />
          <rect x="108" y="70" width="24" height="8" rx="2" fill="#334155" />
        </Frame>
      );
    case "washing-machine":
      return (
        <Frame label={label}>
          <rect x="58" y="28" width="124" height="112" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <circle cx="120" cy="92" r="32" fill="#cbd5e1" stroke="#334155" strokeWidth="6" />
          <circle cx="120" cy="92" r="16" fill="#94a3b8" />
          <circle cx="78" cy="46" r="4" fill="#16a34a" />
          <circle cx="94" cy="46" r="4" fill="#dc2626" />
        </Frame>
      );
    case "tumble-dryer":
      return (
        <Frame label={label}>
          <rect x="62" y="24" width="116" height="116" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />
          <rect x="78" y="40" width="84" height="72" rx="6" fill="#fde68a" stroke="#b45309" strokeWidth="3" />
          <path stroke="#b45309" strokeWidth="3" d="M88 58h64M88 74h64M88 90h64" />
          <rect x="96" y="122" width="48" height="8" rx="2" fill="#92400e" />
        </Frame>
      );
    case "dishwasher":
      return (
        <Frame label={label}>
          <rect x="48" y="36" width="144" height="96" rx="6" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <path stroke="#94a3b8" strokeWidth="4" d="M60 58h120" />
          <rect x="156" y="72" width="8" height="36" rx="2" fill="#334155" />
        </Frame>
      );
    case "oven":
      return (
        <Frame label={label}>
          <rect x="54" y="28" width="132" height="112" rx="6" fill="#334155" />
          <circle cx="82" cy="48" r="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="114" cy="48" r="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="146" cy="48" r="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
          <rect x="70" y="68" width="100" height="58" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
          <rect x="108" y="88" width="8" height="22" rx="2" fill="#94a3b8" />
        </Frame>
      );
    case "microwave":
      return (
        <Frame label={label}>
          <rect x="36" y="40" width="168" height="84" rx="8" fill="#1e293b" />
          <rect x="48" y="52" width="96" height="60" rx="4" fill="#334155" stroke="#64748b" strokeWidth="3" />
          <circle cx="168" cy="64" r="4" fill="#22c55e" />
          <rect x="160" y="76" width="24" height="6" rx="2" fill="#64748b" />
          <rect x="160" y="88" width="24" height="6" rx="2" fill="#64748b" />
          <rect x="160" y="100" width="24" height="6" rx="2" fill="#64748b" />
        </Frame>
      );
    case "hob":
      return (
        <Frame label={label}>
          <rect x="36" y="48" width="168" height="64" rx="8" fill="#1e293b" />
          <circle cx="78" cy="80" r="16" fill="none" stroke="#94a3b8" strokeWidth="4" />
          <circle cx="162" cy="80" r="16" fill="none" stroke="#94a3b8" strokeWidth="4" />
          <circle cx="120" cy="68" r="10" fill="none" stroke="#64748b" strokeWidth="3" />
          <circle cx="120" cy="96" r="10" fill="none" stroke="#64748b" strokeWidth="3" />
        </Frame>
      );
    case "kettle":
      return (
        <Frame label={label}>
          <path fill="#0ea5e9" d="M78 52h70c8 0 16 10 16 24v28c0 18-14 32-34 32H96c-20 0-34-14-34-32V76c0-14 8-24 16-24z" />
          <path fill="#0284c7" d="M164 72c18 4 26 16 18 28-10-2-18-8-18-16z" />
          <path fill="none" stroke="#0369a1" strokeWidth="8" strokeLinecap="round" d="M86 58c-8-18 8-30 22-22" />
          <rect x="104" y="40" width="28" height="10" rx="3" fill="#334155" />
        </Frame>
      );
    case "toaster":
      return (
        <Frame label={label}>
          <rect x="58" y="58" width="124" height="64" rx="10" fill="#94a3b8" />
          <rect x="78" y="68" width="18" height="28" rx="3" fill="#1e293b" />
          <rect x="144" y="68" width="18" height="28" rx="3" fill="#1e293b" />
          <rect x="168" y="78" width="14" height="18" rx="3" fill="#334155" />
        </Frame>
      );
    case "blender":
      return (
        <Frame label={label}>
          <path fill="#7dd3fc" d="M92 28h56l10 62H82z" />
          <rect x="108" y="18" width="24" height="12" rx="3" fill="#334155" />
          <rect x="78" y="90" width="84" height="22" rx="6" fill="#334155" />
          <rect x="96" y="112" width="48" height="16" rx="4" fill="#1e293b" />
        </Frame>
      );
    case "coffee-maker":
      return (
        <Frame label={label}>
          <rect x="48" y="28" width="70" height="96" rx="6" fill="#1e293b" />
          <rect x="58" y="40" width="50" height="28" rx="3" fill="#334155" />
          <path fill="#e2e8f0" stroke="#64748b" strokeWidth="3" d="M118 78h48l-8 46H126z" />
          <path fill="#44403c" d="M136 70c8 0 12 6 8 12H130c0-8 2-12 6-12z" />
        </Frame>
      );
    case "vacuum":
      return (
        <Frame label={label}>
          <ellipse cx="78" cy="96" rx="36" ry="28" fill="#dc2626" />
          <path fill="none" stroke="#7f1d1d" strokeWidth="8" strokeLinecap="round" d="M104 84c28-8 40-28 62-36" />
          <rect x="158" y="36" width="36" height="14" rx="4" fill="#334155" />
          <circle cx="64" cy="118" r="8" fill="#1e293b" />
          <circle cx="96" cy="118" r="8" fill="#1e293b" />
        </Frame>
      );
    case "iron":
      return (
        <Frame label={label}>
          <path fill="#64748b" d="M46 108h132c8 0 18-10 18-20 0-16-20-28-48-28H92c-18 0-36 8-46 22-6 8-6 18 0 26z" />
          <path fill="#334155" d="M96 64c8-16 28-20 40-8-16 2-28 4-40 8z" />
          <path fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" d="M118 58c8-18 4-28-2-32" />
        </Frame>
      );
    case "hair-dryer":
      return (
        <Frame label={label}>
          <rect x="36" y="58" width="78" height="36" rx="18" fill="#7c3aed" />
          <path fill="#6d28d9" d="M108 52h28c22 0 36 14 36 28s-14 28-36 28h-28V52z" />
          <rect x="70" y="94" width="22" height="36" rx="8" fill="#5b21b6" />
        </Frame>
      );
    case "television":
      return (
        <Frame label={label}>
          <rect x="28" y="32" width="184" height="100" rx="8" fill="#0f172a" />
          <rect x="40" y="44" width="160" height="76" rx="4" fill="#1e293b" />
          <rect x="104" y="132" width="32" height="10" fill="#334155" />
          <rect x="84" y="142" width="72" height="6" rx="2" fill="#334155" />
        </Frame>
      );
    case "lamp":
      return (
        <Frame label={label}>
          <path fill="#fbbf24" d="M72 28h96l18 48H54z" />
          <rect x="114" y="76" width="12" height="48" fill="#92400e" />
          <ellipse cx="120" cy="132" rx="36" ry="10" fill="#78350f" />
        </Frame>
      );
    case "fan":
      return (
        <Frame label={label}>
          <circle cx="120" cy="68" r="40" fill="none" stroke="#64748b" strokeWidth="6" />
          <path fill="#94a3b8" d="M120 68l-8-34c16 4 24 16 8 34zM120 68l34 6c-2 16-14 24-34-6zM120 68l-26 22c-10-12-6-24 26-22z" />
          <circle cx="120" cy="68" r="6" fill="#334155" />
          <rect x="114" y="108" width="12" height="28" fill="#64748b" />
          <rect x="88" y="134" width="64" height="8" rx="3" fill="#334155" />
        </Frame>
      );
    case "heater":
      return (
        <Frame label={label}>
          <rect x="78" y="24" width="84" height="112" rx="8" fill="#b91c1c" />
          <path stroke="#fecaca" strokeWidth="3" d="M92 44h56M92 58h56M92 72h56M92 86h56M92 100h56" />
          <rect x="96" y="136" width="48" height="8" rx="2" fill="#7f1d1d" />
        </Frame>
      );
    case "air-conditioner":
      return (
        <Frame label={label}>
          <rect x="32" y="40" width="176" height="56" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <path stroke="#94a3b8" strokeWidth="4" d="M48 74h144" />
          <path stroke="#64748b" strokeWidth="3" d="M56 88h20M92 88h20M128 88h20M164 88h20" />
        </Frame>
      );
    case "sewing-machine":
      return (
        <Frame label={label}>
          <path fill="#e2e8f0" stroke="#334155" strokeWidth="4" d="M48 108h144v16H48zM56 48h70v60H56zM126 58h46v50h-46z" />
          <rect x="64" y="36" width="48" height="16" rx="4" fill="#334155" />
          <circle cx="86" cy="78" r="10" fill="#64748b" />
          <path stroke="#334155" strokeWidth="3" d="M148 108v-20" />
        </Frame>
      );
    case "radio":
      return (
        <Frame label={label}>
          <rect x="46" y="58" width="148" height="70" rx="10" fill="#f59e0b" />
          <circle cx="86" cy="93" r="18" fill="#44403c" />
          <circle cx="86" cy="93" r="6" fill="#fbbf24" />
          <rect x="122" y="78" width="52" height="8" rx="3" fill="#78350f" />
          <circle cx="132" cy="104" r="6" fill="#fff7ed" />
          <circle cx="156" cy="104" r="6" fill="#fff7ed" />
          <path stroke="#334155" strokeWidth="3" d="M168 58l22-24" />
        </Frame>
      );
    case "mixer":
      return (
        <Frame label={label}>
          <path fill="#334155" d="M70 36h28v70H78c-12 0-16-10-8-18V36z" />
          <rect x="86" y="28" width="36" height="22" rx="6" fill="#64748b" />
          <ellipse cx="132" cy="108" rx="40" ry="22" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <path stroke="#94a3b8" strokeWidth="4" d="M118 70v28" />
        </Frame>
      );
    case "juicer":
      return (
        <Frame label={label}>
          <path fill="#f97316" d="M120 36l18 28H102z" />
          <ellipse cx="120" cy="70" rx="28" ry="10" fill="#ea580c" />
          <path fill="#fdba74" d="M86 78h68l-8 36H94z" />
          <rect x="96" y="114" width="48" height="16" rx="4" fill="#9a3412" />
        </Frame>
      );
    case "rice-cooker":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="52" ry="22" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <path fill="#e2e8f0" stroke="#64748b" strokeWidth="4" d="M74 70c0-28 22-46 46-46s46 18 46 46v28H74z" />
          <ellipse cx="120" cy="70" rx="46" ry="14" fill="#cbd5e1" />
          <rect x="108" y="28" width="24" height="10" rx="3" fill="#334155" />
        </Frame>
      );
    case "slow-cooker":
      return (
        <Frame label={label}>
          <rect x="58" y="48" width="124" height="78" rx="28" fill="#7f1d1d" />
          <rect x="70" y="36" width="100" height="22" rx="8" fill="#44403c" />
          <rect x="108" y="28" width="24" height="12" rx="3" fill="#334155" />
          <circle cx="86" cy="92" r="6" fill="#fecaca" />
          <circle cx="154" cy="92" r="6" fill="#fecaca" />
        </Frame>
      );
    case "air-fryer":
      return (
        <Frame label={label}>
          <rect x="70" y="28" width="100" height="108" rx="16" fill="#1e293b" />
          <rect x="82" y="58" width="76" height="64" rx="10" fill="#334155" />
          <rect x="154" y="78" width="18" height="22" rx="4" fill="#64748b" />
          <circle cx="120" cy="44" r="6" fill="#22c55e" />
        </Frame>
      );
    case "waffle-maker":
      return (
        <Frame label={label}>
          <rect x="48" y="36" width="144" height="40" rx="8" fill="#b45309" />
          <rect x="48" y="84" width="144" height="40" rx="8" fill="#92400e" />
          <path stroke="#fde68a" strokeWidth="3" d="M68 56h104M68 104h104M88 44v24M120 44v24M152 44v24" />
          <rect x="176" y="48" width="22" height="10" rx="3" fill="#334155" />
        </Frame>
      );
    case "telephone":
      return (
        <Frame label={label}>
          <rect x="70" y="78" width="100" height="28" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
          <path fill="#334155" d="M58 48c-8 10-8 36 4 46 8-8 10-20 6-32 8-6 16-8 24-6-8-14-22-16-34-8z" />
          <path fill="#334155" d="M182 48c8 10 8 36-4 46-8-8-10-20-6-32-8-6-16-8-24-6 8-14 22-16 34-8z" />
        </Frame>
      );
    case "speaker":
      return (
        <Frame label={label}>
          <rect x="78" y="22" width="84" height="116" rx="8" fill="#1e293b" />
          <circle cx="120" cy="62" r="22" fill="#334155" stroke="#64748b" strokeWidth="4" />
          <circle cx="120" cy="108" r="12" fill="#334155" stroke="#64748b" strokeWidth="3" />
        </Frame>
      );
    case "clock":
      return (
        <Frame label={label}>
          <circle cx="120" cy="80" r="52" fill="#e2e8f0" stroke="#334155" strokeWidth="8" />
          <path stroke="#0f172a" strokeWidth="4" strokeLinecap="round" d="M120 80V48M120 80l22 16" />
          <circle cx="120" cy="80" r="4" fill="#dc2626" />
        </Frame>
      );
    case "printer":
      return (
        <Frame label={label}>
          <rect x="48" y="58" width="144" height="48" rx="6" fill="#64748b" />
          <rect x="64" y="40" width="112" height="24" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <rect x="70" y="106" width="100" height="16" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="168" cy="74" r="4" fill="#22c55e" />
        </Frame>
      );
    case "scales":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="58" ry="18" fill="#e2e8f0" stroke="#64748b" strokeWidth="4" />
          <rect x="108" y="78" width="24" height="24" fill="#94a3b8" />
          <circle cx="120" cy="58" r="22" fill="#e2e8f0" stroke="#334155" strokeWidth="4" />
          <path stroke="#dc2626" strokeWidth="3" d="M120 58l10-8" />
        </Frame>
      );
    case "bread-maker":
      return (
        <Frame label={label}>
          <rect x="70" y="28" width="100" height="108" rx="10" fill="#44403c" />
          <rect x="86" y="46" width="68" height="48" rx="4" fill="#fef3c7" stroke="#a8a29e" strokeWidth="3" />
          <rect x="96" y="108" width="48" height="10" rx="3" fill="#292524" />
        </Frame>
      );
    case "popcorn-maker":
      return (
        <Frame label={label}>
          <path fill="#fbbf24" d="M86 36c8-16 28-16 34 0 10-12 28-6 28 8 14 2 20 16 10 26H78c-12-8-8-24 8-34z" />
          <path fill="#f59e0b" d="M78 78h96l-12 48H90z" />
          <rect x="86" y="126" width="80" height="12" rx="4" fill="#92400e" />
        </Frame>
      );
    case "extractor":
      return (
        <Frame label={label}>
          <path fill="#64748b" d="M48 36h144l-18 48H66z" />
          <rect x="108" y="18" width="24" height="20" fill="#475569" />
          <path stroke="#334155" strokeWidth="3" d="M78 68h84M86 78h68" />
          <rect x="70" y="88" width="100" height="8" rx="2" fill="#334155" />
        </Frame>
      );
    default:
      return null;
  }
}

export function AppliancePicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof APPLIANCES)[number]["title"]);
  if (!id) return null;
  return picture(id, `Answer: ${name}`);
}
