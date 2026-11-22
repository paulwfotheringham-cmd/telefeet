import React, { type ReactNode } from "react";
import { FLOWERS, type FlowerId } from "@/lib/draw-the-flower/flowers";

const TITLES = new Map(FLOWERS.map((flower) => [flower.title, flower.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function petals(cx: number, cy: number, count: number, rx: number, ry: number, orbit: number, fill: string) {
  return Array.from({ length: count }, (_, index) => (
    <ellipse
      key={index}
      cx={cx}
      cy={cy - orbit}
      rx={rx}
      ry={ry}
      fill={fill}
      transform={`rotate(${(360 / count) * index} ${cx} ${cy})`}
    />
  ));
}

function picture(id: FlowerId, label: string) {
  switch (id) {
    case "rose":
      return (
        <Frame label={label}>
          <path d="M120 96 C118 120 96 136 84 150" stroke="#15803d" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="96" cy="118" rx="18" ry="8" fill="#16a34a" transform="rotate(-40 96 118)" />
          <ellipse cx="138" cy="132" rx="18" ry="8" fill="#166534" transform="rotate(30 138 132)" />
          <circle cx="120" cy="62" r="34" fill="#9f1239" />
          <circle cx="120" cy="62" r="22" fill="#e11d48" />
          <path d="M108 62 Q120 48 132 62 Q120 76 108 62 Z" fill="#fb7185" />
        </Frame>
      );
    case "tulip":
      return (
        <Frame label={label}>
          <path d="M120 92 V148" stroke="#15803d" strokeWidth="5" />
          <ellipse cx="92" cy="118" rx="22" ry="8" fill="#16a34a" transform="rotate(-50 92 118)" />
          <ellipse cx="148" cy="118" rx="22" ry="8" fill="#16a34a" transform="rotate(50 148 118)" />
          <path d="M86 78 Q84 28 120 24 Q156 28 154 78 Q142 98 120 102 Q98 98 86 78 Z" fill="#dc2626" />
          <path d="M120 28 V92" stroke="#b91c1c" strokeWidth="3" />
        </Frame>
      );
    case "sunflower":
      return (
        <Frame label={label}>
          <path d="M120 112 V150" stroke="#15803d" strokeWidth="6" />
          <ellipse cx="96" cy="128" rx="22" ry="8" fill="#166534" transform="rotate(-35 96 128)" />
          {petals(120, 68, 16, 10, 20, 36, "#facc15")}
          <circle cx="120" cy="68" r="22" fill="#78350f" />
          <circle cx="114" cy="64" r="3" fill="#451a03" />
          <circle cx="126" cy="72" r="3" fill="#451a03" />
        </Frame>
      );
    case "daisy":
      return (
        <Frame label={label}>
          <path d="M120 100 V150" stroke="#15803d" strokeWidth="4" />
          {petals(120, 64, 10, 8, 26, 30, "#e2e8f0")}
          <circle cx="120" cy="64" r="14" fill="#facc15" />
        </Frame>
      );
    case "daffodil":
      return (
        <Frame label={label}>
          <path d="M120 108 V150" stroke="#15803d" strokeWidth="5" />
          {petals(120, 62, 6, 12, 24, 28, "#fde68a")}
          <ellipse cx="120" cy="66" rx="16" ry="18" fill="#f97316" />
          <ellipse cx="120" cy="62" rx="8" ry="8" fill="#fdba74" />
        </Frame>
      );
    case "lily":
      return (
        <Frame label={label}>
          <path d="M120 108 V150" stroke="#15803d" strokeWidth="5" />
          {petals(120, 64, 6, 10, 30, 8, "#fb7185")}
          <path stroke="#78350f" strokeWidth="2" d="M120 64 L108 40 M120 64 L132 38 M120 64 L120 36" />
          <circle cx="108" cy="40" r="3" fill="#a16207" />
          <circle cx="132" cy="38" r="3" fill="#a16207" />
          <circle cx="120" cy="36" r="3" fill="#a16207" />
        </Frame>
      );
    case "orchid":
      return (
        <Frame label={label}>
          <path d="M120 96 V150" stroke="#15803d" strokeWidth="4" />
          <ellipse cx="86" cy="58" rx="22" ry="12" fill="#f9a8d4" transform="rotate(-30 86 58)" />
          <ellipse cx="154" cy="58" rx="22" ry="12" fill="#f9a8d4" transform="rotate(30 154 58)" />
          <ellipse cx="120" cy="42" rx="10" ry="18" fill="#ec4899" />
          <ellipse cx="120" cy="78" rx="18" ry="22" fill="#db2777" />
          <ellipse cx="120" cy="84" rx="8" ry="10" fill="#fbcfe8" />
          <circle cx="120" cy="70" r="4" fill="#fde68a" />
        </Frame>
      );
    case "poppy":
      return (
        <Frame label={label}>
          <path d="M120 100 V150" stroke="#15803d" strokeWidth="4" />
          <ellipse cx="96" cy="62" rx="28" ry="22" fill="#dc2626" />
          <ellipse cx="144" cy="62" rx="28" ry="22" fill="#b91c1c" />
          <ellipse cx="120" cy="48" rx="22" ry="18" fill="#ef4444" />
          <ellipse cx="120" cy="78" rx="20" ry="16" fill="#991b1b" />
          <circle cx="120" cy="64" r="10" fill="#1e293b" />
          <path stroke="#334155" strokeWidth="2" d="M120 56 V72 M112 64 H128" />
        </Frame>
      );
    case "lavender":
      return (
        <Frame label={label}>
          {[78, 120, 162].map((x, index) => (
            <g key={x}>
              <path d={`M${x} 150 V${70 - index * 4}`} stroke="#15803d" strokeWidth="3" />
              {Array.from({ length: 8 }, (_, row) => (
                <ellipse key={row} cx={x} cy={28 + row * 8} rx="8" ry="5" fill={row % 2 ? "#7c3aed" : "#a78bfa"} />
              ))}
            </g>
          ))}
        </Frame>
      );
    case "bluebell":
      return (
        <Frame label={label}>
          <path d="M150 150 Q120 90 96 36" stroke="#15803d" strokeWidth="4" fill="none" />
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={index}
              d={`M${108 - index * 6} ${48 + index * 16} q10 16 0 28 q-14 -8 -8 -28 z`}
              fill={index % 2 ? "#2563eb" : "#60a5fa"}
            />
          ))}
        </Frame>
      );
    case "carnation":
      return (
        <Frame label={label}>
          <path d="M120 108 V150" stroke="#15803d" strokeWidth="4" />
          <path
            d="M120 24 L132 44 L154 40 L142 58 L164 72 L140 76 L148 98 L120 84 L92 98 L100 76 L76 72 L98 58 L86 40 L108 44 Z"
            fill="#f472b6"
          />
          <circle cx="120" cy="66" r="16" fill="#ec4899" />
        </Frame>
      );
    case "peony":
      return (
        <Frame label={label}>
          <path d="M120 118 V150" stroke="#15803d" strokeWidth="5" />
          <ellipse cx="92" cy="132" rx="20" ry="8" fill="#166534" transform="rotate(-25 92 132)" />
          {petals(120, 68, 12, 16, 28, 18, "#fbcfe8")}
          {petals(120, 68, 8, 12, 18, 8, "#f9a8d4")}
          <circle cx="120" cy="68" r="12" fill="#f472b6" />
        </Frame>
      );
    case "iris":
      return (
        <Frame label={label}>
          <path d="M120 110 V150" stroke="#15803d" strokeWidth="4" />
          <ellipse cx="120" cy="36" rx="12" ry="22" fill="#7c3aed" />
          <ellipse cx="96" cy="48" rx="10" ry="20" fill="#6d28d9" transform="rotate(-28 96 48)" />
          <ellipse cx="144" cy="48" rx="10" ry="20" fill="#6d28d9" transform="rotate(28 144 48)" />
          <ellipse cx="92" cy="84" rx="14" ry="26" fill="#4c1d95" transform="rotate(24 92 84)" />
          <ellipse cx="148" cy="84" rx="14" ry="26" fill="#4c1d95" transform="rotate(-24 148 84)" />
          <ellipse cx="120" cy="92" rx="12" ry="24" fill="#5b21b6" />
          <path d="M120 78 V104" stroke="#facc15" strokeWidth="4" />
        </Frame>
      );
    case "hyacinth":
      return (
        <Frame label={label}>
          <path d="M120 118 V150" stroke="#15803d" strokeWidth="5" />
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: row < 2 ? row + 1 : 3 }, (_, col) => {
              const count = row < 2 ? row + 1 : 3;
              const x = 120 - (count - 1) * 10 + col * 20;
              return <circle key={`${row}-${col}`} cx={x} cy={28 + row * 14} r="8" fill={row % 2 ? "#f472b6" : "#db2777"} />;
            }),
          )}
        </Frame>
      );
    case "chrysanthemum":
      return (
        <Frame label={label}>
          <path d="M120 116 V150" stroke="#15803d" strokeWidth="4" />
          {petals(120, 70, 20, 4, 34, 10, "#fb923c")}
          {petals(120, 70, 14, 5, 22, 6, "#f97316")}
          <circle cx="120" cy="70" r="10" fill="#ea580c" />
        </Frame>
      );
    case "marigold":
      return (
        <Frame label={label}>
          <path d="M120 108 V150" stroke="#15803d" strokeWidth="4" />
          <path d="M70 140 Q90 120 110 140 Q96 124 80 128" fill="#166534" />
          <path d="M170 140 Q150 120 130 140 Q144 124 160 128" fill="#166534" />
          {petals(120, 62, 14, 8, 16, 16, "#f59e0b")}
          <circle cx="120" cy="62" r="14" fill="#d97706" />
        </Frame>
      );
    case "pansy":
      return (
        <Frame label={label}>
          <path d="M120 108 V150" stroke="#15803d" strokeWidth="4" />
          <ellipse cx="100" cy="48" rx="22" ry="18" fill="#4c1d95" />
          <ellipse cx="140" cy="48" rx="22" ry="18" fill="#5b21b6" />
          <ellipse cx="86" cy="74" rx="16" ry="14" fill="#7c3aed" />
          <ellipse cx="154" cy="74" rx="16" ry="14" fill="#7c3aed" />
          <ellipse cx="120" cy="86" rx="20" ry="18" fill="#facc15" />
          <circle cx="110" cy="80" r="4" fill="#1e293b" />
          <circle cx="130" cy="80" r="4" fill="#1e293b" />
        </Frame>
      );
    case "violet":
      return (
        <Frame label={label}>
          <path d="M70 150 Q90 110 120 100 Q150 110 170 150" fill="#166534" />
          <path d="M78 148 Q96 118 110 128 Q92 140 78 148" fill="#15803d" />
          <path d="M162 148 Q144 118 130 128 Q148 140 162 148" fill="#15803d" />
          {petals(120, 62, 5, 12, 16, 16, "#7c3aed")}
          <circle cx="120" cy="62" r="6" fill="#c4b5fd" />
        </Frame>
      );
    case "snowdrop":
      return (
        <Frame label={label}>
          <path d="M120 40 V150" stroke="#15803d" strokeWidth="4" />
          <path d="M120 48 Q96 70 100 96 Q120 84 140 96 Q144 70 120 48 Z" fill="#e2e8f0" />
          <path d="M108 88 Q120 78 132 88" stroke="#16a34a" strokeWidth="3" fill="none" />
          <ellipse cx="96" cy="70" rx="14" ry="6" fill="#166534" transform="rotate(-20 96 70)" />
        </Frame>
      );
    case "buttercup":
      return (
        <Frame label={label}>
          <path d="M120 96 V150" stroke="#15803d" strokeWidth="4" />
          {petals(120, 58, 5, 16, 16, 18, "#facc15")}
          <circle cx="120" cy="58" r="8" fill="#65a30d" />
        </Frame>
      );
    case "foxglove":
      return (
        <Frame label={label}>
          <path d="M108 150 V28" stroke="#15803d" strokeWidth="4" />
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <g key={index}>
              <path d={`M108 ${36 + index * 18} q22 6 22 16 q-10 8 -22 2 z`} fill={index % 2 ? "#db2777" : "#f472b6"} />
              <circle cx={122} cy={48 + index * 18} r="2" fill="#1e293b" />
            </g>
          ))}
        </Frame>
      );
    case "hibiscus":
      return (
        <Frame label={label}>
          {petals(120, 74, 5, 18, 32, 8, "#f43f5e")}
          <circle cx="120" cy="74" r="8" fill="#9f1239" />
          <path d="M120 74 H176" stroke="#be123c" strokeWidth="4" />
          <circle cx="178" cy="74" r="5" fill="#facc15" />
          <ellipse cx="70" cy="130" rx="28" ry="12" fill="#166534" />
        </Frame>
      );
    case "lotus":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#0284c7" />
          <ellipse cx="70" cy="46" rx="14" ry="36" fill="#f9a8d4" transform="rotate(-28 70 80)" />
          <ellipse cx="170" cy="46" rx="14" ry="36" fill="#f9a8d4" transform="rotate(28 170 80)" />
          <ellipse cx="96" cy="40" rx="14" ry="40" fill="#ec4899" transform="rotate(-12 96 80)" />
          <ellipse cx="144" cy="40" rx="14" ry="40" fill="#ec4899" transform="rotate(12 144 80)" />
          <ellipse cx="120" cy="36" rx="14" ry="42" fill="#fbcfe8" />
        </Frame>
      );
    case "cherry-blossom":
      return (
        <Frame label={label}>
          <path d="M20 130 Q80 90 140 70 T220 30" stroke="#78350f" strokeWidth="6" fill="none" />
          {[
            [70, 96],
            [120, 72],
            [168, 52],
            [200, 36],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              {petals(x!, y!, 5, 6, 8, 8, "#f9a8d4")}
              <circle cx={x} cy={y} r="3" fill="#fbcfe8" />
            </g>
          ))}
        </Frame>
      );
    case "dandelion":
      return (
        <Frame label={label}>
          <path d="M40 150 Q70 110 90 150 Q70 124 56 136" fill="#166534" />
          <path d="M200 150 Q170 108 148 150 Q172 122 186 136" fill="#166534" />
          <path d="M120 108 V150" stroke="#15803d" strokeWidth="4" />
          {petals(120, 62, 18, 6, 16, 22, "#facc15")}
          <circle cx="120" cy="62" r="12" fill="#eab308" />
        </Frame>
      );
    case "crocus":
      return (
        <Frame label={label}>
          <rect x="0" y="118" width="240" height="42" fill="#78350f" />
          <path d="M92 122 Q88 70 120 62 Q152 70 148 122 Z" fill="#7c3aed" />
          <path d="M120 66 V108" stroke="#facc15" strokeWidth="3" />
          <path d="M112 70 Q120 90 128 70" stroke="#c4b5fd" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "geranium":
      return (
        <Frame label={label}>
          <circle cx="70" cy="118" r="22" fill="#166534" />
          <circle cx="170" cy="118" r="22" fill="#15803d" />
          {[
            [90, 48],
            [140, 42],
            [120, 72],
            [78, 74],
            [164, 70],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              {petals(x!, y!, 5, 6, 8, 8, "#ef4444")}
              <circle cx={x} cy={y} r="3" fill="#fecaca" />
            </g>
          ))}
        </Frame>
      );
    case "magnolia":
      return (
        <Frame label={label}>
          <path d="M16 120 Q80 80 150 60 T224 40" stroke="#44403c" strokeWidth="7" fill="none" />
          <ellipse cx="78" cy="88" rx="16" ry="28" fill="#e7e5e4" transform="rotate(-20 78 88)" />
          <ellipse cx="96" cy="80" rx="14" ry="26" fill="#d6d3d1" transform="rotate(16 96 80)" />
          <ellipse cx="168" cy="48" rx="14" ry="24" fill="#e7e5e4" transform="rotate(-10 168 48)" />
          <ellipse cx="186" cy="42" rx="12" ry="22" fill="#d6d3d1" transform="rotate(18 186 42)" />
        </Frame>
      );
    case "water-lily":
      return (
        <Frame label={label}>
          <rect x="0" y="96" width="240" height="64" fill="#0284c7" />
          <ellipse cx="120" cy="108" rx="70" ry="22" fill="#166534" />
          <path d="M80 108 Q120 96 160 108" stroke="#14532d" strokeWidth="2" fill="none" />
          {petals(120, 78, 8, 10, 16, 14, "#f9a8d4")}
          <circle cx="120" cy="78" r="8" fill="#fbcfe8" />
        </Frame>
      );
    case "calla":
      return (
        <Frame label={label}>
          <path d="M120 150 Q110 100 120 70" stroke="#15803d" strokeWidth="5" fill="none" />
          <path d="M120 28 Q70 50 78 100 Q120 78 162 100 Q170 50 120 28 Z" fill="#e7e5e4" />
          <path d="M120 40 Q112 70 120 96" stroke="#facc15" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="150" cy="120" rx="22" ry="8" fill="#166534" transform="rotate(30 150 120)" />
        </Frame>
      );
    case "bird-of-paradise":
      return (
        <Frame label={label}>
          <path d="M40 130 Q80 110 120 100" stroke="#15803d" strokeWidth="5" fill="none" />
          <path d="M70 108 Q150 40 196 56 Q150 70 120 96 Z" fill="#166534" />
          <path d="M150 62 Q190 40 210 58 Q188 66 160 72 Z" fill="#f97316" />
          <path d="M156 70 Q188 78 206 66" stroke="#2563eb" strokeWidth="6" fill="none" />
          <path d="M168 74 Q186 90 176 96" stroke="#ea580c" strokeWidth="4" fill="none" />
        </Frame>
      );
    case "protea":
      return (
        <Frame label={label}>
          <path d="M120 112 V150" stroke="#15803d" strokeWidth="5" />
          {petals(120, 70, 12, 10, 28, 16, "#fda4af")}
          <ellipse cx="120" cy="74" rx="22" ry="26" fill="#9f1239" />
          <circle cx="112" cy="68" r="3" fill="#fecdd3" />
          <circle cx="126" cy="76" r="3" fill="#fecdd3" />
          <circle cx="118" cy="84" r="3" fill="#fecdd3" />
        </Frame>
      );
    case "camellia":
      return (
        <Frame label={label}>
          <ellipse cx="70" cy="120" rx="28" ry="14" fill="#14532d" transform="rotate(-20 70 120)" />
          <ellipse cx="176" cy="124" rx="28" ry="14" fill="#14532d" transform="rotate(24 176 124)" />
          {petals(124, 68, 8, 16, 22, 20, "#be123c")}
          {petals(124, 68, 6, 12, 14, 8, "#e11d48")}
          <circle cx="124" cy="68" r="8" fill="#fb7185" />
        </Frame>
      );
    case "freesia":
      return (
        <Frame label={label}>
          <path d="M70 150 Q100 90 150 40" stroke="#15803d" strokeWidth="4" fill="none" />
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={index}
              d={`M${112 + index * 14} ${96 - index * 16} q16 -4 18 12 q-16 10 -22 0 z`}
              fill={index % 2 ? "#fde68a" : "#facc15"}
            />
          ))}
        </Frame>
      );
    case "snapdragon":
      return (
        <Frame label={label}>
          <path d="M108 150 V24" stroke="#15803d" strokeWidth="4" />
          {[0, 1, 2, 3, 4].map((index) => (
            <g key={index}>
              <ellipse cx="128" cy={36 + index * 24} rx="20" ry="12" fill={index % 2 ? "#f472b6" : "#ec4899"} />
              <path d={`M116 ${40 + index * 24} H140`} stroke="#9d174d" strokeWidth="2" />
            </g>
          ))}
        </Frame>
      );
    case "cornflower":
      return (
        <Frame label={label}>
          <path d="M120 100 V150" stroke="#15803d" strokeWidth="4" />
          <path
            d="M120 20 L128 48 L158 40 L136 62 L164 82 L132 80 L140 110 L120 86 L100 110 L108 80 L76 82 L104 62 L82 40 L112 48 Z"
            fill="#2563eb"
          />
          <circle cx="120" cy="68" r="10" fill="#1d4ed8" />
        </Frame>
      );
    default:
      return null;
  }
}

export function FlowerPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof FLOWERS)[number]["title"]);
  if (!id) return null;
  return picture(id, name);
}
