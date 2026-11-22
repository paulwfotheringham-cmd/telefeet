import React, { type ReactNode } from "react";
import { CREATURES, type CreatureId } from "@/lib/draw-the-myth/creatures";

const TITLES = new Map(CREATURES.map((creature) => [creature.title, creature.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: CreatureId, label: string) {
  switch (id) {
    case "dragon":
      return (
        <Frame label={label}>
          <path d="M28 108 Q70 40 118 78 Q150 40 188 58 L176 86 Q150 78 140 100 L168 128 L132 112 L96 132 L88 108 Q48 128 28 108 Z" fill="#16a34a" />
          <path d="M118 70 Q90 36 46 28 Q78 58 96 72 Z" fill="#15803d" />
          <path d="M128 74 Q168 28 204 42 Q170 62 150 78 Z" fill="#166534" />
          <path d="M188 58 Q214 48 228 28 Q210 52 198 70" fill="#f97316" />
          <circle cx="176" cy="62" r="3" fill="#1e293b" />
        </Frame>
      );
    case "unicorn":
      return (
        <Frame label={label}>
          <path d="M46 118 L58 78 L86 86 L98 58 L128 70 L150 48 L168 62 L176 96 L150 108 L138 128 L108 118 L96 136 L70 124 Z" fill="#e2e8f0" />
          <path d="M150 48 L162 18 L174 50" fill="#facc15" />
          <path d="M128 62 Q150 48 168 70" stroke="#f472b6" strokeWidth="6" fill="none" />
          <path d="M58 78 L40 96 M86 86 L70 108 M98 58 L86 90" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="160" cy="58" r="2.5" fill="#1e293b" />
        </Frame>
      );
    case "mermaid":
      return (
        <Frame label={label}>
          <path d="M92 96 Q70 130 108 146 Q150 132 156 100 Q170 140 196 128 Q168 108 148 96 Z" fill="#0284c7" />
          <path d="M188 118 L208 108 L196 132 Z" fill="#38bdf8" />
          <rect x="96" y="62" width="36" height="40" rx="12" fill="#ec4899" />
          <circle cx="114" cy="42" r="16" fill="#fdba74" />
          <path d="M100 40 Q90 70 108 78 Q96 50 124 36 Q140 28 128 46" fill="#f59e0b" />
          <circle cx="120" cy="40" r="2" fill="#1e293b" />
        </Frame>
      );
    case "phoenix":
      return (
        <Frame label={label}>
          <path d="M118 78 Q70 40 36 24 Q78 56 96 80 Q48 88 28 120 Q80 104 112 96 Z" fill="#ef4444" />
          <path d="M124 74 Q176 28 214 18 Q176 58 156 78 Q204 90 220 124 Q168 100 140 92 Z" fill="#f97316" />
          <ellipse cx="128" cy="92" rx="28" ry="18" fill="#ea580c" />
          <path d="M150 84 L188 78 L150 96 Z" fill="#facc15" />
          <circle cx="156" cy="84" r="2.5" fill="#1e293b" />
          <path d="M108 108 Q128 140 150 112" stroke="#b91c1c" strokeWidth="6" fill="none" />
        </Frame>
      );
    case "griffin":
      return (
        <Frame label={label}>
          <path d="M40 112 L70 80 L100 92 L120 64 L150 78 L168 108 L140 124 L110 116 L90 132 L62 118 Z" fill="#d97706" />
          <path d="M120 64 Q100 28 58 20 Q92 48 108 66 Z" fill="#e2e8f0" />
          <path d="M128 60 Q170 24 206 36 Q168 56 146 70 Z" fill="#cbd5e1" />
          <path d="M150 70 L186 62 L168 80 Z" fill="#facc15" />
          <circle cx="168" cy="66" r="3" fill="#1e293b" />
          <path d="M70 80 L52 108 M100 92 L88 118" stroke="#b45309" strokeWidth="4" />
        </Frame>
      );
    case "pegasus":
      return (
        <Frame label={label}>
          <path d="M36 120 L56 78 L90 90 L108 58 L140 72 L162 56 L178 90 L156 108 L140 130 L104 118 L90 138 L64 122 Z" fill="#e2e8f0" />
          <path d="M108 62 Q86 20 40 16 Q78 46 100 66 Z" fill="#cbd5e1" />
          <path d="M124 66 Q168 18 210 28 Q168 56 142 74 Z" fill="#94a3b8" />
          <path d="M162 56 L196 48" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="170" cy="64" r="2.5" fill="#1e293b" />
        </Frame>
      );
    case "centaur":
      return (
        <Frame label={label}>
          <path d="M28 124 L48 86 L86 96 L112 78 L150 92 L168 120 L140 132 L112 124 L96 142 L68 128 Z" fill="#92400e" />
          <rect x="118" y="36" width="28" height="48" rx="10" fill="#fdba74" />
          <circle cx="132" cy="26" r="14" fill="#fdba74" />
          <path d="M120 22 Q128 8 146 20" fill="#78350f" />
          <path d="M146 48 L176 28" stroke="#78350f" strokeWidth="4" />
          <path d="M176 28 L186 22 L180 36 Z" fill="#94a3b8" />
        </Frame>
      );
    case "fairy":
      return (
        <Frame label={label}>
          <ellipse cx="78" cy="70" rx="28" ry="18" fill="#e2e8f0" transform="rotate(-30 78 70)" />
          <ellipse cx="162" cy="70" rx="28" ry="18" fill="#e2e8f0" transform="rotate(30 162 70)" />
          <path d="M108 78 L120 128 L132 78 Z" fill="#f9a8d4" />
          <circle cx="120" cy="58" r="14" fill="#fdba74" />
          <path d="M108 54 Q120 40 132 54" fill="#f472b6" />
          <path d="M132 70 L168 96" stroke="#facc15" strokeWidth="3" />
          <circle cx="172" cy="100" r="5" fill="#fde047" />
        </Frame>
      );
    case "elf":
      return (
        <Frame label={label}>
          <path d="M96 150 V78 H144 V150" fill="#166534" />
          <circle cx="120" cy="52" r="20" fill="#fdba74" />
          <path d="M100 52 L78 44 L102 64 Z" fill="#fdba74" />
          <path d="M140 52 L162 44 L138 64 Z" fill="#fdba74" />
          <path d="M104 40 Q120 24 136 40" fill="#facc15" />
          <path d="M148 78 Q190 70 210 96" stroke="#78350f" strokeWidth="4" fill="none" />
          <path d="M196 86 L214 78 L210 100 Z" fill="#94a3b8" />
        </Frame>
      );
    case "dwarf":
      return (
        <Frame label={label}>
          <path d="M78 150 V96 H162 V150" fill="#1d4ed8" />
          <path d="M86 96 H154 L146 70 H94 Z" fill="#94a3b8" />
          <circle cx="120" cy="78" r="18" fill="#fdba74" />
          <path d="M102 86 Q120 112 138 86 Q120 98 102 86 Z" fill="#e2e8f0" />
          <path d="M70 110 L36 78 L58 118 Z" fill="#64748b" />
          <rect x="28" y="70" width="28" height="10" rx="2" fill="#78350f" />
        </Frame>
      );
    case "troll":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="48" ry="40" fill="#65a30d" />
          <circle cx="120" cy="58" r="28" fill="#84cc16" />
          <circle cx="108" cy="54" r="6" fill="#e2e8f0" />
          <circle cx="132" cy="54" r="6" fill="#e2e8f0" />
          <circle cx="108" cy="54" r="3" fill="#1e293b" />
          <circle cx="132" cy="54" r="3" fill="#1e293b" />
          <path d="M150 90 L210 46 L196 100 Z" fill="#78716c" />
          <rect x="186" y="36" width="28" height="16" rx="6" fill="#57534e" />
        </Frame>
      );
    case "goblin":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="112" rx="28" ry="32" fill="#84cc16" />
          <circle cx="120" cy="68" r="22" fill="#a3e635" />
          <path d="M100 64 L82 48 L104 76 Z" fill="#65a30d" />
          <path d="M140 64 L158 48 L136 76 Z" fill="#65a30d" />
          <circle cx="112" cy="66" r="4" fill="#1e293b" />
          <circle cx="130" cy="66" r="4" fill="#1e293b" />
          <path d="M112 80 Q120 88 128 80" stroke="#365314" strokeWidth="2" fill="none" />
        </Frame>
      );
    case "wizard":
      return (
        <Frame label={label}>
          <path d="M78 150 L96 70 H144 L162 150 Z" fill="#6d28d9" />
          <path d="M120 8 L150 62 H90 Z" fill="#4c1d95" />
          <circle cx="108" cy="40" r="4" fill="#facc15" />
          <circle cx="128" cy="28" r="3" fill="#fde047" />
          <circle cx="120" cy="78" r="16" fill="#fdba74" />
          <path d="M106 86 Q120 108 134 86" fill="#e2e8f0" />
          <path d="M150 96 L196 48" stroke="#78350f" strokeWidth="5" />
          <circle cx="202" cy="42" r="8" fill="#38bdf8" />
        </Frame>
      );
    case "witch":
      return (
        <Frame label={label}>
          <path d="M86 150 L104 78 H140 L158 150 Z" fill="#7c3aed" />
          <circle cx="122" cy="70" r="16" fill="#86efac" />
          <path d="M122 18 L156 66 H88 Z" fill="#1e293b" />
          <rect x="78" y="62" width="88" height="8" fill="#1e293b" />
          <path d="M150 110 L210 128" stroke="#78350f" strokeWidth="4" />
          <path d="M196 118 L220 108 L214 132 Z" fill="#a16207" />
        </Frame>
      );
    case "vampire":
      return (
        <Frame label={label}>
          <path d="M70 150 L120 48 L170 150 L140 120 L120 150 L100 120 Z" fill="#7f1d1d" />
          <circle cx="120" cy="48" r="18" fill="#e2e8f0" />
          <path d="M104 36 Q120 22 136 36" fill="#1e293b" />
          <path d="M112 58 L116 68 L120 58 L124 68 L128 58" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1" />
          <circle cx="114" cy="48" r="2" fill="#dc2626" />
          <circle cx="126" cy="48" r="2" fill="#dc2626" />
        </Frame>
      );
    case "werewolf":
      return (
        <Frame label={label}>
          <ellipse cx="128" cy="108" rx="36" ry="40" fill="#78716c" />
          <circle cx="150" cy="58" r="22" fill="#57534e" />
          <path d="M136 48 L128 28 L146 46 Z" fill="#44403c" />
          <path d="M162 46 L176 26 L168 52 Z" fill="#44403c" />
          <path d="M158 62 L188 58 L160 72 Z" fill="#e2e8f0" />
          <circle cx="158" cy="54" r="3" fill="#facc15" />
          <path d="M100 120 L64 96 L92 132 Z" fill="#78716c" />
          <circle cx="188" cy="28" r="14" fill="#fde68a" />
        </Frame>
      );
    case "ghost":
      return (
        <Frame label={label}>
          <path d="M70 78 Q70 28 120 28 Q170 28 170 78 V132 L150 116 L130 136 L110 116 L90 136 L70 116 Z" fill="#e2e8f0" />
          <circle cx="104" cy="74" r="6" fill="#1e293b" />
          <circle cx="136" cy="74" r="6" fill="#1e293b" />
          <ellipse cx="120" cy="98" rx="8" ry="10" fill="#334155" />
        </Frame>
      );
    case "cyclops":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="46" ry="40" fill="#d97706" />
          <circle cx="120" cy="58" r="30" fill="#f59e0b" />
          <circle cx="120" cy="58" r="14" fill="#e2e8f0" />
          <circle cx="120" cy="58" r="7" fill="#1d4ed8" />
          <circle cx="120" cy="58" r="3" fill="#1e293b" />
          <path d="M78 120 L40 150" stroke="#d97706" strokeWidth="12" strokeLinecap="round" />
          <path d="M162 120 L200 150" stroke="#d97706" strokeWidth="12" strokeLinecap="round" />
        </Frame>
      );
    case "medusa":
      return (
        <Frame label={label}>
          <path d="M96 150 V84 H144 V150" fill="#a3e635" />
          <circle cx="120" cy="78" r="22" fill="#bef264" />
          {[40, 70, 100, 140, 170, 200].map((x, index) => (
            <path
              key={x}
              d={`M${110 + (index % 3) * 8} 62 Q${x} ${20 + (index % 2) * 16} ${x} ${48 + (index % 3) * 8}`}
              stroke="#16a34a"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {[48, 78, 168, 196].map((x) => (
            <circle key={x} cx={x} cy={36} r="5" fill="#166534" />
          ))}
          <circle cx="112" cy="78" r="2.5" fill="#1e293b" />
          <circle cx="128" cy="78" r="2.5" fill="#1e293b" />
        </Frame>
      );
    case "minotaur":
      return (
        <Frame label={label}>
          <path d="M88 150 V78 H152 V150" fill="#92400e" />
          <circle cx="120" cy="62" r="26" fill="#78350f" />
          <path d="M96 52 Q78 18 100 40" stroke="#e2e8f0" strokeWidth="6" fill="none" />
          <path d="M144 52 Q162 18 140 40" stroke="#e2e8f0" strokeWidth="6" fill="none" />
          <circle cx="110" cy="62" r="3" fill="#1e293b" />
          <circle cx="130" cy="62" r="3" fill="#1e293b" />
          <ellipse cx="120" cy="76" rx="8" ry="5" fill="#44403c" />
          <path d="M152 96 L196 70" stroke="#78350f" strokeWidth="6" />
        </Frame>
      );
    case "hydra":
      return (
        <Frame label={label}>
          <ellipse cx="110" cy="124" rx="48" ry="22" fill="#166534" />
          {[50, 90, 130, 170, 200].map((x, index) => (
            <g key={x}>
              <path d={`M${90 + index * 8} 112 Q${x - 10} 70 ${x} 40`} stroke="#16a34a" strokeWidth="10" fill="none" />
              <circle cx={x} cy={36} r="12" fill="#22c55e" />
              <circle cx={x - 4} cy={34} r="2" fill="#1e293b" />
              <path d={`M${x + 6} 40 L${x + 16} 36`} stroke="#ef4444" strokeWidth="2" />
            </g>
          ))}
        </Frame>
      );
    case "kraken":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="78" rx="36" ry="28" fill="#1e3a8a" />
          <circle cx="108" cy="72" r="5" fill="#e2e8f0" />
          <circle cx="132" cy="72" r="5" fill="#e2e8f0" />
          <circle cx="108" cy="72" r="2" fill="#1e293b" />
          <circle cx="132" cy="72" r="2" fill="#1e293b" />
          {[30, 60, 90, 130, 160, 190, 214].map((x, index) => (
            <path
              key={x}
              d={`M${110 + (index % 4) * 6} 96 Q${x} ${120 + (index % 3) * 8} ${x} 150`}
              stroke="#1d4ed8"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <path d="M150 40 H210 L196 58 H164 Z" fill="#78350f" />
          <path d="M176 40 V22" stroke="#94a3b8" strokeWidth="3" />
        </Frame>
      );
    case "yeti":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="42" ry="40" fill="#e2e8f0" />
          <circle cx="120" cy="58" r="26" fill="#f1f5f9" />
          <circle cx="110" cy="56" r="4" fill="#1e293b" />
          <circle cx="132" cy="56" r="4" fill="#1e293b" />
          <path d="M108 70 Q120 80 132 70" stroke="#64748b" strokeWidth="3" fill="none" />
          <path d="M78 100 L46 78" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
          <path d="M162 100 L194 78" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        </Frame>
      );
    case "nessie":
      return (
        <Frame label={label}>
          <path d="M0 118 H240 V160 H0 Z" fill="#0284c7" />
          <path d="M36 112 Q80 96 120 108 Q170 124 210 100 Q180 130 120 124 Q70 118 36 112 Z" fill="#166534" />
          <path d="M150 108 Q168 60 156 28" stroke="#15803d" strokeWidth="16" fill="none" strokeLinecap="round" />
          <circle cx="150" cy="24" r="14" fill="#16a34a" />
          <circle cx="156" cy="20" r="2.5" fill="#1e293b" />
          <path d="M40 108 Q28 90 48 86" stroke="#166534" strokeWidth="8" fill="none" />
        </Frame>
      );
    case "sphinx":
      return (
        <Frame label={label}>
          <path d="M28 124 L70 96 L120 104 L168 78 L190 108 L160 128 L120 120 L90 136 L56 122 Z" fill="#d97706" />
          <circle cx="176" cy="62" r="18" fill="#fdba74" />
          <path d="M160 54 Q176 40 194 56" fill="#1e293b" />
          <circle cx="182" cy="62" r="2" fill="#1e293b" />
          <path d="M70 100 L48 124 M110 108 L96 132" stroke="#b45309" strokeWidth="5" />
        </Frame>
      );
    case "genie":
      return (
        <Frame label={label}>
          <path d="M150 128 H196 L184 146 H162 Z" fill="#facc15" />
          <path d="M168 128 Q160 110 176 108 Q188 112 184 128" fill="#eab308" />
          <path d="M120 120 Q70 110 78 70 Q90 30 130 36 Q168 28 160 70 Q176 100 140 112 Q150 96 132 92 Q110 100 120 120 Z" fill="#7c3aed" />
          <circle cx="124" cy="58" r="8" fill="#e2e8f0" />
          <path d="M150 48 Q176 36 168 62" fill="#6d28d9" />
        </Frame>
      );
    case "cerberus":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="112" rx="58" ry="28" fill="#44403c" />
          {[70, 120, 170].map((x) => (
            <g key={x}>
              <circle cx={x} cy={62} r="20" fill="#57534e" />
              <path d={`M${x - 12} 50 L${x - 18} 32 L${x - 4} 48 Z`} fill="#292524" />
              <path d={`M${x + 8} 48 L${x + 16} 30 L${x + 2} 50 Z`} fill="#292524" />
              <circle cx={x - 6} cy={60} r="2.5" fill="#facc15" />
              <circle cx={x + 6} cy={60} r="2.5" fill="#facc15" />
              <path d={`M${x - 6} 72 L${x} 78 L${x + 6} 72`} stroke="#e2e8f0" strokeWidth="2" fill="none" />
            </g>
          ))}
          <path d="M168 120 Q200 100 210 130" stroke="#44403c" strokeWidth="8" fill="none" />
        </Frame>
      );
    case "gnome":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="128" rx="36" ry="18" fill="#166534" />
          <path d="M92 128 V96 H148 V128" fill="#2563eb" />
          <circle cx="120" cy="84" r="18" fill="#fdba74" />
          <path d="M104 88 Q120 112 136 88" fill="#e2e8f0" />
          <path d="M120 28 L146 84 H94 Z" fill="#dc2626" />
          <circle cx="120" cy="24" r="6" fill="#e2e8f0" />
        </Frame>
      );
    case "leprechaun":
      return (
        <Frame label={label}>
          <path d="M88 150 V92 H152 V150" fill="#16a34a" />
          <rect x="96" y="112" width="48" height="10" fill="#1e293b" />
          <rect x="112" y="106" width="16" height="22" rx="2" fill="#facc15" />
          <circle cx="120" cy="72" r="18" fill="#fdba74" />
          <path d="M104 78 Q120 100 136 78" fill="#f97316" />
          <path d="M86 70 H154 L146 48 H120 L108 36 H96 Z" fill="#166534" />
          <rect x="86" y="66" width="68" height="8" fill="#14532d" />
        </Frame>
      );
    case "angel":
      return (
        <Frame label={label}>
          <ellipse cx="62" cy="86" rx="36" ry="18" fill="#e2e8f0" transform="rotate(-28 62 86)" />
          <ellipse cx="178" cy="86" rx="36" ry="18" fill="#e2e8f0" transform="rotate(28 178 86)" />
          <path d="M104 70 L120 140 L136 70 Z" fill="#fde68a" />
          <circle cx="120" cy="52" r="16" fill="#fdba74" />
          <ellipse cx="120" cy="30" rx="14" ry="5" fill="none" stroke="#facc15" strokeWidth="3" />
          <path d="M108 44 Q120 34 132 44" fill="#facc15" />
        </Frame>
      );
    case "mummy":
      return (
        <Frame label={label}>
          <path d="M92 150 V70 H148 V150" fill="#e2e8f0" />
          <circle cx="120" cy="52" r="22" fill="#e2e8f0" />
          {[40, 56, 72, 96, 112, 128].map((y) => (
            <path key={y} d={`M${y < 80 ? 100 : 90} ${y} H${y < 80 ? 140 : 150}`} stroke="#d6d3d1" strokeWidth="4" />
          ))}
          <path d="M108 50 H116" stroke="#1e293b" strokeWidth="3" />
          <path d="M126 50 H134" stroke="#1e293b" strokeWidth="3" />
          <path d="M86 110 L62 96" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        </Frame>
      );
    case "sea-serpent":
      return (
        <Frame label={label}>
          <path d="M0 124 H240 V160 H0 Z" fill="#0284c7" />
          <path d="M20 108 Q50 70 80 108 Q110 146 140 108 Q170 70 200 108" stroke="#0e7490" strokeWidth="16" fill="none" strokeLinecap="round" />
          <circle cx="208" cy="96" r="16" fill="#155e75" />
          <circle cx="214" cy="92" r="3" fill="#facc15" />
          <path d="M222 100 L236 96" stroke="#ef4444" strokeWidth="3" />
        </Frame>
      );
    case "harpy":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="108" rx="28" ry="22" fill="#a16207" />
          <path d="M96 100 Q48 70 28 40 Q80 72 100 96 Z" fill="#d97706" />
          <path d="M144 100 Q196 68 220 36 Q168 74 140 96 Z" fill="#d97706" />
          <circle cx="120" cy="58" r="16" fill="#fdba74" />
          <path d="M106 50 Q120 36 134 50" fill="#78350f" />
          <path d="M112 118 L100 142 M128 118 L140 142" stroke="#78350f" strokeWidth="4" />
        </Frame>
      );
    case "chimera":
      return (
        <Frame label={label}>
          <path d="M40 118 L78 86 L120 98 L156 80 L176 112 L148 128 L112 118 L90 136 L60 122 Z" fill="#d97706" />
          <circle cx="168" cy="64" r="16" fill="#b45309" />
          <circle cx="128" cy="48" r="12" fill="#e2e8f0" />
          <path d="M118 42 L114 28 L130 40" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <path d="M40 112 Q20 90 28 70 Q40 96 52 108" stroke="#16a34a" strokeWidth="8" fill="none" />
          <circle cx="174" cy="60" r="2" fill="#1e293b" />
        </Frame>
      );
    case "basilisk":
      return (
        <Frame label={label}>
          <path d="M36 110 Q70 70 110 100 Q150 132 190 96 Q210 80 220 96" stroke="#65a30d" strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="196" cy="70" r="18" fill="#facc15" />
          <path d="M184 62 L196 36 L208 62 Z" fill="#ef4444" />
          <path d="M180 78 L168 70 L186 86 Z" fill="#f97316" />
          <circle cx="202" cy="68" r="2.5" fill="#1e293b" />
        </Frame>
      );
    case "bigfoot":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="100" rx="40" ry="46" fill="#78350f" />
          <circle cx="120" cy="46" r="24" fill="#92400e" />
          <circle cx="110" cy="44" r="4" fill="#1e293b" />
          <circle cx="130" cy="44" r="4" fill="#1e293b" />
          <ellipse cx="120" cy="58" rx="8" ry="5" fill="#44403c" />
          <path d="M82 96 L48 70" stroke="#78350f" strokeWidth="16" strokeLinecap="round" />
          <path d="M158 96 L192 70" stroke="#78350f" strokeWidth="16" strokeLinecap="round" />
          <ellipse cx="96" cy="148" rx="18" ry="8" fill="#451a03" />
          <ellipse cx="146" cy="148" rx="18" ry="8" fill="#451a03" />
        </Frame>
      );
    default:
      return null;
  }
}

export function MythPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof CREATURES)[number]["title"]);
  if (!id) return null;
  return picture(id, name);
}
