import React, { type ReactNode } from "react";
import { FEATURES, type FeatureId } from "@/lib/draw-the-geography/features";

const TITLES = new Map(FEATURES.map((feature) => [feature.title, feature.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: FeatureId, label: string) {
  switch (id) {
    case "scree":
      return (
        <Frame label={label}>
          <polygon points="20,24 130,24 150,150 16,150" fill="#78716c" />
          <polygon points="128,36 214,148 78,148" fill="#a8a29e" />
          {[
            [150, 70],
            [170, 96],
            [140, 108],
            [186, 124],
            [120, 132],
            [160, 138],
          ].map(([x, y]) => (
            <polygon key={`${x}-${y}`} points={`${x},${y} ${x! + 10},${y! + 8} ${x! - 8},${y! + 10}`} fill="#57534e" />
          ))}
        </Frame>
      );
    case "pyramid-peak":
      return (
        <Frame label={label}>
          <polygon points="120,16 28,148 212,148" fill="#94a3b8" />
          <polygon points="120,16 212,148 120,90" fill="#64748b" />
          <polygon points="120,16 96,58 144,58" fill="#e2e8f0" />
          <path d="M120 16 L120 148" stroke="#334155" strokeWidth="3" />
        </Frame>
      );
    case "hanging-valley":
      return (
        <Frame label={label}>
          <polygon points="0,36 92,36 92,78 70,108 0,108" fill="#4d7c0f" />
          <polygon points="150,48 240,48 240,150 118,150 108,108 150,78" fill="#65a30d" />
          <polygon points="92,78 150,78 140,130 100,130" fill="#78716c" />
          <path d="M128 78 C140 100 132 120 124 142" stroke="#0284c7" strokeWidth="7" fill="none" />
          <path d="M124 142 H210" stroke="#0284c7" strokeWidth="5" />
        </Frame>
      );
    case "v-valley":
      return (
        <Frame label={label}>
          <polygon points="0,28 108,150 0,150" fill="#4d7c0f" />
          <polygon points="240,28 132,150 240,150" fill="#65a30d" />
          <path d="M108 146 H132" stroke="#0284c7" strokeWidth="6" />
        </Frame>
      );
    case "u-valley":
      return (
        <Frame label={label}>
          <path d="M0 24 H62 V78 Q120 132 178 78 V24 H240 V160 H0 Z" fill="#4d7c0f" />
          <path d="M96 124 H144" stroke="#0284c7" strokeWidth="5" />
        </Frame>
      );
    case "arete":
      return (
        <Frame label={label}>
          <polygon points="16,140 120,22 120,150" fill="#94a3b8" />
          <polygon points="224,140 120,22 120,150" fill="#64748b" />
          <path d="M120 22 L120 150" stroke="#e2e8f0" strokeWidth="3" />
        </Frame>
      );
    case "clouds":
      return (
        <Frame label={label}>
          <ellipse cx="78" cy="78" rx="36" ry="22" fill="#cbd5e1" />
          <ellipse cx="58" cy="84" rx="20" ry="14" fill="#e2e8f0" />
          <ellipse cx="100" cy="86" rx="22" ry="14" fill="#e2e8f0" />
          <ellipse cx="168" cy="64" rx="32" ry="18" fill="#cbd5e1" />
          <ellipse cx="150" cy="70" rx="16" ry="12" fill="#e2e8f0" />
          <ellipse cx="186" cy="72" rx="18" ry="12" fill="#e2e8f0" />
          <ellipse cx="120" cy="112" rx="40" ry="18" fill="#94a3b8" />
          <ellipse cx="96" cy="116" rx="18" ry="12" fill="#cbd5e1" />
        </Frame>
      );
    case "cirrus":
      return (
        <Frame label={label}>
          <path d="M24 48 C70 36 90 70 140 52 C170 42 190 58 220 46" stroke="#94a3b8" strokeWidth="6" fill="none" />
          <path d="M30 78 C80 64 110 96 160 80 C190 70 200 86 222 74" stroke="#cbd5e1" strokeWidth="5" fill="none" />
          <path d="M40 108 C90 96 120 124 170 110 C196 100 210 116 226 104" stroke="#94a3b8" strokeWidth="4" fill="none" />
        </Frame>
      );
    case "stratus":
      return (
        <Frame label={label}>
          <rect x="16" y="36" width="208" height="18" rx="6" fill="#cbd5e1" />
          <rect x="16" y="62" width="208" height="16" rx="6" fill="#94a3b8" />
          <rect x="16" y="86" width="208" height="18" rx="6" fill="#cbd5e1" />
          <rect x="16" y="112" width="208" height="14" rx="6" fill="#64748b" />
        </Frame>
      );
    case "cumulonimbus":
      return (
        <Frame label={label}>
          <path d="M36 58 H150 Q176 58 176 78 H204 Q214 96 190 100 H48 Q24 96 36 74 Z" fill="#94a3b8" />
          <ellipse cx="100" cy="96" rx="48" ry="28" fill="#64748b" />
          <ellipse cx="140" cy="90" rx="36" ry="24" fill="#475569" />
          <path d="M86 118 L78 146 M110 120 L104 150 M134 118 L142 148" stroke="#0284c7" strokeWidth="4" />
        </Frame>
      );
    case "corrie":
      return (
        <Frame label={label}>
          <path d="M16 130 L40 40 H150 L210 130 Z" fill="#78716c" />
          <path d="M70 130 Q120 70 176 130" fill="#a8a29e" />
          <path d="M86 118 Q120 88 160 118" fill="#4d7c0f" />
        </Frame>
      );
    case "tarn":
      return (
        <Frame label={label}>
          <path d="M16 140 L36 36 H160 L214 140 Z" fill="#78716c" />
          <path d="M64 128 Q120 62 184 128" fill="#a8a29e" />
          <ellipse cx="124" cy="112" rx="36" ry="14" fill="#0284c7" />
        </Frame>
      );
    case "truncated-spur":
      return (
        <Frame label={label}>
          <path d="M0 30 H46 V70 H0 Z" fill="#4d7c0f" />
          <path d="M46 30 H92 V100 H46 Z" fill="#65a30d" />
          <path d="M148 24 H194 V96 H148 Z" fill="#4d7c0f" />
          <path d="M194 24 H240 V64 H194 Z" fill="#65a30d" />
          <rect x="46" y="100" width="148" height="40" fill="#84cc16" />
          <path d="M70 124 H170" stroke="#0284c7" strokeWidth="5" />
        </Frame>
      );
    case "ribbon-lake":
      return (
        <Frame label={label}>
          <path d="M0 20 H70 V70 Q120 120 170 70 V20 H240 V160 H0 Z" fill="#4d7c0f" />
          <ellipse cx="120" cy="108" rx="28" ry="36" fill="#0284c7" />
        </Frame>
      );
    case "moraine":
      return (
        <Frame label={label}>
          <path d="M0 70 H70 L120 110 H240 V160 H0 Z" fill="#65a30d" />
          <path d="M40 70 L90 40 H150 L190 80 L150 70 H90 Z" fill="#bae6fd" />
          <path d="M70 96 Q120 70 180 108 Q140 128 90 116 Z" fill="#a8a29e" />
          <circle cx="100" cy="104" r="5" fill="#57534e" />
          <circle cx="130" cy="98" r="4" fill="#57534e" />
          <circle cx="150" cy="110" r="5" fill="#44403c" />
        </Frame>
      );
    case "glacier":
      return (
        <Frame label={label}>
          <polygon points="0,40 70,20 90,150 0,150" fill="#4d7c0f" />
          <polygon points="240,30 160,24 150,150 240,150" fill="#65a30d" />
          <path d="M78 36 Q120 20 162 40 L150 140 Q120 150 90 136 Z" fill="#bae6fd" />
          <path stroke="#0284c7" strokeWidth="3" d="M100 60 H140 M96 84 H146 M104 108 H138" />
        </Frame>
      );
    case "waterfall":
      return (
        <Frame label={label}>
          <polygon points="0,40 90,40 90,150 0,150" fill="#4d7c0f" />
          <polygon points="150,70 240,70 240,150 150,150" fill="#65a30d" />
          <rect x="90" y="40" width="60" height="70" fill="#78716c" />
          <path d="M40 48 H108" stroke="#0284c7" strokeWidth="6" />
          <path d="M112 48 V112" stroke="#38bdf8" strokeWidth="10" />
          <ellipse cx="118" cy="124" rx="28" ry="12" fill="#0284c7" />
        </Frame>
      );
    case "meander":
      return (
        <Frame label={label}>
          <rect x="0" y="30" width="240" height="110" fill="#84cc16" />
          <path d="M10 90 C50 30 90 130 130 70 C160 30 190 120 230 80" stroke="#0284c7" strokeWidth="12" fill="none" />
        </Frame>
      );
    case "oxbow":
      return (
        <Frame label={label}>
          <rect x="0" y="28" width="240" height="112" fill="#84cc16" />
          <path d="M30 70 C50 40 100 40 110 78 C120 116 170 116 190 78" stroke="#0284c7" strokeWidth="10" fill="none" />
          <path d="M20 100 H220" stroke="#0369a1" strokeWidth="6" />
        </Frame>
      );
    case "delta":
      return (
        <Frame label={label}>
          <rect x="0" y="90" width="240" height="70" fill="#0284c7" />
          <polygon points="70,90 170,90 140,150 100,150" fill="#d6d3d1" />
          <path d="M120 16 V90" stroke="#0369a1" strokeWidth="8" />
          <path d="M120 90 L90 140 M120 90 L120 146 M120 90 L150 140" stroke="#0369a1" strokeWidth="4" />
        </Frame>
      );
    case "gorge":
      return (
        <Frame label={label}>
          <polygon points="0,20 100,20 108,150 0,150" fill="#78716c" />
          <polygon points="240,20 140,20 132,150 240,150" fill="#57534e" />
          <path d="M108 146 H132" stroke="#0284c7" strokeWidth="5" />
          <path stroke="#a8a29e" strokeWidth="3" d="M20 50 H96 M20 80 H100 M144 60 H220 M148 96 H220" />
        </Frame>
      );
    case "interlocking-spurs":
      return (
        <Frame label={label}>
          <polygon points="0,20 80,20 40,90 0,70" fill="#4d7c0f" />
          <polygon points="240,30 150,40 200,100 240,80" fill="#65a30d" />
          <polygon points="0,90 70,110 30,150 0,140" fill="#3f6212" />
          <polygon points="240,100 160,120 210,155 240,150" fill="#4d7c0f" />
          <path d="M20 60 C70 80 90 40 130 70 C160 96 180 70 220 100" stroke="#0284c7" strokeWidth="6" fill="none" />
        </Frame>
      );
    case "floodplain":
      return (
        <Frame label={label}>
          <polygon points="0,20 40,70 0,160" fill="#4d7c0f" />
          <polygon points="240,16 200,64 240,160" fill="#65a30d" />
          <rect x="40" y="70" width="160" height="90" fill="#a3e635" />
          <path d="M50 100 C80 80 100 130 140 110 C160 98 180 130 200 112" stroke="#0284c7" strokeWidth="6" fill="none" />
        </Frame>
      );
    case "estuary":
      return (
        <Frame label={label}>
          <polygon points="0,20 90,20 40,150 0,150" fill="#4d7c0f" />
          <polygon points="240,20 150,20 200,150 240,150" fill="#65a30d" />
          <polygon points="90,20 150,20 200,150 40,150" fill="#0284c7" />
          <path d="M110 24 L90 80 L130 90 L100 140" stroke="#7dd3fc" strokeWidth="6" fill="none" />
        </Frame>
      );
    case "headland":
      return (
        <Frame label={label}>
          <rect x="0" y="70" width="240" height="90" fill="#0284c7" />
          <path d="M0 70 H70 L120 110 L170 70 H240 V20 H0 Z" fill="#4d7c0f" />
          <polygon points="90,78 120,118 150,78" fill="#78716c" />
        </Frame>
      );
    case "bay":
      return (
        <Frame label={label}>
          <rect x="0" y="80" width="240" height="80" fill="#0284c7" />
          <path d="M0 20 H70 V90 Q120 40 170 90 V20 H240 V0 H0 Z" fill="#4d7c0f" />
          <path d="M78 96 Q120 70 162 96" stroke="#fbbf24" strokeWidth="8" fill="none" />
        </Frame>
      );
    case "sea-arch":
      return (
        <Frame label={label}>
          <rect x="0" y="112" width="240" height="48" fill="#0284c7" />
          <path d="M70 112 V40 H170 V112 H150 V78 Q120 48 90 78 V112 Z" fill="#78716c" />
        </Frame>
      );
    case "stack":
      return (
        <Frame label={label}>
          <rect x="0" y="112" width="240" height="48" fill="#0284c7" />
          <polygon points="0,112 70,112 70,36 40,36 20,70 0,70" fill="#78716c" />
          <rect x="128" y="58" width="28" height="54" fill="#57534e" />
          <polygon points="122,58 142,36 162,58" fill="#a8a29e" />
        </Frame>
      );
    case "spit":
      return (
        <Frame label={label}>
          <rect x="0" y="70" width="240" height="90" fill="#0284c7" />
          <rect x="0" y="20" width="70" height="90" fill="#4d7c0f" />
          <path d="M70 96 C120 96 150 96 180 110 C200 120 190 132 170 124" stroke="#fbbf24" strokeWidth="14" fill="none" />
        </Frame>
      );
    case "cliff":
      return (
        <Frame label={label}>
          <rect x="0" y="120" width="240" height="40" fill="#0284c7" />
          <rect x="20" y="28" width="150" height="92" fill="#a8a29e" />
          <path stroke="#57534e" strokeWidth="3" d="M20 52 H170 M20 76 H170 M20 100 H170" />
          <rect x="170" y="100" width="50" height="20" fill="#fbbf24" />
        </Frame>
      );
    case "beach":
      return (
        <Frame label={label}>
          <rect x="0" y="96" width="240" height="64" fill="#0284c7" />
          <path d="M0 96 Q120 70 240 96 V120 H0 Z" fill="#fbbf24" />
          <path d="M0 40 H40 L70 96 H0 Z" fill="#78716c" />
          <path d="M240 36 H190 L160 96 H240 Z" fill="#78716c" />
        </Frame>
      );
    case "volcano":
      return (
        <Frame label={label}>
          <polygon points="20,140 108,48 132,48 220,140" fill="#57534e" />
          <polygon points="108,48 120,28 132,48" fill="#1e293b" />
          <polygon points="116,40 120,18 124,40" fill="#ea580c" />
          <path d="M96 70 L70 140" stroke="#334155" strokeWidth="3" />
        </Frame>
      );
    case "canyon":
      return (
        <Frame label={label}>
          <polygon points="0,36 86,36 104,148 0,148" fill="#d97706" />
          <polygon points="240,36 154,36 136,148 240,148" fill="#b45309" />
          <path stroke="#fbbf24" strokeWidth="4" d="M0 58 H82 M0 84 H90 M0 110 H96 M240 58 H158 M240 84 H150 M240 110 H144" />
          <path d="M108 144 H132" stroke="#0284c7" strokeWidth="5" />
        </Frame>
      );
    case "plateau":
      return (
        <Frame label={label}>
          <polygon points="0,130 40,130 70,50 170,50 200,130 240,130 240,160 0,160" fill="#65a30d" />
          <rect x="70" y="40" width="100" height="14" fill="#4d7c0f" />
        </Frame>
      );
    case "fjord":
      return (
        <Frame label={label}>
          <polygon points="0,20 78,20 70,150 0,150" fill="#4d7c0f" />
          <polygon points="240,16 162,16 170,150 240,150" fill="#65a30d" />
          <polygon points="78,40 162,40 170,150 70,150" fill="#0284c7" />
          <polygon points="100,20 140,20 136,40 104,40" fill="#e2e8f0" />
        </Frame>
      );
    case "dune":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#fcd34d" />
          <path d="M30 118 C50 118 70 70 120 70 C160 70 170 118 210 118" fill="#fbbf24" />
          <path d="M120 70 C150 70 168 100 176 118 H120 Z" fill="#d97706" />
        </Frame>
      );
    default:
      return null;
  }
}

export function GeographyPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof FEATURES)[number]["title"]);
  if (!id) return null;
  return picture(id, name);
}
