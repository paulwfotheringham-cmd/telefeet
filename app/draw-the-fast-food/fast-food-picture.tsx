import React, { type ReactNode } from "react";
import { FOODS, type FoodId } from "@/lib/draw-the-fast-food/foods";

const TITLES = new Map(FOODS.map((food) => [food.title, food.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

function picture(id: FoodId, label: string) {
  switch (id) {
    case "pizza":
      return (
        <Frame label={label}>
          <path d="M48 36 H192 L120 142 Z" fill="#d97706" />
          <path d="M64 48 H176 L120 124 Z" fill="#dc2626" />
          <path d="M72 56 H168 L120 112 Z" fill="#fde68a" />
          <circle cx="108" cy="72" r="7" fill="#b91c1c" />
          <circle cx="132" cy="88" r="7" fill="#166534" />
          <circle cx="118" cy="98" r="6" fill="#b91c1c" />
        </Frame>
      );
    case "burger":
      return (
        <Frame label={label}>
          <path d="M58 62 Q120 28 182 62 Q170 78 120 78 Q70 78 58 62 Z" fill="#f59e0b" />
          <ellipse cx="120" cy="88" rx="58" ry="8" fill="#22c55e" />
          <ellipse cx="120" cy="100" rx="56" ry="8" fill="#ef4444" />
          <ellipse cx="120" cy="112" rx="58" ry="10" fill="#92400e" />
          <path d="M62 122 Q120 146 178 122 Q166 136 120 136 Q74 136 62 122 Z" fill="#d97706" />
          <ellipse cx="96" cy="58" rx="6" ry="3" fill="#fde68a" />
        </Frame>
      );
    case "hot-dog":
      return (
        <Frame label={label}>
          <path d="M36 78 Q48 48 120 48 Q192 48 204 78 Q192 112 120 112 Q48 112 36 78 Z" fill="#f59e0b" />
          <path d="M48 80 Q120 58 192 80 Q120 98 48 80 Z" fill="#b91c1c" />
          <path d="M70 70 Q100 86 130 68" stroke="#facc15" strokeWidth="4" fill="none" />
        </Frame>
      );
    case "fries":
      return (
        <Frame label={label}>
          <path d="M70 70 H170 L156 142 H84 Z" fill="#ef4444" />
          <path d="M78 78 H162 L152 134 H88 Z" fill="#fbbf24" />
          {[92, 108, 124, 140].map((x) => (
            <rect key={x} x={x} y={36} width="12" height="52" rx="4" fill="#f59e0b" />
          ))}
        </Frame>
      );
    case "taco":
      return (
        <Frame label={label}>
          <path d="M40 58 Q120 150 200 58 Q170 96 120 96 Q70 96 40 58 Z" fill="#d97706" />
          <path d="M58 64 Q120 124 182 64 Q156 90 120 90 Q84 90 58 64 Z" fill="#fde68a" />
          <path d="M70 70 Q120 108 170 70" stroke="#22c55e" strokeWidth="8" fill="none" />
          <circle cx="96" cy="78" r="5" fill="#ef4444" />
          <circle cx="140" cy="82" r="5" fill="#ef4444" />
        </Frame>
      );
    case "fried-chicken":
      return (
        <Frame label={label}>
          <path d="M70 90 Q48 50 96 40 Q120 70 150 36 Q190 58 176 100 Q150 130 110 128 Q70 124 70 90 Z" fill="#f59e0b" />
          <path d="M96 48 Q110 70 128 58" stroke="#d97706" strokeWidth="4" fill="none" />
          <ellipse cx="150" cy="78" rx="16" ry="10" fill="#fbbf24" />
          <path d="M78 96 Q100 110 124 96" stroke="#b45309" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "doughnut":
      return (
        <Frame label={label}>
          <circle cx="120" cy="82" r="52" fill="#f472b6" />
          <circle cx="120" cy="82" r="20" fill="#f8fafc" />
          <path d="M78 70 Q100 48 128 62" stroke="#fbcfe8" strokeWidth="8" fill="none" />
          {[96, 140, 150, 90].map((x, index) => (
            <rect key={x} x={x} y={48 + index * 12} width="6" height="10" rx="2" fill="#facc15" transform={`rotate(${index * 20} ${x} ${58 + index * 12})`} />
          ))}
        </Frame>
      );
    case "ice-cream":
      return (
        <Frame label={label}>
          <path d="M86 78 L120 146 L154 78 Z" fill="#d97706" />
          <path d="M96 90 L120 132 L144 90" stroke="#fde68a" strokeWidth="3" />
          <circle cx="96" cy="64" r="26" fill="#f9a8d4" />
          <circle cx="144" cy="64" r="26" fill="#e2e8f0" />
          <circle cx="120" cy="46" r="24" fill="#86efac" />
        </Frame>
      );
    case "milkshake":
      return (
        <Frame label={label}>
          <path d="M86 58 H154 L144 140 H96 Z" fill="#e2e8f0" />
          <path d="M92 78 H148 L140 132 H100 Z" fill="#ec4899" />
          <rect x="78" y="48" width="84" height="16" rx="4" fill="#f9a8d4" />
          <path d="M150 40 Q176 20 168 70" stroke="#ef4444" strokeWidth="5" fill="none" />
          <circle cx="120" cy="40" r="10" fill="#e2e8f0" />
        </Frame>
      );
    case "nuggets":
      return (
        <Frame label={label}>
          {[
            [70, 70],
            [120, 48],
            [168, 74],
            [86, 112],
            [140, 116],
          ].map(([x, y]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="28" ry="18" fill="#f59e0b" transform={`rotate(${x % 30} ${x} ${y})`} />
          ))}
        </Frame>
      );
    case "sandwich":
      return (
        <Frame label={label}>
          <path d="M40 58 H200 L184 82 H56 Z" fill="#f59e0b" />
          <rect x="56" y="82" width="128" height="14" fill="#22c55e" />
          <rect x="56" y="96" width="128" height="12" fill="#ef4444" />
          <rect x="56" y="108" width="128" height="12" fill="#facc15" />
          <path d="M48 120 H192 L176 142 H64 Z" fill="#d97706" />
        </Frame>
      );
    case "burrito":
      return (
        <Frame label={label}>
          <path d="M36 80 Q70 40 140 52 Q200 64 204 90 Q170 124 90 118 Q40 112 36 80 Z" fill="#d97706" />
          <path d="M70 78 Q130 64 176 84" stroke="#92400e" strokeWidth="4" fill="none" />
          <path d="M48 96 Q70 108 86 96" fill="#22c55e" />
          <path d="M56 88 Q72 100 80 86" fill="#ef4444" />
        </Frame>
      );
    case "nachos":
      return (
        <Frame label={label}>
          <path d="M48 120 L96 40 L112 120 Z" fill="#facc15" />
          <path d="M104 120 L140 36 L168 120 Z" fill="#fbbf24" />
          <path d="M150 120 L188 58 L208 120 Z" fill="#f59e0b" />
          <ellipse cx="120" cy="100" rx="22" ry="10" fill="#ef4444" />
          <circle cx="160" cy="92" r="8" fill="#22c55e" />
          <circle cx="86" cy="96" r="7" fill="#dc2626" />
        </Frame>
      );
    case "onion-rings":
      return (
        <Frame label={label}>
          {[
            [80, 78],
            [130, 64],
            [168, 96],
            [104, 112],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="28" fill="#f59e0b" />
              <circle cx={x} cy={y} r="12" fill="#f8fafc" />
            </g>
          ))}
        </Frame>
      );
    case "popcorn":
      return (
        <Frame label={label}>
          <path d="M78 78 H162 L148 142 H92 Z" fill="#ef4444" />
          <path d="M86 86 H154 L144 132 H96 Z" fill="#e2e8f0" />
          {[78, 108, 138, 168, 96, 128, 156].map((x, index) => (
            <circle key={x} cx={x} cy={index < 4 ? 62 : 48} r="16" fill="#fde68a" />
          ))}
        </Frame>
      );
    case "pretzel":
      return (
        <Frame label={label}>
          <path
            d="M70 48 Q40 90 78 112 Q100 128 120 100 Q140 128 162 112 Q200 90 170 48 Q150 28 120 70 Q90 28 70 48 Z"
            fill="#d97706"
          />
          <circle cx="92" cy="70" r="3" fill="#fde68a" />
          <circle cx="148" cy="70" r="3" fill="#fde68a" />
          <circle cx="120" cy="96" r="3" fill="#fde68a" />
          <circle cx="108" cy="56" r="3" fill="#fde68a" />
        </Frame>
      );
    case "kebab":
      return (
        <Frame label={label}>
          <rect x="114" y="18" width="8" height="128" rx="3" fill="#78716c" />
          <ellipse cx="118" cy="40" rx="28" ry="12" fill="#92400e" />
          <ellipse cx="118" cy="64" rx="30" ry="12" fill="#ef4444" />
          <ellipse cx="118" cy="88" rx="28" ry="12" fill="#22c55e" />
          <ellipse cx="118" cy="112" rx="30" ry="12" fill="#f59e0b" />
          <ellipse cx="118" cy="132" rx="22" ry="8" fill="#d97706" />
        </Frame>
      );
    case "fish-and-chips":
      return (
        <Frame label={label}>
          <path d="M36 96 H150 L136 140 H50 Z" fill="#ef4444" />
          <rect x="58" y="70" width="10" height="36" fill="#fbbf24" />
          <rect x="76" y="62" width="10" height="44" fill="#f59e0b" />
          <rect x="94" y="68" width="10" height="38" fill="#fbbf24" />
          <path d="M150 78 Q190 40 214 78 Q190 100 168 92 Q150 110 140 86 Z" fill="#f59e0b" />
          <circle cx="196" cy="70" r="3" fill="#1e293b" />
        </Frame>
      );
    case "pancakes":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="118" rx="70" ry="16" fill="#d97706" />
          <ellipse cx="120" cy="100" rx="66" ry="16" fill="#f59e0b" />
          <ellipse cx="120" cy="82" rx="62" ry="16" fill="#fbbf24" />
          <path d="M90 70 Q120 96 150 68" stroke="#92400e" strokeWidth="6" fill="none" />
          <rect x="112" y="28" width="16" height="28" rx="4" fill="#fde68a" />
        </Frame>
      );
    case "waffle":
      return (
        <Frame label={label}>
          <rect x="58" y="36" width="124" height="96" rx="16" fill="#d97706" />
          {[78, 102, 126, 150].map((x) => (
            <path key={x} d={`M${x} 44 V124`} stroke="#92400e" strokeWidth="4" />
          ))}
          {[56, 76, 96, 116].map((y) => (
            <path key={y} d={`M66 ${y} H172`} stroke="#92400e" strokeWidth="4" />
          ))}
          <circle cx="120" cy="86" r="6" fill="#fde68a" />
        </Frame>
      );
    case "cookie":
      return (
        <Frame label={label}>
          <circle cx="120" cy="82" r="52" fill="#d97706" />
          {[
            [96, 64],
            [140, 70],
            [108, 100],
            [146, 104],
            [122, 84],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="#78350f" />
          ))}
        </Frame>
      );
    case "cupcake":
      return (
        <Frame label={label}>
          <path d="M78 86 H162 L148 140 H92 Z" fill="#f9a8d4" />
          <path d="M86 96 H154 L146 128 H94 Z" fill="#fde68a" />
          <path d="M70 86 Q90 40 120 70 Q150 36 174 86 Z" fill="#ec4899" />
          <circle cx="120" cy="48" r="8" fill="#ef4444" />
        </Frame>
      );
    case "wrap":
      return (
        <Frame label={label}>
          <path d="M48 96 Q90 40 160 56 Q210 72 188 108 Q140 140 70 120 Q36 112 48 96 Z" fill="#86efac" />
          <path d="M70 90 Q130 70 176 92" stroke="#166534" strokeWidth="4" fill="none" />
          <path d="M64 108 Q80 96 92 110" fill="#ef4444" />
        </Frame>
      );
    case "quesadilla":
      return (
        <Frame label={label}>
          <path d="M36 80 Q120 20 204 80 Q120 110 36 80 Z" fill="#f59e0b" />
          <path d="M56 80 Q120 42 184 80" stroke="#92400e" strokeWidth="3" fill="none" />
          <path d="M120 48 V96" stroke="#d97706" strokeWidth="3" />
          <circle cx="96" cy="74" r="5" fill="#facc15" />
          <circle cx="144" cy="74" r="5" fill="#facc15" />
        </Frame>
      );
    case "spring-roll":
      return (
        <Frame label={label}>
          <rect x="48" y="58" width="144" height="44" rx="22" fill="#fde68a" transform="rotate(-18 120 80)" />
          <rect x="150" y="48" width="28" height="28" rx="8" fill="#22c55e" transform="rotate(-18 164 62)" />
          <path d="M70 96 Q120 112 170 88" stroke="#d97706" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "noodles":
      return (
        <Frame label={label}>
          <path d="M48 78 H192 L176 140 H64 Z" fill="#e2e8f0" />
          <path d="M64 90 H176 L166 128 H74 Z" fill="#fde68a" />
          <path d="M80 100 Q110 116 140 98 Q160 112 150 124" stroke="#f59e0b" strokeWidth="4" fill="none" />
          <path d="M90 70 Q100 40 120 58 Q140 36 150 68" stroke="#ef4444" strokeWidth="4" fill="none" />
        </Frame>
      );
    case "sausage-roll":
      return (
        <Frame label={label}>
          <rect x="36" y="62" width="168" height="48" rx="16" fill="#f59e0b" />
          <path d="M48 78 H192" stroke="#d97706" strokeWidth="3" />
          <path d="M48 94 H192" stroke="#d97706" strokeWidth="3" />
          <ellipse cx="196" cy="86" rx="16" ry="20" fill="#b91c1c" />
          <path d="M60 70 L72 102 M90 70 L102 102 M120 70 L132 102" stroke="#92400e" strokeWidth="2" />
        </Frame>
      );
    case "corn-dog":
      return (
        <Frame label={label}>
          <rect x="112" y="108" width="10" height="36" rx="3" fill="#78350f" />
          <rect x="86" y="28" width="62" height="90" rx="28" fill="#f59e0b" />
          <path d="M98 48 H136 M98 68 H136 M98 88 H136" stroke="#d97706" strokeWidth="3" />
        </Frame>
      );
    case "churros":
      return (
        <Frame label={label}>
          {[
            [70, 40, 20],
            [120, 28, -8],
            [160, 48, 16],
          ].map(([x, y, rot]) => (
            <rect key={x} x={x} y={y} width="22" height="100" rx="10" fill="#d97706" transform={`rotate(${rot} ${x + 11} ${y + 50})`} />
          ))}
          <path d="M78 70 Q120 90 168 64" stroke="#fde68a" strokeWidth="6" fill="none" />
        </Frame>
      );
    case "sundae":
      return (
        <Frame label={label}>
          <path d="M70 78 H170 L150 140 H90 Z" fill="#e2e8f0" />
          <path d="M82 96 H158 L146 128 H94 Z" fill="#f9a8d4" />
          <ellipse cx="120" cy="70" rx="50" ry="16" fill="#e2e8f0" />
          <circle cx="120" cy="48" r="20" fill="#fde68a" />
          <circle cx="120" cy="28" r="8" fill="#ef4444" />
        </Frame>
      );
    case "soft-drink":
      return (
        <Frame label={label}>
          <path d="M82 46 H158 L146 140 H94 Z" fill="#ef4444" />
          <rect x="74" y="36" width="92" height="16" rx="4" fill="#dc2626" />
          <path d="M150 28 Q184 8 176 64" stroke="#e2e8f0" strokeWidth="6" fill="none" />
          <rect x="98" y="70" width="44" height="28" rx="4" fill="#fde68a" />
        </Frame>
      );
    case "coffee":
      return (
        <Frame label={label}>
          <path d="M64 58 H156 L146 132 H74 Z" fill="#e2e8f0" />
          <path d="M76 74 H144 L138 120 H82 Z" fill="#92400e" />
          <path d="M156 78 H176 Q196 96 176 114 H156" stroke="#cbd5e1" strokeWidth="8" fill="none" />
          <path d="M96 48 Q104 28 112 48" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <path d="M120 44 Q128 24 136 44" stroke="#94a3b8" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "wings":
      return (
        <Frame label={label}>
          <path d="M36 96 Q70 40 120 70 Q90 100 70 120 Z" fill="#f59e0b" />
          <path d="M204 96 Q170 40 120 70 Q150 100 170 120 Z" fill="#d97706" />
          <path d="M48 90 Q80 70 108 82" stroke="#92400e" strokeWidth="3" fill="none" />
          <path d="M192 90 Q160 70 132 82" stroke="#92400e" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "slushie":
      return (
        <Frame label={label}>
          <path d="M78 50 H162 L146 140 H94 Z" fill="#67e8f9" />
          <path d="M90 78 H150 L140 124 H100 Z" fill="#22d3ee" />
          <rect x="70" y="40" width="100" height="14" rx="4" fill="#0891b2" />
          <path d="M156 36 Q186 16 178 70" stroke="#e2e8f0" strokeWidth="5" fill="none" />
          <circle cx="110" cy="96" r="6" fill="#e2e8f0" />
          <circle cx="132" cy="108" r="5" fill="#e2e8f0" />
        </Frame>
      );
    case "hash-brown":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="86" rx="70" ry="40" fill="#d97706" />
          <path d="M70 78 Q100 96 130 74 Q160 98 180 80" stroke="#92400e" strokeWidth="4" fill="none" />
          <path d="M78 100 Q120 112 168 96" stroke="#b45309" strokeWidth="3" fill="none" />
          <ellipse cx="96" cy="70" rx="10" ry="6" fill="#fbbf24" />
        </Frame>
      );
    case "apple-pie":
      return (
        <Frame label={label}>
          <path d="M40 78 H200 L176 132 H64 Z" fill="#d97706" />
          <path d="M56 86 H184 L168 120 H72 Z" fill="#f59e0b" />
          <path d="M64 78 Q90 48 120 78 Q150 48 176 78" fill="#fbbf24" />
          <path d="M80 70 L104 100 M120 62 V104 M136 70 L160 100" stroke="#92400e" strokeWidth="3" />
          <circle cx="120" cy="40" r="6" fill="#16a34a" />
        </Frame>
      );
    default:
      return null;
  }
}

export function FastFoodPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof FOODS)[number]["title"]);
  if (!id) return null;
  return picture(id, name);
}
