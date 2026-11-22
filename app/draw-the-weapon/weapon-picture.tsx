import React, { type ReactNode } from "react";
import { WEAPONS, type WeaponId } from "@/lib/draw-the-weapon/weapons";

const TITLES = new Map(WEAPONS.map((weapon) => [weapon.title, weapon.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: WeaponId, label: string) {
  switch (id) {
    case "tank":
      return (
        <Frame label={label}>
          <rect x="36" y="96" width="150" height="32" rx="10" fill="#334155" />
          {[52, 78, 104, 130, 156].map((x) => (
            <circle key={x} cx={x} cy="112" r="8" fill="#94a3b8" />
          ))}
          <path d="M48 96 L64 72 H150 L168 96 Z" fill="#4d7c0f" />
          <ellipse cx="118" cy="68" rx="28" ry="16" fill="#3f6212" />
          <rect x="140" y="60" width="72" height="8" rx="2" fill="#1e293b" />
        </Frame>
      );
    case "missile":
      return (
        <Frame label={label}>
          <polygon points="120,16 108,48 132,48" fill="#64748b" />
          <rect x="108" y="46" width="24" height="70" fill="#94a3b8" />
          <polygon points="108,90 88,118 108,108" fill="#334155" />
          <polygon points="132,90 152,118 132,108" fill="#334155" />
          <polygon points="112,116 120,146 128,116" fill="#f97316" />
          <polygon points="116,116 120,136 124,116" fill="#fde68a" />
        </Frame>
      );
    case "fighter":
      return (
        <Frame label={label}>
          <polygon points="28,78 150,70 188,62 196,74 150,82 28,90" fill="#64748b" />
          <polygon points="90,76 70,40 120,72" fill="#475569" />
          <polygon points="168,70 188,36 176,70" fill="#334155" />
          <polygon points="150,78 210,92 168,84" fill="#475569" />
          <circle cx="56" cy="78" r="4" fill="#7dd3fc" />
        </Frame>
      );
    case "helicopter":
      return (
        <Frame label={label}>
          <rect x="28" y="62" width="130" height="6" rx="2" fill="#1e293b" />
          <rect x="90" y="66" width="6" height="16" fill="#334155" />
          <ellipse cx="96" cy="96" rx="36" ry="16" fill="#4d7c0f" />
          <path d="M128 96 H196 L184 108 H140 Z" fill="#3f6212" />
          <rect x="188" y="86" width="16" height="4" fill="#1e293b" />
          <circle cx="78" cy="92" r="6" fill="#7dd3fc" />
        </Frame>
      );
    case "submarine":
      return (
        <Frame label={label}>
          <rect x="0" y="108" width="240" height="52" fill="#0284c7" />
          <ellipse cx="120" cy="100" rx="86" ry="22" fill="#334155" />
          <rect x="108" y="62" width="28" height="24" rx="4" fill="#475569" />
          <rect x="118" y="40" width="4" height="26" fill="#1e293b" />
          <rect x="128" y="48" width="16" height="3" fill="#1e293b" />
        </Frame>
      );
    case "carrier":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#0284c7" />
          <path d="M24 118 L40 86 H210 L196 118 Z" fill="#64748b" />
          <rect x="168" y="62" width="22" height="28" fill="#334155" />
          <rect x="172" y="54" width="8" height="12" fill="#1e293b" />
          <polygon points="56,92 78,86 78,96" fill="#94a3b8" />
          <polygon points="96,92 118,86 118,96" fill="#94a3b8" />
          <rect x="40" y="82" width="170" height="6" fill="#1e293b" />
        </Frame>
      );
    case "battleship":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#0284c7" />
          <path d="M28 118 L48 92 H196 L214 118 Z" fill="#475569" />
          <rect x="70" y="78" width="22" height="16" fill="#334155" />
          <rect x="86" y="82" width="28" height="4" fill="#1e293b" />
          <rect x="120" y="74" width="28" height="20" fill="#334155" />
          <rect x="108" y="80" width="22" height="4" fill="#1e293b" />
          <rect x="156" y="70" width="16" height="28" fill="#1e293b" />
          <rect x="176" y="84" width="18" height="12" fill="#334155" />
        </Frame>
      );
    case "rifle":
      return (
        <Frame label={label}>
          <path d="M36 96 L70 86 H150 L168 78 H210 V86 H168 L150 94 H78 L48 108 Z" fill="#78350f" />
          <rect x="150" y="74" width="62" height="6" fill="#1e293b" />
          <rect x="78" y="78" width="28" height="12" rx="2" fill="#334155" />
          <rect x="96" y="68" width="4" height="12" fill="#1e293b" />
        </Frame>
      );
    case "pistol":
      return (
        <Frame label={label}>
          <rect x="48" y="62" width="110" height="22" rx="4" fill="#334155" />
          <path d="M70 84 H108 L96 128 H78 Z" fill="#1e293b" />
          <rect x="150" y="66" width="28" height="8" fill="#64748b" />
          <rect x="86" y="70" width="16" height="6" fill="#94a3b8" />
        </Frame>
      );
    case "machine-gun":
      return (
        <Frame label={label}>
          <polygon points="120,108 78,140 96,140" fill="#334155" />
          <polygon points="120,108 162,140 144,140" fill="#334155" />
          <rect x="70" y="78" width="120" height="16" rx="3" fill="#1e293b" />
          <rect x="176" y="82" width="36" height="8" fill="#475569" />
          <rect x="86" y="70" width="18" height="12" fill="#334155" />
          <circle cx="120" cy="108" r="6" fill="#64748b" />
        </Frame>
      );
    case "cannon":
      return (
        <Frame label={label}>
          <circle cx="78" cy="112" r="22" fill="#78350f" />
          <circle cx="78" cy="112" r="8" fill="#451a03" />
          <circle cx="150" cy="112" r="22" fill="#78350f" />
          <circle cx="150" cy="112" r="8" fill="#451a03" />
          <rect x="70" y="96" width="90" height="10" fill="#334155" />
          <rect x="108" y="62" width="70" height="18" rx="8" fill="#1e293b" transform="rotate(-18 108 71)" />
        </Frame>
      );
    case "howitzer":
      return (
        <Frame label={label}>
          <path d="M70 130 L40 148 H90 Z" fill="#334155" />
          <path d="M150 130 L200 148 H130 Z" fill="#334155" />
          <rect x="86" y="108" width="70" height="14" fill="#475569" />
          <rect x="100" y="70" width="78" height="12" rx="3" fill="#1e293b" transform="rotate(-28 100 76)" />
          <circle cx="108" cy="112" r="10" fill="#64748b" />
        </Frame>
      );
    case "mortar":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="132" rx="36" ry="10" fill="#334155" />
          <rect x="108" y="48" width="16" height="78" rx="4" fill="#4d7c0f" transform="rotate(-18 116 90)" />
          <path d="M96 100 L70 128" stroke="#1e293b" strokeWidth="4" />
          <path d="M132 96 L168 124" stroke="#1e293b" strokeWidth="4" />
        </Frame>
      );
    case "grenade":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="96" rx="32" ry="40" fill="#3f6212" />
          <path stroke="#1e293b" strokeWidth="3" d="M96 80 H144 M96 96 H144 M96 112 H144 M108 64 V128 M132 64 V128" />
          <rect x="108" y="46" width="24" height="14" rx="3" fill="#64748b" />
          <path d="M132 48 Q156 36 148 24" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <circle cx="148" cy="22" r="4" fill="#94a3b8" />
        </Frame>
      );
    case "rocket-launcher":
      return (
        <Frame label={label}>
          <rect x="36" y="68" width="150" height="28" rx="12" fill="#4d7c0f" />
          <ellipse cx="186" cy="82" rx="10" ry="14" fill="#3f6212" />
          <polygon points="36,82 16,74 16,90" fill="#94a3b8" />
          <path d="M90 96 L78 128 H108 Z" fill="#334155" />
          <rect x="120" y="92" width="16" height="28" fill="#1e293b" />
        </Frame>
      );
    case "torpedo":
      return (
        <Frame label={label}>
          <rect x="0" y="108" width="240" height="52" fill="#0284c7" />
          <ellipse cx="120" cy="96" rx="78" ry="18" fill="#64748b" />
          <polygon points="198,96 220,84 220,108" fill="#94a3b8" />
          <path d="M48 84 L36 78 M48 108 L36 114" stroke="#334155" strokeWidth="4" />
          <circle cx="150" cy="96" r="4" fill="#1e293b" />
        </Frame>
      );
    case "bomber":
      return (
        <Frame label={label}>
          <polygon points="24,80 96,72 168,72 206,62 214,80 206,98 168,88 96,88" fill="#64748b" />
          <rect x="70" y="62" width="120" height="10" fill="#334155" />
          <rect x="70" y="90" width="120" height="10" fill="#334155" />
          <rect x="86" y="50" width="18" height="16" rx="3" fill="#1e293b" />
          <rect x="140" y="50" width="18" height="16" rx="3" fill="#1e293b" />
          <polygon points="176,70 210,36 194,74" fill="#475569" />
          <circle cx="48" cy="80" r="5" fill="#7dd3fc" />
        </Frame>
      );
    case "stealth":
      return (
        <Frame label={label}>
          <polygon points="120,36 28,118 70,108 120,92 170,108 212,118" fill="#1e293b" />
          <polygon points="120,70 96,108 144,108" fill="#334155" />
          <polygon points="108,48 120,70 132,48" fill="#475569" />
        </Frame>
      );
    case "drone":
      return (
        <Frame label={label}>
          <polygon points="120,48 36,96 78,90 120,78 162,90 204,96" fill="#64748b" />
          <circle cx="120" cy="108" r="10" fill="#1e293b" />
          <rect x="116" y="78" width="8" height="22" fill="#334155" />
          <circle cx="120" cy="62" r="5" fill="#0ea5e9" />
        </Frame>
      );
    case "apc":
      return (
        <Frame label={label}>
          <rect x="40" y="100" width="156" height="28" rx="6" fill="#334155" />
          {[58, 86, 114, 142, 170].map((x) => (
            <circle key={x} cx={x} cy="116" r="7" fill="#94a3b8" />
          ))}
          <rect x="52" y="68" width="120" height="34" fill="#4d7c0f" />
          <rect x="64" y="76" width="22" height="12" fill="#7dd3fc" />
          <rect x="140" y="58" width="22" height="14" fill="#3f6212" />
        </Frame>
      );
    case "jeep":
      return (
        <Frame label={label}>
          <circle cx="72" cy="118" r="16" fill="#1e293b" />
          <circle cx="168" cy="118" r="16" fill="#1e293b" />
          <path d="M48 108 L64 78 H150 L176 90 V108 Z" fill="#4d7c0f" />
          <path d="M78 80 H132 L140 96 H72 Z" fill="#7dd3fc" />
          <circle cx="186" cy="86" r="10" fill="#334155" />
        </Frame>
      );
    case "humvee":
      return (
        <Frame label={label}>
          <circle cx="70" cy="120" r="16" fill="#1e293b" />
          <circle cx="170" cy="120" r="16" fill="#1e293b" />
          <path d="M36 112 L48 86 H110 L132 64 H188 L204 88 V112 Z" fill="#3f6212" />
          <path d="M116 70 H168 L180 90 H124 Z" fill="#0ea5e9" />
          <rect x="48" y="92" width="28" height="12" fill="#14532d" />
        </Frame>
      );
    case "destroyer":
      return (
        <Frame label={label}>
          <rect x="0" y="120" width="240" height="40" fill="#0284c7" />
          <path d="M36 120 L56 96 H200 L214 120 Z" fill="#64748b" />
          <rect x="70" y="84" width="18" height="14" fill="#334155" />
          <rect x="82" y="88" width="20" height="4" fill="#1e293b" />
          <rect x="130" y="62" width="6" height="36" fill="#1e293b" />
          <circle cx="148" cy="74" r="10" fill="#94a3b8" />
          <rect x="160" y="86" width="22" height="12" fill="#475569" />
        </Frame>
      );
    case "propeller":
      return (
        <Frame label={label}>
          <ellipse cx="150" cy="82" rx="48" ry="12" fill="#64748b" />
          <polygon points="190,82 214,70 206,82 214,94" fill="#475569" />
          <polygon points="120,78 70,48 140,78" fill="#334155" />
          <polygon points="168,74 188,46 176,76" fill="#1e293b" />
          <ellipse cx="104" cy="82" rx="10" ry="14" fill="#78350f" />
          <rect x="100" y="64" width="4" height="36" fill="#94a3b8" />
        </Frame>
      );
    case "anti-aircraft":
      return (
        <Frame label={label}>
          <rect x="70" y="124" width="100" height="10" fill="#334155" />
          <circle cx="90" cy="124" r="10" fill="#1e293b" />
          <circle cx="150" cy="124" r="10" fill="#1e293b" />
          {[96, 108, 120, 132].map((x) => (
            <rect key={x} x={x} y="36" width="6" height="70" rx="2" fill="#475569" transform={`rotate(-8 ${x} 100)`} />
          ))}
        </Frame>
      );
    case "missile-truck":
      return (
        <Frame label={label}>
          <circle cx="58" cy="122" r="14" fill="#1e293b" />
          <circle cx="150" cy="122" r="14" fill="#1e293b" />
          <rect x="36" y="96" width="48" height="28" fill="#4d7c0f" />
          <rect x="84" y="104" width="90" height="18" fill="#334155" />
          {[0, 1, 2, 3].map((index) => (
            <rect key={index} x={96 + index * 16} y="62" width="10" height="48" rx="2" fill="#64748b" transform="rotate(-24 120 100)" />
          ))}
        </Frame>
      );
    case "depth-charge":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#0284c7" />
          <rect x="96" y="36" width="48" height="78" rx="8" fill="#334155" />
          <rect x="96" y="52" width="48" height="8" fill="#94a3b8" />
          <rect x="96" y="88" width="48" height="8" fill="#94a3b8" />
          <path d="M108 28 Q120 16 132 28" stroke="#64748b" strokeWidth="4" fill="none" />
        </Frame>
      );
    case "naval-mine":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#0284c7" />
          <circle cx="120" cy="86" r="32" fill="#334155" />
          <polygon points="120,40 112,58 128,58" fill="#1e293b" />
          <polygon points="168,70 150,82 164,90" fill="#1e293b" />
          <polygon points="72,70 90,82 76,90" fill="#1e293b" />
          <polygon points="156,112 140,100 152,96" fill="#1e293b" />
          <polygon points="84,112 100,100 88,96" fill="#1e293b" />
        </Frame>
      );
    case "helmet":
      return (
        <Frame label={label}>
          <path d="M48 100 Q48 40 120 40 Q192 40 192 100 Z" fill="#4d7c0f" />
          <path d="M40 96 H200 Q190 112 120 112 Q50 112 40 96 Z" fill="#3f6212" />
          <path d="M96 108 Q120 128 144 108" stroke="#1e293b" strokeWidth="4" fill="none" />
        </Frame>
      );
    case "bomb":
      return (
        <Frame label={label}>
          <ellipse cx="108" cy="88" rx="40" ry="48" fill="#334155" />
          <rect x="140" y="70" width="28" height="36" fill="#475569" />
          <polygon points="168,70 196,58 168,82" fill="#64748b" />
          <polygon points="168,106 196,118 168,94" fill="#64748b" />
          <rect x="96" y="48" width="10" height="16" fill="#94a3b8" />
        </Frame>
      );
    case "bayonet":
      return (
        <Frame label={label}>
          <polygon points="150,28 168,120 132,120" fill="#cbd5e1" />
          <rect x="136" y="116" width="28" height="8" fill="#78350f" />
          <rect x="144" y="124" width="12" height="22" rx="2" fill="#334155" />
          <circle cx="150" cy="128" r="3" fill="#94a3b8" />
        </Frame>
      );
    case "flamethrower":
      return (
        <Frame label={label}>
          <rect x="48" y="70" width="36" height="56" rx="8" fill="#334155" />
          <rect x="88" y="78" width="22" height="40" rx="6" fill="#475569" />
          <path d="M100 86 H150 L168 96" stroke="#1e293b" strokeWidth="6" fill="none" />
          <polygon points="164,90 210,78 206,108 168,102" fill="#f97316" />
          <polygon points="176,94 198,88 194,104" fill="#fde68a" />
        </Frame>
      );
    case "half-track":
      return (
        <Frame label={label}>
          <circle cx="62" cy="116" r="16" fill="#1e293b" />
          <rect x="96" y="96" width="100" height="28" rx="8" fill="#334155" />
          {[112, 136, 160, 180].map((x) => (
            <circle key={x} cx={x} cy="112" r="7" fill="#94a3b8" />
          ))}
          <path d="M40 104 L56 72 H120 L132 96 H48 Z" fill="#4d7c0f" />
          <path d="M70 76 H108 L114 92 H66 Z" fill="#7dd3fc" />
        </Frame>
      );
    case "landing-craft":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#0284c7" />
          <path d="M70 118 H200 L188 78 H96 Z" fill="#64748b" />
          <path d="M96 78 L40 118 H96 Z" fill="#94a3b8" />
          <rect x="120" y="86" width="40" height="16" fill="#334155" />
        </Frame>
      );
    case "radar":
      return (
        <Frame label={label}>
          <rect x="70" y="128" width="100" height="12" fill="#334155" />
          <rect x="116" y="70" width="8" height="60" fill="#1e293b" />
          <path d="M48 78 Q120 20 192 78 L168 86 Q120 46 72 86 Z" fill="#64748b" />
          <circle cx="120" cy="74" r="6" fill="#0ea5e9" />
        </Frame>
      );
    case "biplane":
      return (
        <Frame label={label}>
          <ellipse cx="130" cy="84" rx="52" ry="10" fill="#78350f" />
          <rect x="70" y="58" width="100" height="8" fill="#334155" />
          <rect x="70" y="100" width="100" height="8" fill="#334155" />
          <rect x="108" y="62" width="4" height="46" fill="#1e293b" />
          <rect x="150" y="62" width="4" height="46" fill="#1e293b" />
          <polygon points="176,84 204,68 196,84 204,100" fill="#475569" />
          <ellipse cx="80" cy="84" rx="10" ry="12" fill="#64748b" />
        </Frame>
      );
    default:
      return null;
  }
}

export function WeaponPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof WEAPONS)[number]["title"]);
  if (!id) return null;
  return picture(id, name);
}
