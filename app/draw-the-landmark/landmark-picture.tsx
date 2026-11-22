import React, { type ReactNode } from "react";
import { LANDMARKS, type LandmarkId } from "@/lib/draw-the-landmark/landmarks";

const TITLES = new Map(LANDMARKS.map((landmark) => [landmark.title, landmark.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: LandmarkId, label: string) {
  switch (id) {
    case "eiffel":
      return (
        <Frame label={label}>
          <polygon points="120,12 112,42 128,42" fill="#78350f" />
          <polygon points="112,42 96,78 144,78 128,42" fill="#92400e" />
          <rect x="90" y="74" width="60" height="8" fill="#78350f" />
          <polygon points="96,82 70,140 98,140 108,96 120,88 132,96 142,140 170,140 144,82" fill="#b45309" />
          <rect x="66" y="128" width="108" height="8" fill="#78350f" />
          <path d="M86 140 Q104 112 120 140" fill="#f8fafc" />
          <path d="M120 140 Q136 112 154 140" fill="#f8fafc" />
          <path stroke="#78350f" strokeWidth="2" d="M104 90 L120 78 L136 90 M100 110 H140 M92 124 H148" />
        </Frame>
      );
    case "pyramids":
      return (
        <Frame label={label}>
          <circle cx="188" cy="36" r="14" fill="#fbbf24" />
          <polygon points="36,128 72,78 108,128" fill="#b45309" />
          <polygon points="148,128 184,70 220,128" fill="#d97706" />
          <polygon points="64,128 120,36 176,128" fill="#f59e0b" />
          <polygon points="120,36 132,68 108,68" fill="#fde68a" />
          <rect x="20" y="128" width="200" height="12" fill="#fcd34d" />
        </Frame>
      );
    case "hoover-dam":
      return (
        <Frame label={label}>
          <path d="M16 28 H68 V140 H16 Z" fill="#78716c" />
          <path d="M172 24 H224 V140 H172 Z" fill="#57534e" />
          <path d="M68 46 Q120 18 172 46 L172 128 Q120 148 68 128 Z" fill="#cbd5e1" />
          <path d="M68 46 Q120 28 172 46 L172 72 Q120 54 68 72 Z" fill="#0284c7" />
          <rect x="92" y="30" width="12" height="28" fill="#94a3b8" />
          <rect x="136" y="30" width="12" height="28" fill="#94a3b8" />
          <rect x="88" y="26" width="20" height="6" fill="#64748b" />
          <rect x="132" y="26" width="20" height="6" fill="#64748b" />
          <path stroke="#64748b" strokeWidth="3" d="M80 96 H160 M80 112 H160" />
        </Frame>
      );
    case "statue-of-liberty":
      return (
        <Frame label={label}>
          <path d="M128 72 L176 28" stroke="#15803d" strokeWidth="10" strokeLinecap="round" />
          <circle cx="182" cy="22" r="10" fill="#f59e0b" />
          <polygon points="182,4 172,20 192,20" fill="#fbbf24" />
          <rect x="58" y="78" width="20" height="30" rx="2" fill="#166534" transform="rotate(-14 68 93)" />
          <path d="M104 68 Q92 96 98 140 H142 Q148 96 136 68 Z" fill="#16a34a" />
          <circle cx="120" cy="56" r="14" fill="#22c55e" />
          <polygon points="104,50 106,28 114,46 120,20 126,46 134,28 136,50" fill="#15803d" />
          <polygon points="96,140 108,104 132,104 144,140" fill="#78716c" />
        </Frame>
      );
    case "big-ben":
      return (
        <Frame label={label}>
          <polygon points="92,44 120,8 148,44" fill="#57534e" />
          <rect x="100" y="40" width="40" height="96" fill="#d6d3d1" />
          <rect x="108" y="50" width="8" height="16" fill="#44403c" />
          <rect x="124" y="50" width="8" height="16" fill="#44403c" />
          <circle cx="120" cy="86" r="16" fill="#1e293b" />
          <circle cx="120" cy="86" r="12" fill="#fef3c7" />
          <path stroke="#1e293b" strokeWidth="2" d="M120 86 V76 M120 86 L128 90" />
          <rect x="88" y="128" width="64" height="14" fill="#a8a29e" />
        </Frame>
      );
    case "taj-mahal":
      return (
        <Frame label={label}>
          <rect x="28" y="122" width="184" height="14" fill="#e2e8f0" />
          <rect x="44" y="112" width="152" height="12" fill="#cbd5e1" />
          <rect x="48" y="70" width="10" height="52" fill="#e2e8f0" />
          <rect x="182" y="70" width="10" height="52" fill="#e2e8f0" />
          <circle cx="53" cy="66" r="7" fill="#cbd5e1" />
          <circle cx="187" cy="66" r="7" fill="#cbd5e1" />
          <path d="M70 112 Q82 78 94 112 Z" fill="#e2e8f0" />
          <path d="M146 112 Q158 78 170 112 Z" fill="#e2e8f0" />
          <rect x="90" y="78" width="60" height="34" fill="#f1f5f9" />
          <path d="M108 112 V94 Q120 76 132 94 V112 Z" fill="#334155" />
          <path d="M98 80 Q120 36 142 80 Z" fill="#e2e8f0" />
          <rect x="116" y="40" width="8" height="12" fill="#cbd5e1" />
          <circle cx="120" cy="38" r="4" fill="#94a3b8" />
        </Frame>
      );
    case "sydney-opera":
      return (
        <Frame label={label}>
          <rect x="0" y="112" width="240" height="48" fill="#0284c7" />
          <polygon points="36,116 204,116 184,100 56,100" fill="#cbd5e1" />
          <path d="M62 102 Q78 36 112 102 Z" fill="#f1f5f9" />
          <path d="M96 102 Q120 22 156 102 Z" fill="#e2e8f0" />
          <path d="M136 102 Q162 44 196 102 Z" fill="#cbd5e1" />
          <path stroke="#94a3b8" strokeWidth="2" fill="none" d="M80 102 Q86 58 100 102 M118 102 Q124 48 140 102 M158 102 Q168 64 184 102" />
        </Frame>
      );
    case "great-wall":
      return (
        <Frame label={label}>
          <path d="M8 128 Q48 70 92 112 T168 88 T232 120 V152 H8 Z" fill="#65a30d" />
          <path d="M12 112 Q58 68 102 104 T176 86 T228 112" stroke="#d6d3d1" strokeWidth="12" fill="none" strokeLinecap="round" />
          <rect x="52" y="58" width="18" height="26" fill="#a8a29e" />
          <rect x="48" y="54" width="26" height="6" fill="#78716c" />
          <rect x="158" y="68" width="18" height="26" fill="#a8a29e" />
          <rect x="154" y="64" width="26" height="6" fill="#78716c" />
        </Frame>
      );
    case "colosseum":
      return (
        <Frame label={label}>
          <path d="M36 118 H204 V86 Q204 36 120 36 Q36 36 36 86 Z" fill="#d6d3d1" />
          <path d="M58 118 V96 Q58 70 86 70 H154 Q182 70 182 96 V118" fill="#78716c" />
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <path key={`a${index}`} d={`M${48 + index * 22} 78 v12 q0 8 8 8 q8 0 8 -8 v-12 z`} fill="#f8fafc" />
          ))}
          {[0, 1, 2, 3, 4].map((index) => (
            <path key={`b${index}`} d={`M${70 + index * 22} 100 v10 q0 7 7 7 q7 0 7 -7 v-10 z`} fill="#f8fafc" />
          ))}
          <rect x="36" y="114" width="168" height="10" fill="#a8a29e" />
        </Frame>
      );
    case "pisa":
      return (
        <Frame label={label}>
          <g transform="rotate(8 120 90)">
            <polygon points="88,28 120,10 152,28 152,36 88,36" fill="#d6d3d1" />
            <rect x="96" y="32" width="48" height="108" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="3" />
            <path stroke="#a8a29e" strokeWidth="3" d="M96 52h48 M96 74h48 M96 96h48 M96 118h48" />
            {[58, 80, 102].map((y) => (
              <g key={y}>
                <circle cx="108" cy={y} r="4" fill="#78716c" />
                <circle cx="132" cy={y} r="4" fill="#78716c" />
              </g>
            ))}
          </g>
        </Frame>
      );
    case "christ-redeemer":
      return (
        <Frame label={label}>
          <path d="M28 142 Q120 78 212 142 Z" fill="#65a30d" />
          <path d="M36 72 Q120 92 204 72" stroke="#e2e8f0" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M112 70 L106 124 H134 L128 70 Z" fill="#e2e8f0" />
          <circle cx="120" cy="58" r="12" fill="#e2e8f0" />
          <rect x="102" y="120" width="36" height="16" fill="#94a3b8" />
        </Frame>
      );
    case "golden-gate":
      return (
        <Frame label={label}>
          <rect x="0" y="112" width="240" height="48" fill="#0369a1" />
          <path d="M30 40 Q120 108 210 40" stroke="#ea580c" strokeWidth="4" fill="none" />
          <path d="M55 40 V104 M80 62 V104 M110 84 V104 M145 78 V104 M175 56 V104 M196 40 V104" stroke="#c2410c" strokeWidth="2" />
          <rect x="46" y="28" width="16" height="92" fill="#ea580c" />
          <rect x="178" y="28" width="16" height="92" fill="#ea580c" />
          <rect x="42" y="22" width="24" height="8" fill="#c2410c" />
          <rect x="174" y="22" width="24" height="8" fill="#c2410c" />
          <rect x="16" y="100" width="208" height="8" fill="#ea580c" />
        </Frame>
      );
    case "tower-bridge":
      return (
        <Frame label={label}>
          <rect x="0" y="116" width="240" height="44" fill="#0284c7" />
          <rect x="52" y="40" width="30" height="84" fill="#cbd5e1" />
          <rect x="158" y="40" width="30" height="84" fill="#cbd5e1" />
          <polygon points="48,44 67,14 86,44" fill="#1d4ed8" />
          <polygon points="154,44 173,14 192,44" fill="#1d4ed8" />
          <rect x="82" y="48" width="76" height="12" fill="#1d4ed8" />
          <rect x="82" y="66" width="76" height="8" fill="#1e40af" />
          <rect x="18" y="104" width="204" height="8" fill="#475569" />
          <path d="M100 104 L120 92 L140 104" fill="#64748b" />
        </Frame>
      );
    case "arc-de-triomphe":
      return (
        <Frame label={label}>
          <rect x="54" y="32" width="132" height="108" fill="#d6d3d1" />
          <rect x="54" y="32" width="132" height="16" fill="#a8a29e" />
          <path d="M96 140 V88 Q120 58 144 88 V140 Z" fill="#f8fafc" />
          <rect x="70" y="56" width="18" height="14" fill="#78716c" />
          <rect x="152" y="56" width="18" height="14" fill="#78716c" />
          <rect x="66" y="128" width="108" height="8" fill="#a8a29e" />
        </Frame>
      );
    case "stonehenge":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="132" rx="96" ry="16" fill="#65a30d" />
          <rect x="42" y="78" width="16" height="52" fill="#78716c" />
          <rect x="74" y="68" width="16" height="62" fill="#57534e" />
          <rect x="38" y="64" width="56" height="14" fill="#a8a29e" />
          <rect x="108" y="84" width="14" height="46" fill="#44403c" />
          <rect x="148" y="72" width="16" height="58" fill="#78716c" />
          <rect x="180" y="80" width="16" height="50" fill="#57534e" />
          <rect x="144" y="66" width="56" height="14" fill="#a8a29e" />
        </Frame>
      );
    case "rushmore":
      return (
        <Frame label={label}>
          <path d="M12 140 L28 96 H212 L228 140 Z" fill="#64748b" />
          <circle cx="52" cy="86" r="20" fill="#94a3b8" />
          <circle cx="96" cy="74" r="24" fill="#cbd5e1" />
          <circle cx="146" cy="78" r="22" fill="#94a3b8" />
          <circle cx="192" cy="70" r="20" fill="#cbd5e1" />
          <path d="M64 86 h10 M108 74 h12 M158 78 h10 M204 70 h8" stroke="#475569" strokeWidth="3" />
          <path d="M58 96 q8 8 16 0 M102 86 q10 10 20 0 M150 90 q10 8 18 0 M196 82 q8 8 16 0" stroke="#334155" strokeWidth="2" fill="none" />
        </Frame>
      );
    case "sphinx":
      return (
        <Frame label={label}>
          <polygon points="168,112 206,48 236,112" fill="#f59e0b" />
          <ellipse cx="132" cy="112" rx="72" ry="22" fill="#d97706" />
          <rect x="46" y="104" width="36" height="16" rx="4" fill="#b45309" />
          <path d="M72 112 L80 68 H112 L122 112 Z" fill="#d97706" />
          <path d="M74 70 L66 112 H84 L94 74 L104 112 H122 L112 70 Z" fill="#92400e" />
          <circle cx="94" cy="62" r="14" fill="#b45309" />
          <rect x="20" y="128" width="200" height="10" fill="#fcd34d" />
        </Frame>
      );
    case "cn-tower":
      return (
        <Frame label={label}>
          <polygon points="108,140 116,78 124,78 132,140" fill="#64748b" />
          <polygon points="114,78 120,48 126,78" fill="#475569" />
          <ellipse cx="120" cy="62" rx="32" ry="12" fill="#334155" />
          <ellipse cx="120" cy="56" rx="22" ry="7" fill="#94a3b8" />
          <rect x="118" y="10" width="4" height="42" fill="#475569" />
          <polygon points="96,140 114,118 126,118 144,140" fill="#475569" />
        </Frame>
      );
    case "burj-khalifa":
      return (
        <Frame label={label}>
          <polygon
            points="120,8 126,28 134,28 134,46 144,46 144,68 154,68 154,96 146,96 140,140 100,140 94,96 86,96 86,68 96,68 96,46 106,46 106,28 114,28"
            fill="#38bdf8"
          />
          <polygon points="116,28 120,8 124,28 122,140 118,140" fill="#0284c7" />
          <rect x="88" y="136" width="64" height="8" fill="#334155" />
        </Frame>
      );
    case "empire-state":
      return (
        <Frame label={label}>
          <polygon points="100,140 100,108 84,108 84,84 100,84 100,64 112,64 116,28 120,12 124,28 128,64 140,64 140,84 156,84 156,108 140,108 140,140" fill="#78716c" />
          <rect x="118" y="6" width="4" height="18" fill="#44403c" />
          <rect x="108" y="72" width="8" height="10" fill="#e2e8f0" />
          <rect x="124" y="72" width="8" height="10" fill="#e2e8f0" />
          <rect x="108" y="92" width="8" height="10" fill="#e2e8f0" />
          <rect x="124" y="92" width="8" height="10" fill="#e2e8f0" />
        </Frame>
      );
    case "st-basils":
      return (
        <Frame label={label}>
          <rect x="40" y="104" width="160" height="36" fill="#e2e8f0" />
          <polygon points="120,16 102,78 138,78" fill="#dc2626" />
          <path d="M110 36 H130 L126 78 H114 Z" fill="#fecaca" />
          <ellipse cx="72" cy="82" rx="18" ry="24" fill="#16a34a" />
          <ellipse cx="168" cy="82" rx="18" ry="24" fill="#2563eb" />
          <ellipse cx="98" cy="92" rx="14" ry="18" fill="#eab308" />
          <ellipse cx="142" cy="92" rx="14" ry="18" fill="#7c3aed" />
          <rect x="116" y="8" width="8" height="12" fill="#fbbf24" />
          <path d="M64 70 Q72 58 80 70" stroke="#bbf7d0" strokeWidth="3" fill="none" />
          <path d="M160 70 Q168 58 176 70" stroke="#bfdbfe" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "brandenburg":
      return (
        <Frame label={label}>
          <rect x="36" y="58" width="168" height="78" fill="#d6d3d1" />
          <rect x="58" y="74" width="18" height="62" fill="#f8fafc" />
          <rect x="90" y="74" width="18" height="62" fill="#f8fafc" />
          <rect x="132" y="74" width="18" height="62" fill="#f8fafc" />
          <rect x="164" y="74" width="18" height="62" fill="#f8fafc" />
          <rect x="32" y="48" width="176" height="14" fill="#a8a29e" />
          <ellipse cx="120" cy="42" rx="26" ry="8" fill="#78716c" />
          <circle cx="98" cy="36" r="6" fill="#44403c" />
          <circle cx="142" cy="36" r="6" fill="#44403c" />
          <path d="M112 34 h16 l-4 -10 h-8 z" fill="#eab308" />
        </Frame>
      );
    case "parthenon":
      return (
        <Frame label={label}>
          <polygon points="36,58 120,26 204,58" fill="#e7e5e4" />
          <rect x="40" y="56" width="160" height="12" fill="#d6d3d1" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <rect key={index} x={50 + index * 18} y="68" width="10" height="58" fill="#e7e5e4" />
          ))}
          <rect x="36" y="124" width="168" height="12" fill="#a8a29e" />
        </Frame>
      );
    case "machu-picchu":
      return (
        <Frame label={label}>
          <polygon points="120,16 62,96 178,96" fill="#65a30d" />
          <rect x="48" y="96" width="144" height="12" fill="#4d7c0f" />
          <rect x="36" y="112" width="168" height="12" fill="#3f6212" />
          <rect x="24" y="128" width="192" height="14" fill="#365314" />
          <rect x="88" y="78" width="64" height="20" fill="#a8a29e" />
          <rect x="98" y="64" width="16" height="18" fill="#d6d3d1" />
          <rect x="126" y="58" width="16" height="24" fill="#d6d3d1" />
          <path stroke="#57534e" strokeWidth="2" d="M92 88 h56 M92 94 h56" />
        </Frame>
      );
    case "moai":
      return (
        <Frame label={label}>
          <path d="M72 34 H158 L186 126 H58 Z" fill="#78716c" />
          <path d="M64 52 H172 L160 70 H78 Z" fill="#57534e" />
          <ellipse cx="104" cy="78" rx="14" ry="8" fill="#44403c" />
          <ellipse cx="146" cy="78" rx="14" ry="8" fill="#44403c" />
          <polygon points="128,72 112,112 144,112" fill="#64748b" />
          <path d="M96 118 H164" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <rect x="48" y="124" width="150" height="16" rx="4" fill="#65a30d" />
        </Frame>
      );
    case "niagara":
      return (
        <Frame label={label}>
          <rect x="12" y="36" width="74" height="44" fill="#65a30d" />
          <rect x="154" y="36" width="74" height="44" fill="#65a30d" />
          <rect x="86" y="44" width="68" height="74" fill="#7dd3fc" />
          <path stroke="#e0f2fe" strokeWidth="5" d="M98 46 V116 M112 46 V116 M126 46 V116 M140 46 V116" />
          <path d="M24 118 Q120 156 216 118 V160 H24 Z" fill="#0284c7" />
          <ellipse cx="120" cy="122" rx="46" ry="12" fill="#cbd5e1" />
        </Frame>
      );
    case "london-eye":
      return (
        <Frame label={label}>
          <circle cx="120" cy="74" r="52" fill="none" stroke="#64748b" strokeWidth="8" />
          <path stroke="#94a3b8" strokeWidth="2" d="M120 26 V122 M72 74 H168 M84 40 L156 108 M156 40 L84 108" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 120 + Math.cos(rad) * 52;
            const y = 74 + Math.sin(rad) * 52;
            return <circle key={angle} cx={x} cy={y} r="5" fill="#0ea5e9" />;
          })}
          <polygon points="92,142 120,104 148,142" fill="#475569" />
        </Frame>
      );
    case "space-needle":
      return (
        <Frame label={label}>
          <polygon points="96,142 116,78 124,78 144,142" fill="#94a3b8" />
          <polygon points="112,142 120,90 128,142" fill="#f8fafc" />
          <ellipse cx="120" cy="74" rx="50" ry="14" fill="#e2e8f0" />
          <ellipse cx="120" cy="68" rx="30" ry="8" fill="#cbd5e1" />
          <polygon points="120,16 112,64 128,64" fill="#ea580c" />
          <rect x="118" y="8" width="4" height="14" fill="#c2410c" />
        </Frame>
      );
    case "sagrada":
      return (
        <Frame label={label}>
          <path d="M78 132 C74 90 76 48 86 22 C94 48 96 90 92 132 Z" fill="#a8a29e" />
          <path d="M104 136 C100 80 104 36 114 10 C124 36 122 80 118 136 Z" fill="#78716c" />
          <path d="M128 136 C124 84 128 40 138 16 C148 40 146 84 142 136 Z" fill="#a8a29e" />
          <path d="M154 132 C150 96 154 58 162 30 C170 58 170 96 166 132 Z" fill="#78716c" />
          <circle cx="86" cy="20" r="4" fill="#64748b" />
          <circle cx="114" cy="8" r="4" fill="#64748b" />
          <circle cx="138" cy="14" r="4" fill="#64748b" />
          <circle cx="162" cy="28" r="4" fill="#64748b" />
          <path d="M70 132 H170 V146 H70 Z" fill="#d6d3d1" />
          <circle cx="120" cy="128" r="8" fill="#44403c" />
        </Frame>
      );
    case "petronas":
      return (
        <Frame label={label}>
          <polygon points="58,142 62,78 52,78 52,58 72,28 92,58 92,78 82,78 86,142" fill="#94a3b8" />
          <polygon points="154,142 158,78 148,78 148,58 168,28 188,58 188,78 178,78 182,142" fill="#64748b" />
          <polygon points="72,28 68,12 76,12" fill="#475569" />
          <polygon points="168,28 164,12 172,12" fill="#334155" />
          <rect x="70" y="6" width="4" height="12" fill="#1e293b" />
          <rect x="166" y="6" width="4" height="12" fill="#1e293b" />
          <rect x="86" y="86" width="68" height="6" fill="#1e293b" />
          <polygon points="86,86 100,78 140,78 154,86 140,94 100,94" fill="#334155" />
        </Frame>
      );
    case "gateway-arch":
      return (
        <Frame label={label}>
          <path d="M32 142 C32 36 72 18 120 18 C168 18 208 36 208 142 L180 142 C180 58 156 46 120 46 C84 46 60 58 60 142 Z" fill="#e2e8f0" />
          <rect x="0" y="140" width="240" height="20" fill="#0284c7" />
        </Frame>
      );
    case "fuji":
      return (
        <Frame label={label}>
          <polygon points="16,128 120,24 224,128" fill="#64748b" />
          <polygon points="78,78 98,58 112,74 120,52 134,76 154,60 168,82 120,70" fill="#e2e8f0" />
          <rect x="8" y="126" width="224" height="18" fill="#65a30d" />
        </Frame>
      );
    case "angkor-wat":
      return (
        <Frame label={label}>
          <rect x="24" y="124" width="192" height="16" fill="#a8a29e" />
          <rect x="44" y="108" width="152" height="18" fill="#d6d3d1" />
          <rect x="68" y="92" width="104" height="18" fill="#a8a29e" />
          <polygon points="120,24 102,92 138,92" fill="#78716c" />
          <polygon points="84,58 70,92 98,92" fill="#57534e" />
          <polygon points="156,58 142,92 170,92" fill="#57534e" />
          <rect x="116" y="16" width="8" height="12" fill="#44403c" />
        </Frame>
      );
    case "hollywood":
      return (
        <Frame label={label}>
          <path d="M0 160 V68 C40 42 110 40 170 52 C210 60 230 56 240 64 V160 Z" fill="#3f6212" />
          <g fill="#e2e8f0" fillRule="evenodd">
            <path d="M14 78 H21 V92 H30 V78 H37 V110 H30 V98 H21 V110 H14 Z" />
            <path d="M42 78 H60 V110 H42 Z M48 84 H54 V104 H48 Z" />
            <path d="M66 78 H73 V104 H86 V110 H66 Z" />
            <path d="M92 78 H99 V104 H112 V110 H92 Z" />
            <path d="M118 78 H126 L130 92 L134 78 H142 L133 96 V110 H127 V96 Z" />
            <path d="M146 78 H152 L158 100 L164 78 H170 L176 100 L182 78 H188 L176 110 H170 L164 90 L158 110 H152 Z" />
            <path d="M194 78 H212 V110 H194 Z M200 84 H206 V104 H200 Z" />
            <path d="M218 78 H228 Q236 78 236 94 Q236 110 228 110 H218 Z M224 84 H228 Q230 84 230 94 Q230 104 228 104 H224 Z" />
          </g>
        </Frame>
      );
    case "neuschwanstein":
      return (
        <Frame label={label}>
          <path d="M8 142 Q80 96 232 128 V160 H8 Z" fill="#4d7c0f" />
          <rect x="92" y="52" width="52" height="78" fill="#e2e8f0" />
          <polygon points="86,56 118,22 150,56" fill="#1d4ed8" />
          <rect x="108" y="28" width="16" height="18" fill="#cbd5e1" />
          <polygon points="104,30 116,10 128,30" fill="#1e40af" />
          <rect x="66" y="82" width="24" height="50" fill="#e2e8f0" />
          <polygon points="62,84 78,58 94,84" fill="#2563eb" />
          <rect x="148" y="74" width="24" height="58" fill="#e2e8f0" />
          <polygon points="144,76 160,48 176,76" fill="#1d4ed8" />
          <rect x="104" y="74" width="8" height="14" fill="#1e3a8a" />
          <rect x="124" y="74" width="8" height="14" fill="#1e3a8a" />
          <rect x="108" y="108" width="20" height="22" fill="#1e3a8a" />
        </Frame>
      );
    default:
      return null;
  }
}

export function LandmarkPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof LANDMARKS)[number]["title"]);
  if (!id) return null;
  return picture(id, name);
}
